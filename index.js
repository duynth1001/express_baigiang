//b1: import lib express
import express from 'express'
import pool from './db.js';
import { OK, INTERNAL_SERVER } from './const.js';
import rootRouters from './src/routes/root.router.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
//b2: tao object express
const app = express();

//Thêm middleware để đọc data json
app.use(express.json());

//thêm middleware để đọc cookie từ request
app.use(cookieParser());

//thêm middleware cors để FE có thể call API tới BE
app.use(cors({
    origin:"http://localhost:3000", //cấp quyền cho FE 
    credentials:true// cho phép FE lấy cookie và lưu vào cookie browser
}));

//import rootRoutes
app.use(rootRouters);

//b3 : define port
//params 1: define port BE
//params 2: callback function


app.get(`/`,(req,res)=>{
    res.send("Hello world");
})

app.get('/test',(req,res)=>{
    res.send('test api');
})

//demo get query tu URL

app.get('/test-query',(req,res)=>{
    let query=req.query;
    res.send(query);
})

//demo get header from request
app.get('/test-header', (req, res)=>{
    let headers = req.headers;
    res.send(headers);
})
// 
app.listen(8080,()=>{
        console.log(`Server is starting with port 8080`);
})  
                