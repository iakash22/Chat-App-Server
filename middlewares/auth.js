const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../utils/utility");
const { TryCatch } = require("./error");
const jwt = require('jsonwebtoken');
const User = require('../models/user');


exports.isAuthenticate = TryCatch(async (req, res, next) => {
    const token = req.cookies.token || req.body.token;
    // console.log(req.cookies);
    if (!token) {
        return next(new ErrorHandler("Please login to access this route", 401));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
        return next(new ErrorHandler('User not valid, please re-login', 404));
    }
    // console.log(decode);
    const user = decode.role === "User" ?
        {
            _id: decode._id,
            username: decode.username,
            role : "User"
        }
        :
        {
            role: decode.role,
            secretKey: decode.secretKey,
        }
    req.user = user;
    // console.log(user);
    next();
})

exports.isUser = TryCatch(async (req, res, next) => { 
    
    if (req.user.role !== "User" && mongoose.Types.ObjectId.isValid(req.user._id)) {
        return next(new ErrorHandler("You don’t have the rights to enter this area.", 403));
    }

    next();
})

exports.isAdmin = TryCatch(async (req, res, next) => {
    const isMatched = process.env.ADMIN_SECRET_KEY === req.user.secretKey;

    if (req.user.role !== "Admin" && !isMatched) {
        return next(new ErrorHandler("Oops! It looks like you don’t have permission to access this section. Please contact the admin if you believe this is an error.", 403));
    }

    next();
})

exports.socketAuthenticator = async (err, socket, next) => {
    try {
        if (err) {
            return next(err);
        }

        const token = socket.request.cookies.token;
        if (!token) {
            return next(new ErrorHandler("Please login to access this route", 401));
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decode);

        const user = await User.findById(decode._id);

        if (!user) {
            return next(new ErrorHandler("Please login to access this route", 401));
        }

        socket.user = user;
        return next();
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("Please login to access this route", 401));
    }
}