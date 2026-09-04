import { uploadProfileImageService } from "../services/user.service.js"

export const profilePicUpload = async(req, res) =>{
    try{
        if(!req.file){
            return res.status(400).json({
                success: true,
                error: "Profile image is requred"
            })
        }
        const user_id = req.user.sub
        const image_path = req.file.path

        const response = await uploadProfileImageService(user_id, image_path)

        return res.status(200).json({
            success: true,
            message: "User profile is updated successfully!",
            data: response
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            error: "Internal server error!"
        })
    }
}

