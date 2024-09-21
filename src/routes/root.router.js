import express from 'express';
import userRoutes from './user.router.js';
import videoRoutes from './video.router.js';

//tạo object router
const rootRouters = express.Router();

rootRouters.use("/users",userRoutes)

rootRouters.use("/videos",videoRoutes);
//export rootRouter cho index.js dùng
export default rootRouters;