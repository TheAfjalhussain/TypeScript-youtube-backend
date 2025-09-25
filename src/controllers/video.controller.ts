import { Response } from "express";
import { VerifyAuth, VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler  } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { 
    deleteVideoSchema, 
    getAllVideosSchema, 
    getVideoByIdSchema, 
    publishVideoSchema, 
    togglePublishStatusSchema, 
    updateVideoSchema 
} from "../schemas/video.schema";
import { Video } from "../models/video.model";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/Cloudinary";
import { User } from "../models/user.model";

export const getAllVideos = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getAllVideosSchema.safeParse(req.query)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");     
    }
    const { page, limit, query, sortBy, sortType, userId } = data;
    const pipeline: any[] = [];

    if (!userId) {
      throw new ApiError(400, "User Id doesn't not provided");
    }
    if (userId) {
        pipeline.push(
            {
                $match: {
                    owner: userId
                }
            }
        )
    }
    if (query) {
        pipeline.push(
            {
                $match: {
                    title: {
                      $regex: query,
                      $options: "i",
                    },
                }
            }
        )
    }
    // fetch videos only that are set isPublished as true
  pipeline.push({ $match: { isPublished: true } });

  //sortBy can be views, createdAt, duration
  //sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const aggregate = Video.aggregate(pipeline);
  const options = {
    page: Number(page),
    limit: Number(limit),
  };
//   @ts-ignore
  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export const publishVideo = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = publishVideoSchema.safeParse({
        body: req.body,
        files: req.files
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");
    }
    const { title, description } = data.body;
    const videoLocalPath = data.files.videoFile[0].path;
    const thumbnailLocalPath = data.files.thumbnail[0].path;
    if (!videoLocalPath) {
        throw new ApiError(404, "video path is missing !!.. ");   
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(404, "thumbnail path is missing !!.. ");   
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    console.log(videoFile);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const publish = await Video.create({
        title,
        description,
        thumbnail: thumbnail?.url,
        videoFile: videoFile?.url,
        owner: req.user?._id,
        duration: videoFile?.duration
    })
    if (!publish) {
        throw new ApiError(500, "Error while uploading video in server !!.");
    }
    return res
    .status(201).
    json(
        new ApiResponse(
            200,
            publish,
            "video upload successfully !!."
        )
    )
})

export const getVideoById = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getVideoByIdSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");     
    }
    const { videoId } = data
    const getVideo = await Video.aggregate([
        {
            $match: {
                _id: videoId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    $if: {
                                        $in: [req.user?._id, "$subscribers.subscriber"]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        $if: {
                            $in: [req.user?._id, "$liked.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                "videoFile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1,
            }
        }
    ])
    if (!getVideo) {
        throw new ApiError(500, "Failed to fatched video !!..");
    }
    console.log("getVideo", getVideo);
    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        },
        {
            new: true
        }
    )
    await User.findByIdAndUpdate(req.user?._id,{
        $addToSet: {
            watchedHistory: videoId
        }
    })
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            getVideo[0],
            "Video fetched successfully !!.."
        )
    )
})

export const updateVideo = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = updateVideoSchema.safeParse({
        params: req.params,
        body: req.body,
        file: req.file 
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");
    }
    const { videoId } = req.params
    const { title, description, isPublished } = req.body
    if (!title || !description || !isPublished) {
      throw new ApiError(400, "ALl three fields are required");
    }
    const thumbnailLocalPath = data.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(401, "Thumbnail file path is not found !!.");
    }
    const videoDetails = await Video.findById(videoId)
    const oldThumbnail = videoDetails?.thumbnail
    if (
        req.user?._id.tostring() !== videoDetails?.owner
    ) {
        throw new ApiError(500, "User doesn't have owner to update or delete videos !!.");
    }
    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!newThumbnail?.url) {
        throw new ApiError(500, "Failed to update Thumbnail file !!.");
    }
    await deleteOnCloudinary(oldThumbnail)
    const update = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: newThumbnail?.url,
                isPublished
            }
        }
    )
    console.log("update-video", update);
    if (!update) {
        throw new ApiError(501, "Error while updating details in server !!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            update,
            "Update video details successfully !!.."
        )
    )
})

export const deleteVideo = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = deleteVideoSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");     
    }
    const { videoId } = data
    const videoDetails = await Video.findById(videoId)
    if (
        req.user?._id.tostring() !== videoDetails?.owner
    ) {
        throw new ApiError(500, "User doesn't have owner to update or delete videos !!.");
    }
    const deleteVid = await Video.findByIdAndDelete(videoId)
    if (!deleteVid) {
        throw new ApiError(501, "Error while deleting videos in server !!.");     
    }
    await deleteOnCloudinary(videoDetails?.videoFile)
    await deleteOnCloudinary(videoDetails?.thumbnail)
    return res 
    .status(201)
    .json(
        new ApiResponse(
            200,
            deleteVid,
            "Video deteled successfully !!.."
        )
    )
})

export const togglePublishStatus  = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = togglePublishStatusSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!.");     
    }
    const { videoId } = data
    const videoDetails = await Video.findById(videoId)
    if (
        req.user?._id.tostring() !== videoDetails?.owner
    ) {
        throw new ApiError(500, "User doesn't have owner to publish videos !!.");
    }
    const toggleIsPublished = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !videoDetails?.isPublished
            }
        },
        {
            new: true
        }
    )
    if (!toggleIsPublished) {
        throw new ApiError(501, "Error while Toggle Publish video in server !!.");     
    }
    return res 
    .status(201)
    .json(
        new ApiResponse(
            200,
            toggleIsPublished,
            "Video toggle published successfully !!.."
        )
    )
})
