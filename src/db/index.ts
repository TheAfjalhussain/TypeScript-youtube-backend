import mongoose from "mongoose";


export const connectDB = async() => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`)
        console.log("MongoDB Connected Successfully !!.", connect.connection.host);
        
    } catch (error) {
        console.log("MongoDb Connection Failed !!.", error);
        process.exit(1)
    }
}