import { AppError } from '../config/AppError.js';
import { userRegisterService, loginService, saveUserSessionService, userLogoutService, refreshAuthService } from '../services/auth.service.js'
import { validationResult } from "express-validator";
import {buildSessionMetadata} from '../utils/helpers.js'

export const userRegister = async (req, res) => {
    const validationRes = validationResult(req)
    if(!validationRes.isEmpty()){
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            error: validationRes.array()
        })
    }

    const payload = req.body
    try {
        const response = await userRegisterService(payload)
        return res.status(201).json(response)
    } catch (err) {
        if(err instanceof AppError){
            return res.status(err.statusCode).json({
                success: false,
                error: err.error,
                message: err.message
            })
        }
        res.status(500).json({
            message: 'Internal server error!',
            error: err,
            success: false
        })
    }
}


export const userLogin = async(req, res) =>{
    const validateRes = validationResult(req)       // express-validator method to validate the request body
    if(!validateRes.isEmpty())
        return res.status(400).json({
                success: false,
                message: "Validation errors",
                error: validateRes.array()
            })
    try{
        const userRequestDetails = buildSessionMetadata(req)        // Extracts and returns user-agent properties
        const {user, refresh_token, access_token} = await loginService(req.body)    // Perform fetching user based on username/email and returns user details and token
        const user_session = await saveUserSessionService({...userRequestDetails, 'refresh_token_hash': refresh_token, 'user_id': user.user_id})    // Saves the new session into database with user-agent details and token & returns the new session details
        const {password_hash, user_id, ...userData} = user
        res.cookie(
            'access_token',access_token,
            {
                'httpOnly': true,
                'sameSite': 'lax',
                'maxAge': process.env.JWT_ACCESS_COOKIE_MAX_AGE,
                'secure': false
            }
        )
        res.cookie(
            'refresh_token',refresh_token,
            {
                'httpOnly': true,
                'sameSite': 'lax',
                'maxAge': process.env.JWT_REFRESH_COOKIE_MAX_AGE,
                'secure': false
            }
        )
        return res.status(200).json({
            success: true,
            message: "Login successfully!",
            records: [userData]
        })
    }catch(err){
        if(err instanceof AppError){
            return res.status(err.statusCode).json({
                success: false,
                message: err.message,
                error: err.error
            })
        }
        return res.status(500).json({
            success:false,
            message: "Internal server error!",
            error: err
        })
    }
}


export const userLogout = async(req, res) => {
    try{
        const response = await userLogoutService(req.cookies)   // returns neccessary session details after user session(refresh_token_hash) updated in DB
        if(!response)
            return res.status(401).json({
                success: false,
                message:'Invalid Request'
            })
        res.clearCookie(
            'access_token',
            {
                'httpOnly': true,
                'sameSite': 'lax',
                'maxAge': new Date(0),
                'secure': false
            }
        )
        res.clearCookie(
            'refresh_token',
            {
                'httpOnly': true,
                'sameSite': 'lax',
                'maxAge': new Date(0),
                'secure': false
            }
        )
        return res.status(200).json({
            success: true,
            message: "User has been logout successfully!"
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: 'Logout request failed!'
        })
    }
}

export const refreshAuthToken = async(req, res) =>{
    try{
        const response = await refreshAuthService(req.cookies)
        if(!response)
            return res.status(401).json({
                success: false,
                message: "Unauthorised Request!"
            })
        res.cookie(
            'access_token', 
            response,
            {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: process.env.JWT_ACCESS_COOKIE_MAX_AGE
            }
        )
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully!",
        })
    }catch(err){        // handle 401 unauth
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}

