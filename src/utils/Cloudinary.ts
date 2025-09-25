import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { config } from "dotenv";

config()
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath: any) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        console.log("cloudinary error", error);        
        return null;
    }
}

const deleteOnCloudinary = async (public_id: any) => {
    try {
        if (!public_id) return null;
        const response = await cloudinary.uploader.destroy(public_id, {
            resource_type: "image"
        })
        return response
        
    } catch (error) {
        console.error('Error deleting image:', error);
        return null
    }
}


export {uploadOnCloudinary, deleteOnCloudinary}
