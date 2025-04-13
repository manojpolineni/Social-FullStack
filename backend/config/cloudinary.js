import  cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.Cloud_API_Name,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRETE,
});

export default cloudinary;
