import { v2 as cloudinary } from 'cloudinary';


export const configureCloudinary = () => {
  // Trim whitespace from credentials to handle .env formatting issues
  const cloudName =process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey =process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret =process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are missing. Please check your .env file.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  
  return cloudinary;
};

export default configureCloudinary;


