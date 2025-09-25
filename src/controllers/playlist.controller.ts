import { Request, Response } from "express";
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { Playlist } from "../models/playlist.model";
import { 
    addVideoToPlaylistSchema, 
    createPlaylistSchema, 
    getPlaylistByIdSchema, 
    getUserPlaylistsSchema, 
    removeVideoToPlaylistSchema, 
    updatePlaylistSchema
} from "../schemas/playlistSchema";
import { VerifyAuth, VerifyAuthRequest } from "../middleware/Auth.middleware";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";


export const createPlaylist = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = createPlaylistSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");  
    }
    const { name, description } = data
    if (!(name && description)) {
        throw new ApiError(400, "All fields are required !!..");
    }
    const create = await Playlist.create(
        {
            name,
            description,
            owner: req.user._id
        }
    )
    if (!create) {
        throw new ApiError(500, "Error while creating playlist !!..");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            create,
            "Playlist Created Successfully !!.."
        )
    )
})

export const getUserPlaylists = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getUserPlaylistsSchema.safeParse(req.params);
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");  
    }
    const { userId } = data
    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ])
    console.log(playlist);
    if (!playlist) {
        throw new ApiError(500, "Error while finding playlist !.")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            playlist,
            "fetched user playlist successfully !!."
        )
    )
    
})

export const getPlaylistById = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getPlaylistByIdSchema.safeParse(req.params);
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");  
    }
    const { PlaylistId } = data
    const getPlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(PlaylistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                totalViews: {
                    $sum: "videos.views"
                },
                totalVideos: {
                    $size: "$videos"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                owner: {
                    username: 1,
                    "avatar.url": 1,
                    fullName: 1
                },
                videos: {
                    _id: 1,
                    "video.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    duration: 1,
                    views: 1,
                }
            }
        }
    ])
    console.log(getPlaylist);
    if (!getPlaylist) {
        throw new ApiError(500, "Error while aggregating playlist videos !!.. ");
    }
    return res
    .status(201).
    json(
        new ApiResponse(
            200,
            getPlaylist,
            "fetched Playlist successfully !!."
        )
    )
})

export const addVideoToPlaylist = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = addVideoToPlaylistSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");  
    }
    const { playlistId, videoId } = data
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found !!.");
    }
    const playlist = await Playlist.findById(playlistId)
    console.log(playlist?.owner?.toString());
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found !!.");
    }
    if (
        (playlist?.owner?.toString() && video?.owner?.toString()) !== req.user?._id.toString()
    ) {
        throw new ApiError(401, "Only owner can add videos in playlist !!.");      
    }
    const addPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if (!addPlaylist) {
        throw new ApiError(500, "Error while add video in playlist!!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            addPlaylist,
            "Video add to playlist successfully !!.."
        )
    )
})

export const removeVideoToPlaylist = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = removeVideoToPlaylistSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(402, "Invalid Inputs");
    }
    const { playlistId, videoId } = data
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found !!.");
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found !!.");
    }
    if (
        (playlist?.owner?.toString() && video?.owner?.toString()) !== req.user?._id.toString()
    ) {
       throw new ApiError(401, "Only owner can add or remove video from playlist !!."); 
    }
    const removePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if (!removePlaylist) {
        throw new ApiError(500, "Error while remove video in playlist!!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            removePlaylist,
            "Video removed to playlist successfully !!.."
        )
    )
})

export const deletePlaylist = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = removeVideoToPlaylistSchema.safeParse(req.params) 
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");
    }
    const { playlistId } = data
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found !!.");
    }
    if (
        playlist?.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(401, "You are not authorized to delete the playlist");
    }
    const deletePl =  await Playlist.findByIdAndDelete(playlistId)
    if (!deletePl) {
        throw new ApiError(500, "Error while deleting playlist !!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            deletePl,
            "Playlist is deleted successfully !!."
        )
    )
})

export const updatePlaylist = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = updatePlaylistSchema.safeParse({
        params: req.params,
        body: req.body
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs");  
    }
    const { playlistId } = data.params
    const { name, description } = data.body
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found !!.");
    }
    if (
        playlist?.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(401, "You are not authorized to update the playlist");
    }
    const updatepl = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )
    if (!updatepl) {
        throw new ApiError(500, "Error while updating playlist !!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            updatepl,
            "Playlist updated successfully !!."
        )
    )
})
