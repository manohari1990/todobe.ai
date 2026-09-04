import {Router} from 'express';
import {profilePicUpload} from '../controllers/user.controller.js'
import { verifyRequestAuth } from '../middleware/authenticate.js';
import { uploadProfileImage } from '../middleware/upload.js';

const userRouter = Router()

userRouter.patch(
        '/upload', 
        verifyRequestAuth, 
        uploadProfileImage.single("profile_image"),
        profilePicUpload
    )

export default userRouter
