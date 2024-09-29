import  express  from "express";
import { getListVideo, getType,getListVideoType,getVideoPage} from "../controllers/video.controller.js";
import { middlewareToken } from "../config/jwt.js";

const videoRoutes = express.Router();

videoRoutes.get("/get-videos",getListVideo);

videoRoutes.get("/get-type",middlewareToken,getType);

videoRoutes.get("/get-videos-type-by-id/:typeId",getListVideoType)

videoRoutes.get("/get-video-page/:page/:size",getVideoPage)
export default videoRoutes;