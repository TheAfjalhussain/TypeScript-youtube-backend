import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller";

export const healthCheckRouter = Router()
healthCheckRouter.get("/", healthCheck)