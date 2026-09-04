import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {         // Any object like - {sub: user_id, username: username}
    const access_token = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET,
            {
                algorithm: "HS256",
                expiresIn: process.env.JWT_ACCESS_EXP_IN
            }
        );
    
    const refresh_token = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_REFRESH_EXP_IN
        }
    )
    return {refresh_token, access_token}
}

export const verifyToken = (token, tokenType = null) => {
    try{
        const secrete = tokenType === 'refresh_token' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET
        const obj = jwt.verify(token, secrete)
        return obj
    }catch(err){
        console.error(`ERROR: ${err}`)
        throw err
    }
}