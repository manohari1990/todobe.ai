/**
 * This middleware should be responsible for:

    ** destination
    ** filename
    ** allowed mime types
    ** max size
*/

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/users'

// CREATE DIR IF IT IS NOT EXISTED
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname)
        const fileName = `${req.user.username}-${Date.now()}${extension}`
        cb(null, fileName)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Only image files are allowed"), false)
    }
}

export const uploadProfileImage = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 5 * 1024 * 1024
    }
})
