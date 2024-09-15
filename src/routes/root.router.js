import express from 'express';
import userRoutes from './user.router.js';

//tạo object router
const rootRouters = express.Router();

rootRouters.use("/users",userRoutes)

//export rootRouter cho index.js dùng
export default rootRouters;