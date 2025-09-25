import { connectDB } from "./db";
import { config } from "dotenv";
import { app } from "./app";

config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8001 , () => {
        console.log("Server is running at port", process.env.PORT);
        
    })
})
.catch((err) => {
    console.log("MongoDB Connection Failed !!.", err);
    
})