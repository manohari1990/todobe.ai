import { Router } from "express";
import { getCommonConfigs } from "../controllers/common.controller.js";

const commonRouter = new Router()
commonRouter.get('/configs',getCommonConfigs)

export default commonRouter;