import { query } from '../config/database.js'
import { buildInsertQuery } from '../utils/helpers.js'
import {NEW_UPDATE_USER_RETURN_FROM_DB} from '../Constant.js'

export const userRegisterRepo = async (payload) => {
    const {sql, values} = buildInsertQuery(payload, "users", NEW_UPDATE_USER_RETURN_FROM_DB)
    console.log(sql, values)
    // SQL to save new user
    try{
        const response = await query(sql, values)
        return (response.rows.length > 0) ? {
            'success': true,
            'records': response.rows[0],
            'message': 'New user created successfully!'
        }:{
            'success': true,
            'records': []
        }
    } catch (err) {
        console.error(err)
        if (err.code === '23505') {
            throw new AppError(409, 'Username or email already exists');
        }
        throw err
    }
}


export const checkDuplicateUser = async(email, username) =>{
    const sql = `SELECT email, username FROM users WHERE email = $1 OR username = $2`
    try{
        const dupRecords = await query(sql,[email, username])
        if (dupRecords.rowCount > 0)
            return dupRecords.rows
    }catch(err){
        console.error(err)
        throw err;
    }
}


export const userLoginRepo = async(payload)=>{
    const sql = `SELECT ${NEW_UPDATE_USER_RETURN_FROM_DB.join(", ")}, password_hash FROM users WHERE email = $1 OR username = $1`
    try{
        const response = await query(sql, [payload.login])
        if(response.rowCount > 0) 
            return response.rows[0]
    }catch(err){
        throw err
    }
}

export const saveUserSessionRepo = async(payload) =>{
    const {sql, values} = buildInsertQuery(payload, "user_sessions")
    try{
        const response = await query(sql, values)
        if(response.rowCount > 0)
            return response.rows[0]
    }catch(err){
        throw err
    }
}


export const getUserById = async(sub) =>{
    const sql = `SELECT * FROM user_sessions WHERE user_id = $1`
    try{
        const response = await query(sql, [sub])
        return response.rows
    }catch(err){
        throw err
    }
}

export const updateUserSessionRepo = async(sessionId) =>{
    const sql = `UPDATE user_sessions SET refresh_token_hash = null WHERE session_id = $1 RETURNING session_id, user_id, refresh_token_hash`
    try{
        const response = await query(sql, [sessionId])
        return response.rows[0]
    }catch(err){
        throw err
    }
}


/**
 ** refresh query should conceptually validate all three **
SELECT *
FROM user_sessions
WHERE refresh_token_hash = $1
  AND revoked_at IS NULL
  AND expires_at > NOW();

  */


/**
 ** cleanup job **
    DELETE FROM user_sessions
    WHERE expires_at < NOW() - INTERVAL '30 days'
        OR revoked_at < NOW() - INTERVAL '30 days';
*/