import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Op } from "sequelize";//Operator toán tử : LIKE,AND,IN,OR

const model = initModels(sequelize);
const getListVideo = async(req,res)=>{
    try {
        let data=await model.video.findAll(); //return promise
        return res.status(200).json(data);        
    } catch (error) {
       return res.status(500).json({message:"error"})
    }
}

const getType = async (req,res) =>{
    try {
        let data = await model.video_type.findAll();
        return res.status(200).json(data);
    } catch (error) {
        
        return res.status(500).json({message:"error"})
    }
}

const getListVideoType = async(req,res)=>{
    try {
        const {typeId} = req.params;
        let data = await model.video.findAll({
            where:{
                type_id:typeId
            }
        })
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({message:"error"})
    }
}

const getVideoPage =async (req,res)=>{
    try {
        let {page,size}= req.params;
        page=parseInt(page,10);
        size =parseInt(size,10);
        if (isNaN(page) || page<=0 ) {
            return res.status(400).json({message:"page is wrong"})
        }
        if (isNaN(size)||size<=0) {
            return res.status(400).json({mesage:"size is wrong"});
        }
        let index =(page-1)*size;
        let data = await model.video.findAll({
            offset:index,
            limit:size
        })
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({message:'error'});
    }
}



export {
    getListVideo, getType,getListVideoType,getVideoPage
}