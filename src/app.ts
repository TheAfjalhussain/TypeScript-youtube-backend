import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { mainRouter } from "./routes/main.routes"

const app = express()
app.use(express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1", mainRouter)


app.get("/", (req: Request, res: Response) => {
    return res.status(201).json({message: "Server Is Healthy !!."})
})

export { app }