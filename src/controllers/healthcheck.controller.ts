import { Request, Response } from "express";
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponce";

export const healthCheck = AsyncHandler( async(req: Request, res: Response) => {
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {},
            "Server is working properly !!.."
        )
    )
})