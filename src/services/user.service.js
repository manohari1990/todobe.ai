import { updateProfileImageRepo } from "../repositories/user.repository.js"

export const uploadProfileImageService = async(user_id, image_path) =>{
    return await updateProfileImageRepo(user_id, image_path)
}