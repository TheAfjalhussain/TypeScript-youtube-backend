import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller";

export const dashboardRouter = Router()

dashboardRouter.use(VerifyAuth)

dashboardRouter.get("/stats",  getChannelStats)
dashboardRouter.get("/videos",  getChannelVideos)