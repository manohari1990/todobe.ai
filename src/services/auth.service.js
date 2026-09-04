import { userRegisterRepo, checkDuplicateUser, userLoginRepo, saveUserSessionRepo, getUserById, updateUserSessionRepo } from '../repositories/auth.repository.js'
import bcrypt from "bcrypt";
import {AppError} from "../config/AppError.js"
import { generateToken, verifyToken } from '../utils/jwt.js';
import {buildSessionMetadata} from '../utils/helpers.js'

export const userRegisterService = async (payload) => {
    // Check duplicate - select query compare email, username, loop through the result and response back with existing username & email
    try{
        const isDuplicateRec = await(checkDuplicateUser(payload.email, payload.username))
        if(isDuplicateRec){
            const error = {}
            for(const rec of isDuplicateRec) {
                if(rec.username === payload.username) error.username = "Username is already existed."
                if(rec.email === payload.email) error.email = "Email is already existed."
            }
            throw new AppError(409, "User already exists!", error)
        }
        console.info("INFO - No duplicates found!")    // Later Pino or Winston to production logs
    }catch(err){
        throw err
    }
    // Hash password - using bcrypt convert the password into hash and append the it to the payload
    const hashedPassword = await bcrypt.hash(payload.password, 10)
    const updatedPayload = {
        ...payload,
        password: hashedPassword
    }
    try {
        const response = await userRegisterRepo(updatedPayload)
        return response 
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const loginService = async(payload)=>{
    const response = await userLoginRepo(payload)   // returns user details based on username or email
    if(!response)
        throw new AppError(401, "Invalid Username/Email or Password.", {});

    const comparePassword = await bcrypt.compare(payload.password, response.password_hash)   // compares the user password & hashed password
    if(!comparePassword)
        throw new AppError(401, "Invalid Username/Email or Password.", {});
    if(response.user_status !== 'active')
        throw new AppError(401, "User status is unavailable, Please contact admin.",{});

    const {refresh_token, access_token} = generateToken({       // returns tokens 
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

export const saveUserSessionService = async(payload) =>{
    const updatedPayload = {
        ...payload,
        refresh_token_hash: await bcrypt.hash(payload.refresh_token_hash, 10)       // hash the refresh token to safely store into DB
    }
    try{
        const response = await saveUserSessionRepo(updatedPayload)                  // saves the new user session and returns new session details
        return response
    }catch(err){
        console.error(err)
        throw err
    }
}

export const userLogoutService = async(cookies) =>{
    try{
        const {sub, username} = verifyToken(cookies.access_token)   // extract the tokens from cookies and return sub/user_id & username
        const sessions = await getUserById(sub)                                     // return user session from DB based on sub/user_id
        if(sessions.length > 0){
            for(const session of sessions){
                const isMatched = await bcrypt.compare(cookies.refresh_token, session.refresh_token_hash)
                if(isMatched){
                    const updatedSession = await updateUserSessionRepo(session.session_id)      // update the refresh_token_hash to null and returns the session details
                    return updatedSession
                }
            }
        }
        return false
    }catch(err){
        throw err
    }
}

export const refreshAuthService = async(cookies)=>{
    try{
        const {sub, username} = await verifyToken(cookies.refresh_token, "refresh_token")
        if(sub){
            const sessions = await getUserById(sub)
            for(const session of sessions){
                const isMatched = await bcrypt.compare(cookies.refresh_token, session.refresh_token_hash)
                if(isMatched){
                    const {access_token} = await generateToken({sub: sub, username: username})
                    // console.log(access_token, "=====================new accesstoken")
                    return access_token
                }
            }
        }
        return false
    }catch(err){
        throw err
    }
}