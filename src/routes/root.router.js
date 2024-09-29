import express from 'express';
import userRoutes from './user.router.js';
import videoRoutes from './video.router.js';
import authRouther from './auth.router.js';

//tạo object router
const rootRouters = express.Router();

rootRouters.use("/users",userRoutes)

rootRouters.use("/videos",videoRoutes);

rootRouters.use("/auth",authRouther);
//export rootRouter cho index.js dùng

export default rootRouters;