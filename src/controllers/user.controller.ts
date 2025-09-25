import { User, IUser } from "../models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken"
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { application, Request, Response } from "express";
import { signupSchema, loginSchema, changePasswordSchema, updateAccountDetailsSchema, updateAvatarImageSchema, updateUserCoverImageSchema, getUserChannelProfileSchema} from "../schemas/user.schema";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/Cloudinary";
import { VerifyAuth, VerifyAuthRequest } from "../middleware/Auth.middleware";
import { Subscription } from "../models/subscription.model";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId: any) => {
    try {
        let user = await User.findById(userId)
        const accessToken = user?.generateAccessToken()
        const refreshToken = user?.generateRefreshToken()
        // @ts-ignore
        user.refreshToken = refreshToken
        await user?.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
        
    }
}

interface MulterRequest extends Request {
  files?: {
    avatar?: Express.Multer.File[];
    coverImage?: Express.Multer.File[];
  };
}

export const registerUser = AsyncHandler( async (req: MulterRequest, res: Response) => {
    const { fullName, username, email, password } = req.body
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(401, "All fields are required!!.");       
    }
    const {success, data} = signupSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(400, "Invalid Inputs.", );       
    }
    // console.log(data);
    
    const existingUser = await User.findOne({email})
    if (existingUser) {
        throw new ApiError(402, "User is already exists.");
        
    }
    // console.log(req.files);
    
    // @ts-ignore
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(402, "Avatar Path filed is required !!.");        
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar?.url) {
        throw new ApiError(402, "Avatar filed is required !!.");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        username: data.username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password: data.password
    })
    const createdUser = await User.findById(user._id).select( "-password -refreshToken" )
    if (!createdUser) {
        throw new ApiError(500, "somethings went wrong while registering user!!.");       
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created Successfully!!.")
    )
})

export const loginUser = AsyncHandler(async(req:Request, res: Response) => {
    const { email, username, password } = req.body;
    if (!(email || username)) {
        throw new ApiError(402, "Username or email is required !!.");
        
    }
    const { success, data } = loginSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(401, "Invalid inputs!!.");
    }
    const user = await User.findOne({
        $or: [
            {email},{username}
        ]
    })
    if (!user) {
        throw new ApiError(404, "User doesn't exists !!.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(404, "Incorrect Password !!.");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken" )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedIn successfully !!."
        )
    )
})

export const logoutUser = AsyncHandler(async (req: VerifyAuthRequest, res: Response) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export const refreshAccessToken = AsyncHandler( async(req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(403, "UnAuthorized request !!.");
    }
    const decodeToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_TOKEN!) as JwtPayload | null
    const user = await User.findById(decodeToken?._id)
    if (!user) {
        throw new ApiError(404, "Invalid refresh Token !!.");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(404, "refresh Token expired or used !!.");
    }
    // @ts-ignore
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user?._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "accessToken refresh"
        )
    )

})

export const changePassword = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const {success, data} = changePasswordSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(401, "Invalid inputs!!.");
    }
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user?.isPasswordCorrect(data.oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(404, "Incorrect Password !!.");
    }
    // @ts-ignore
    user?.password = data.newPassword
    await user?.save({validateBeforeSave: false})
    return res.status(200).json(
        new ApiResponse(200, {}, "password changer successfully.")
    )
})

export const getCurrentUser = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                user: req.user
            },
            "User fetched Successfully!.."
        )
    )
})

export const updateAccountDetails = AsyncHandler(async (req: VerifyAuthRequest, res: Response) => {
    const { email, fullName } = req.body
    if (!(email || fullName)) {
        throw new ApiError(401, "Atleast one field is required !..");  
    }
    const { success, data } = updateAccountDetailsSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(401, "Invalid inputs!!.");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName: data.fullName,
                email: data.email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")
    return res.status(201)
    .json(
        new ApiResponse(200, user, "Account details update successfully !!.." )
    )
})

export const updateAvatarImage = AsyncHandler(async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = updateAvatarImageSchema.safeParse({
        avatar: req.file?.path
    })
    if (!success) {
        throw new ApiError(402, "Avatar field is required !!.");      
    }
    // @ts-ignore
    const avatarLocalPath = data.avatar;
    const avatar = await uploadOnCloudinary(avatarLocalPath) 
    if (!avatar?.url) {
        throw new ApiError(402, "Error while uploading avatar !!.");   
    }
    const user = await User.findById(req.user._id).select("avatar")
    // console.log("user", user);
    // @ts-ignore
    const avatarToDelete = user?.avatar?.public_id;
    // console.log("avatarToDelete", avatarToDelete);
    
    const updateUserAvatar = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: {
                    public_id: avatar.public_id,
                    url: avatar.secure_url
                }
            }
        },
        {
            new: true
        }
    ).select("-password")
    // console.log("updateUserAvatar" ,updateUserAvatar);
    
    // @ts-ignore
    if (avatarToDelete && updateUserAvatar?.avatar?.public_id) {
        await deleteOnCloudinary(avatarToDelete);
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateUserAvatar,
            "User avatar updated successfully."
        )
    )
})

export const updateUserCoverImage = AsyncHandler(async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = updateUserCoverImageSchema.safeParse({
        coverImage: req.file?.path
    })
    if (!success) {
        throw new ApiError(402, "CoverImage field is required !!.");      
    }
    
    console.log(data);
    // @ts-ignore
    const coverImageLocalPath = data.coverImage;
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading coverImage");   
    }
    const user = await User.findById(req.user?._id).select("-coverImage")
    // @ts-ignore
    const coverImageToDelete = user?.coverImage?.public_id
    console.log("coverImageToDelete", coverImageToDelete);
    
    const updateCoverImage = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: {
                    public_id: coverImage.public_id,
                    url: coverImage?.secure_url,
                }
            }
        },
        {
            new: true
        }
    )
    //  @ts-ignore
    if (coverImageToDelete && updateCoverImage?.coverImage?.public_id) {
        await deleteOnCloudinary(coverImageToDelete)
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateCoverImage,
            "coverImage is updated successfully !!.."
        )
    )
})

export const getUserChannelProfileDetails = AsyncHandler(async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getUserChannelProfileSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(400, "username is missing !!.."); 
    }
    const { username } = data
    const channel = await User.aggregate([
        {
            $match: {
              username: username?.toLowerCase()
           }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    console.log("channel", channel);
    return res.status(201).json(
        new ApiResponse(
            201,
            channel[0],
            "User channel fetched successfully !!. "
        )
    )
})

export const getWatchedHistory = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchedHistory",
                foreignField: "_id",
                as: "watchedHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    console.log(user);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

