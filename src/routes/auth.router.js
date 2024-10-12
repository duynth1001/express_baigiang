import express from "express";
import {
     register,
     login,
     loginFacebook,
     extendToken,
      loginAsyncKey,
      forgotPass,
      changePassword } from "../controllers/auth.controller.js";

const authRouther= express.Router();

//register
authRouther.post("/register",register)

//login with sync key
authRouther.post("/login",login)

//login Facebook
authRouther.post("/login-face",loginFacebook);

//extend token
authRouther.post("/extend-token",extendToken);

//login with async key
authRouther.post('/login-async-key',loginAsyncKey);

//API forgot password, gửi code qua mail
authRouther.post("/forgot-password",forgotPass);

//API change password
authRouther.post("/change-password",changePassword);
export default authRouther;