import { Response } from "express";
import { VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler } from "../utils/AsyncHandler";
import { 
    addCommentSchema, 
    deleteCommentSchema, 
    getVideoCommentsSchema, 
    updateCommentSchema 
} from "../schemas/commant.schema";
import { ApiError } from "../utils/ApiError";
import { Comment } from "../models/comment.model";
import { ApiResponse } from "../utils/ApiResponce";

//TODO: get all comments for a video
export const getVideoComments = AsyncHandler(  async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getVideoCommentsSchema.safeParse({
        params: req.params,
        query: req.query
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");  
    }
    const { videoId } = data.params
    const { page = 1, limit = 10 } = data.query

    const getComments = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owners"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owners"
                },
                isliked: {
                    $cond: {
                        $if: {
                            $in: [req.user?._id, "$likes.likedBy"]
                        }
                    },
                    then: true,
                    else: false
                }
            }
        }
    ])
    console.log(getComments);
    
    if (!getComments) {
        throw new ApiError(500, "Error while loading getComments section");
    }
    const options = {
        // @ts-ignore
        page: parseInt(page, 10),
        // @ts-ignore
        limit: parseInt(limit, 10)
    }
    // @ts-ignore
    const comments = await Comment.aggregatePaginate(getComments, options)
    console.log("comments", comments);
    
    if (!comments) {
        throw new ApiError(500, "Error while loading comments sections !!..");    
    }
    return res
    .status(201).
    json(
        new ApiResponse(
            200, 
            comments,
            "fetched all comments successfully !!.."
        )
    )
})

export const addComment = AsyncHandler(  async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = addCommentSchema.safeParse({
        params: req.params,
        body: req.body
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !..");  
    }
    const { videoId } = data.params
    const { content } = data.body
    const Add = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })
    if (!Add) {
        throw new ApiError(500, "Error while adding comment !!.");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            Add,
            "Comment added successfully !!.."
        )
    )
})

export const updateComment = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = updateCommentSchema.safeParse({
        params: req.params,
        body: req.body
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !..");  
    }
    const { commentId } = data.params
    const { content } = data.body
    const getComment = await Comment.findById(commentId)
    if (
        getComment?.owner !== req.user._id.tostring()
    ) {
        throw new ApiError(401, "User is not a owner of this comment !!..");  
    }
    const update = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )
    if (!update) {
        throw new ApiError(500, "Error while updating comment in server !!..");  
    }
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        update,
        "Comment has been updated Successfully"
      )
    );
})

export const deleteComment =  AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = deleteCommentSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");  
    }
    const { commentId } = data
    const getCommentDetails = await Comment.findById(commentId)
    if (
        req.user._id.tostring() !== getCommentDetails?.owner
    ) {
        throw new ApiError(400, "This User doesn't create comment !!..");  
    }
    const deletecomment = await Comment.findByIdAndDelete(commentId)
    if (!deleteComment) {
       throw new ApiError(500, "Error while deleting comment in server !!..");
    } 
    return res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            deletecomment,
            "comment deleted successfully !!.."
        )
    )
})