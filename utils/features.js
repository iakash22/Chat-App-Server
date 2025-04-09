const jwt = require('jsonwebtoken');
const { getSocketIDs } = require('../lib/helper');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const errors = require('../constants/errors');
// const { userSocketIDs } = require('../index');
const axios = require('axios');

const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None",
}

const tokenGenerateToken = (payload) => {
    payload.role = "User"
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
}

const sendToken = (res, user, next, message) => {
    const payload = {
        _id: user._id,
        username: user.username,
        role: "User"
    };
    const token = jwt.sign(
        payload,
    );

    return res.status(200).cookie('token', token, options).json({
        succcess: true,
        message,
    })
}

const emitEvent = (req, event, users, data, io) => {
    console.log("req :", req, "io : ", io);
    if (io) {
        const userSocket = getSocketIDs(users);
        io.to(userSocket).emit(event, data);
    } else if (req) {
        const io = req.app.get('io');
        // console.log(event);
        const userSocket = getSocketIDs(users);
        io.to(userSocket).emit(event, data);
    } else {
        throw new Error("Io Server Error");
    }

}

const encryptPassword = async (password) => {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
}

const VerifyPassword = async (password, hashPassword) => {
    if (await bcrypt.compare(password, hashPassword)) return true;
    return false;
}

const generateOtp = (length = 6) => {
    const otp = crypto.randomBytes(length)
        .toString('hex')
        .toUpperCase()
        .slice(0, length);

    return otp;
}

const getGeoLocation = async (ip) => {
    try {
        if (ip === "::1" || ip === "127.0.0.1") return "localhost location";
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        // console.log("response :", response?.data);
        return response.data.city + ", " + response.data.country;
    } catch (error) {
        console.error("Error fetching location:", error);
        return "Unknown location";
    }
}

module.exports = {
    sendToken,
    emitEvent,
    options,
    tokenGenerateToken,
    encryptPassword,
    VerifyPassword,
    generateOtp,
    getGeoLocation,
};