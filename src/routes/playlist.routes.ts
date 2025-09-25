import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoToPlaylist,
    updatePlaylist,

} from "../controllers/playlist.controller";

export const playlistRouter = Router()

playlistRouter.use(VerifyAuth)

playlistRouter.post("/create",  createPlaylist)
playlistRouter.get("/user/:userId", getUserPlaylists)
playlistRouter.get("/:playlistId", getPlaylistById)
playlistRouter.patch("/add/:videoId/:playlistId", addVideoToPlaylist)
playlistRouter.patch("/:playlistId", updatePlaylist)
playlistRouter.delete("/:playlistId", deletePlaylist)
playlistRouter.patch("/remove/:videoId/:playlistId", removeVideoToPlaylist)
