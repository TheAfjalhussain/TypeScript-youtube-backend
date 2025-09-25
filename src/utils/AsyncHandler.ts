import { NextFunction, Request, Response } from "express"

// higher order function 
export const AsyncHandler = (requestHandler: any) => {
    return ((req:Request, res:Response, next:NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    })
}

