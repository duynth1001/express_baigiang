import jwt  from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';

let accessTokenPrivateKey = fs.readFileSync("access_token.private.key");
let accessTokenPublicKey = fs.readFileSync("access_token.public.key");
let refreshTokenPrivateKey = fs.readFileSync("refresh_token.private.key");
let refreshTokenPublicKey = fs.readFileSync("refresh_token.public.key");

//đọc file .env
dotenv.config();

//create function createToken
export const createToken = (data)=>{
    return jwt.sign({payload:data},process.env.ACCESS_TOKEN_KEY,{
        algorithm:"HS256",
        expiresIn:"10s"
    })
} 

//create Async Token
export const createTokenAsyncKey = (data)=>{
    return jwt.sign({payload:data},accessTokenPrivateKey,{
        algorithm:"RS256",
        expiresIn:"10s"
    })
}

//create async token refresh
export const createRefTokenAsyncKey = (data)=>{
    return jwt.sign({payload:data},refreshTokenPrivateKey,{
        algorithm:"RS256",
        expiresIn:"7d"
    });
}

//verify function async
export const verifyTokenAsyncKey = (token)=>{
    try {
        jwt.verify(token,accessTokenPublicKey);
        return true;
    } catch (error) {
        //không verify được token
        return false;
    }
}

//verify function sync
export const verifyToken = (token)=>{
    try {
        jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
        return true;
    } catch (error) {
        //không verify được token
        return false;
    }
}


//create token refresh
export const createRefToken = (data)=>{
    return jwt.sign({payload:data},process.env.REFRESH_SECRET,{
        algorithm:"HS256",
        expiresIn:"7d"
    });
}

//create middleware token
export const middlewareToken = (req,res,next)=>{
    let {token}= req.headers;
    let checkToken = verifyToken(token);
    if (checkToken) {
        //Nếu token hợp lệ => pass => qua router
        next();
    } else {
        return res.status(401).json({message:"Unathourized"});
    }
}

//create middleware token async
export const middlewareTokenAsyncKey = (req,res,next)=>{
    let {token}= req.headers;
    let checkToken = verifyTokenAsyncKey(token);
    if (checkToken) {
        //Nếu token hợp lệ => pass => qua router
        next();
    } else {
        return res.status(401).json({message:"Unathourized"});
    }
}

