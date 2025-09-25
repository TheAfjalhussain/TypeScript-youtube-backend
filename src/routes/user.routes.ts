import { Router } from "express";
import { 
  changePassword,
  getCurrentUser,
  getUserChannelProfileDetails,
  getWatchedHistory,
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  registerUser, 
  updateAccountDetails, 
  updateAvatarImage, 
  updateUserCoverImage
} from "../controllers/user.controller";
import { upload } from "../middleware/multer.middleware";
import { VerifyAuth } from "../middleware/Auth.middleware";

export const userRouter = Router()

userRouter.post("/register", upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), registerUser); 

userRouter.post("/login", loginUser)
userRouter.post("/logout", VerifyAuth, logoutUser)
userRouter.post("/refresh-token", VerifyAuth, refreshAccessToken)
userRouter.post("/change-password", VerifyAuth, changePassword)
userRouter.get("/current-user", VerifyAuth, getCurrentUser)
userRouter.patch("/update-account", VerifyAuth, updateAccountDetails)

userRouter.patch("/update-avatar", VerifyAuth, upload.single("avatar"), updateAvatarImage)
userRouter.patch("/update-coverImage", VerifyAuth, upload.single("coverImage"), updateUserCoverImage)

userRouter.get("/c/:username", VerifyAuth, getUserChannelProfileDetails)
userRouter.get("/history", VerifyAuth, getWatchedHistory)