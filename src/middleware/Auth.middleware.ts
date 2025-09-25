import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken"
import { User } from "../models/user.model";

export interface VerifyAuthRequest extends Request {
    user?: any
}

export const VerifyAuth = AsyncHandler(async (req: VerifyAuthRequest, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies?.accessToken ||
           req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(404, "No Token found !!.");      
        }
        const decodeToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN!) as JwtPayload | any
        
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, " Invalid access token!!."); 
        }
        // console.log("user", user);
        
        req.user = user
        next()
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid access token")
        
    }
})


