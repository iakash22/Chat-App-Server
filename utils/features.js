const jwt = require('jsonwebtoken');
const { getSocketIDs } = require('../lib/helper');
// const { userSocketIDs } = require('../index');

const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None",
}
const sendToken = (res, user, next, message) => {
    const payload = {
        _id: user._id,
        username: user.username,
        role: "User"
    };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );

    return res.status(200).cookie('token', token, options).json({
        succcess: true,
        message,
    })
}

const emitEvent = (req, event, users, data) => {
    const io = req.app.get('io');
    // console.log(event);
    const userSocket = getSocketIDs(users);
    io.to(userSocket).emit(event, data);
}

const deleteFilesFromCloudinary = (public_ids) => {
    // console.log(public_ids);
    console.log("deleteFilesFromCloudinary");
}

module.exports = { sendToken, emitEvent, deleteFilesFromCloudinary, options };