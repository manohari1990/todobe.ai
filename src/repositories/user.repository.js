import { query } from "../config/database.js"
import { NEW_UPDATE_USER_RETURN_FROM_DB } from "../Constant.js"

export const updateProfileImageRepo = async(user_id, image_path) =>{
    const sql = `UPDATE users SET profile_image = $1 WHERE user_id = $2 RETURNING ${NEW_UPDATE_USER_RETURN_FROM_DB.join(',')}`
    try{
        const response = await query(sql,[image_path, user_id])
        return response.rows[0]
    }catch(err){
        throw err
    }
}