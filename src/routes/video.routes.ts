import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    deleteVideo,
    getAllVideos,
    getVideoById, 
    publishVideo, 
    togglePublishStatus, 
    updateVideo
} from "../controllers/video.controller";
import { upload } from "../middleware/multer.middleware";

export const videoRouter = Router()

videoRouter.use(VerifyAuth)

videoRouter.get("/", getAllVideos)
videoRouter.post("/create", upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
]), publishVideo)
videoRouter.get("/:videoId", getVideoById)
videoRouter.patch("/:videoId", upload.single("thumbnail"), updateVideo)
videoRouter.delete("/:videoId", deleteVideo)
videoRouter.patch("/toggle/publish/:videoId", togglePublishStatus)