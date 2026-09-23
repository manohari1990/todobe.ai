import {
    userRegisterRepo,
    checkDuplicateUser,
    userLoginRepo,
    saveUserSessionRepo,
    getUserById,
    updateUserSessionRepo,
    setPasswordResetRepo,
    compareTokensRepo,
    updateUsersTableRepo,
    updateResetPasswordTable,
    checkEmailStatusRepo,
    userOAuthSaveRepo
} from '../repositories/auth.repository.js'
import bcrypt from "bcrypt";
import { AppError } from "../config/AppError.js"
import { generateToken, verifyToken } from '../utils/jwt.js';
import { SendEmail } from '../config/EmailService.js';
import crypto from 'crypto';
import {OAuth2Client} from 'google-auth-library'
import { access } from 'fs';

export const userRegisterService = async (payload) => {
    // Check duplicate - select query compare email, username, loop through the result and response back with existing username & email
    try {
        const isDuplicateRec = await (checkDuplicateUser(payload.email, payload.username))
        if (isDuplicateRec) {
            const error = {}
            for (const rec of isDuplicateRec) {
                if (rec.username === payload.username) error.username = "Username is already existed."
                if (rec.email === payload.email) error.email = "Email is already existed."
            }
            throw new AppError(409, "User already exists!", error)
        }
        console.info("INFO - No duplicates found!")    // Later Pino or Winston to production logs
    } catch (err) {
        throw err
    }
    // Hash password - using bcrypt convert the password into hash and append the it to the payload
    const hashedPassword = await bcrypt.hash(payload.password, 10)
    const updatedPayload = {
        ...payload,
        password_hash: hashedPassword
    }
    delete updatedPayload.password;
    try {
        const response = await userRegisterRepo(updatedPayload)
        return response
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const loginService = async (payload) => {
    console.log(payload,"==========payload")
    const response = await userLoginRepo(payload)   // returns user details based on username or email
    if (!response)
        throw new AppError(401, "Invalid Username/Email or Password.", {});

    const comparePassword = await bcrypt.compare(payload.password, response.password_hash)   // compares the user password & hashed password
    if (!comparePassword)
        throw new AppError(401, "Invalid Username/Email or Password.", {});
    if (response.user_status !== 'active')
        throw new AppError(401, "User status is unavailable, Please contact admin.", {});

    const { refresh_token, access_token } = generateToken({       // returns tokens 
        sub: response.user_id,
        username: response.username
    })
    // console.log(refresh_token, access_token,"=======================Tokens")
    return {
        user: response,
        refresh_token,
        access_token
    }
}

export const forgotPasswordService = async (request) => {
    try {
        const response = await setPasswordResetRepo(request.body)
        if (response.success) {
            const infoId = await SendEmail({
                ...response.records,
                ip_address: request.ip
            }, "FORGOT_PASSWORD")
            if(infoId){
                return {
                    success: true,
                    message: 'Reset Password link sent to your registered email-id.'
                }
            }
        }
    } catch (err) {
        throw err
    }
}

export const saveUserSessionService = async (payload) => {
    const updatedPayload = {
        ...payload,
        refresh_token_hash: await bcrypt.hash(payload.refresh_token_hash, 10)       // hash the refresh token to safely store into DB
    }
    try {
        const response = await saveUserSessionRepo(updatedPayload)                  // saves the new user session and returns new session details
        return response
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const userLogoutService = async (cookies) => {
    try {
        const { sub } = verifyToken(cookies.access_token)   // extract the tokens from cookies and return sub/user_id & username
        const sessions = await getUserById(sub)                     // return user session from DB based on sub/user_id
        if (sessions.length > 0) {
            for (const session of sessions) {
                const isMatched = session.refresh_token_hash && cookies.refresh_token ? await bcrypt.compare(cookies.refresh_token, session.refresh_token_hash) : false
                console.log(`isMatched: ${isMatched}`)
                if (isMatched) {
                    const updatedSession = await updateUserSessionRepo(session.session_id)      // update the refresh_token_hash to null and returns the session details
                    return updatedSession
                }
            }
        }
        return false
    } catch (err) {
        throw err
    }
}

export const refreshAuthService = async (cookies) => {
    try {
        const { sub, username } = await verifyToken(cookies.refresh_token, "refresh_token")
        if (sub) {
            const sessions = await getUserById(sub)
            for (const session of sessions) {
                const isMatched = session.refresh_token_hash && cookies.refresh_token ? await bcrypt.compare(cookies.refresh_token, session.refresh_token_hash) : false
                if (isMatched) {
                    const { access_token } = await generateToken({ sub: sub, username: username })
                    return access_token
                }
            }
        }
        return false
    } catch (err) {
        throw err
    }
}

export const resetPasswordService = async (payload) => {
    const hashedToken = crypto.createHash('sha256').update(payload.token).digest('hex')
    try {
        // get the actual token from db and compare it
        const tokenData = await compareTokensRepo(hashedToken)
        // Todo - check token expiry by comparing present datetime and tokanData expires_at
        // Right now directly validating using SQL query but no proper handling in UI
        if (!tokenData) {
            return {
                success: false,
                message: 'Token might expired! Try forget password again.'
            }
        }
        
        // Hash password - using bcrypt convert the password into hash and append the it to the payload
        const hashedPassword = await bcrypt.hash(payload.password, 10)
        // update new password in users table
        const updatedUserPassword = await updateUsersTableRepo({ password_hash: hashedPassword }, tokenData.user_id)
        // then update the used_at in user_password_reset_tokens table
        if (updatedUserPassword) {
            const updatedUserResetPassword = await updateResetPasswordTable({ used_at: new Date(Date.now()) }, tokenData.reset_id)
            if(updatedUserResetPassword){
                return {
                    success: true,
                    message: 'Password updated!'
                }
            }
        }
    } catch (err) {
        throw err
    }

}


export const googleAuthService = async(requestBody) =>{
    const {clientId, token} = requestBody
    const clientHandler = new OAuth2Client(clientId); 
    try{
        const ticket = await clientHandler.verifyIdToken({
            idToken: token,
            audience: clientId
        })
        const payload = ticket.getPayload();
        const userDataPayload = {
            username: payload.email,
            email: payload.email,
            first_name: payload.given_name,
            last_name: payload.family_name,
            profile_image: payload.picture,
        }
        const userOAuthPayload = {
            provider_identifier: 'google',
            provider_user_id: payload.sub,
        }
        if(userOAuthPayload && payload.email_verified){
            const userResponse = await checkEmailStatusRepo(userOAuthPayload, userDataPayload)
            if (userResponse){
                // user email is already existed
                // generate jwt token
                const {access_token, refresh_token} = generateToken({
                    sub: userResponse.user_id,
                    username: userResponse.username
                })
                return {
                    user: userResponse,
                    refresh_token,
                    access_token
                }
            }else{
                // user email is not existed - register as new user
                const registerResp = await userRegisterRepo(userDataPayload)
                // console.log(registerResp.records,"=================registerResp")
                if(registerResp.records){
                    const newOAuthRecord = await userOAuthSaveRepo({
                        ...userOAuthPayload,
                        user_id: registerResp.records.user_id
                    })
                    // console.log(newOAuthRecord,"=================newOAuthRecord")
                    if(newOAuthRecord){
                        const {access_token, refresh_token} = generateToken({
                            sub: registerResp.records.user_id,
                            username: registerResp.records.username
                        })
                        // console.log(access_token,"=================access_token")
                        return {
                            user: registerResp.records,
                            refresh_token,
                            access_token
                        }
                    }
                }
                
            }
        }
    }catch(err){
        throw err
    }
}

