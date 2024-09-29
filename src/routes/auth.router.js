import express from "express";
import { register,login,loginFacebook } from "../controllers/auth.controller.js";

const authRouther= express.Router();

//register
authRouther.post("/register",register)

//login
authRouther.post("/login",login)

//login Facebook
authRouther.post("/login-face",loginFacebook);
export default authRouther;