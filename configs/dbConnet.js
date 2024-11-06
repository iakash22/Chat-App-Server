// Importing the `connect` method from the 'mongoose' library to interact with MongoDB
const { connect } = require('mongoose');

// Importing the 'dotenv' library to load environment variables from a .env file
require('dotenv').config();

// Function to establish a connection to the MongoDB database
const dbConnect = () => {
    // Calling the `connect` method of mongoose to establish the connection with the database
    connect(process.env.DATABASE_URL, {})  // Using DATABASE_URL from the environment variables
        .then(() => {
            // If the connection is successful, log the success message
            console.log("DATABASE CONNECTED!");
        })
        .catch((err) => {
            // If an error occurs during the connection attempt, log the error and terminate the application
            console.log("DATABASE CONNECTION FAILED", err);
            process.exit(1);  // Exit the process with a failure code
        });
}

// Exporting the dbConnect function so it can be used elsewhere in the application
module.exports = dbConnect;
