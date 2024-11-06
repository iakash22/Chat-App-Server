// Importing the cloudinary package and the 'dotenv' module for environment variable management
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Function to establish a connection to Cloudinary
const cloudinaryConnect = () => {
    try {
        // Configuring Cloudinary with credentials from environment variables
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,  // Cloud name from Cloudinary dashboard
            api_key: process.env.CLOUD_API_KEY,  // API Key from Cloudinary dashboard
            api_secret: process.env.CLOUD_API_SECRET,  // API Secret from Cloudinary dashboard
        });
        
        // Log message indicating successful connection to Cloudinary
        console.log("cloudinary connect succesfull");
    } catch (err) {
        // If any error occurs during connection, log it to the console
        console.log('cloudinary connnection error', err);
    }
}

// Export the cloudinaryConnect function so it can be used in other parts of the application
module.exports = cloudinaryConnect;
