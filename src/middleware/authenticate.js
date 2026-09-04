import { verifyToken } from "../utils/jwt.js"

// - verify access_token is invalid and expired - throw 401 
// - if valid then extract the sub,username,exp,iat from req.cookies.access_token 
// - prepare payload with sub,username and attach to req 
// - then respond call the next() controller with this req


export const verifyRequestAuth = (req, res, next) => {
    const cookies = req.cookies
    try{
        const {sub, username} = verifyToken(cookies.access_token)    // Validate token and returns sub and username
        if(!sub){
            return res.status(401).json({
                success: false,
                error: "Invalid Token"
            })
        }
        req.user = { sub: sub, username: username }
        return next()
    }catch(err){
        return res.status(401).json({
            success: false,
            error: "Unautherised Request!"
        })
    }
}