const { TryCatch } = require('../middlewares/error');
const User = require('../models/user');
const { sendToken, emitEvent, options } = require('../utils/features');
const bcrypt = require('bcrypt');
const { ErrorHandler } = require('../utils/utility');
const Chat = require('../models/chat');
const Request = require('../models/request');
const { NEW_REQUEST, REFETCH_CHATS } = require('../constants/events');
const { getOtherMember } = require('../lib/helper');
const { uploadImageCloudinary } = require('../utils/imageUploader');


exports.register = TryCatch(async (req, res, next) => {
    const { name, username, password, bio } = req.body;
    const file = req.file;
    // console.log(file);

    if (!file) {
        return next(new ErrorHandler("Please Upload Avatar", 428))
    }

    // console.log(file);

    const result = await uploadImageCloudinary([file], 'Profile');
    // console.log(result);
    const Avatar = {
        public_id: result[0]?.public_id,
        url: result[0]?.url,
    }

    const user = await User.create({
        name,
        username,
        bio,
        password,
        avatar: Avatar
    });

    sendToken(res, user, next, `Hello ${user.name}, let’s chat, connect, and have fun!`);
});

exports.login = TryCatch(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorHandler("All fields required", 428));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Username and password incorrect!", 404));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);

    if (!isMatch) {
        return next(new ErrorHandler("Username and password incorrect!", 404));
    }

    sendToken(res, user, next, `Welcome Back, ${user.name}`);
})

exports.logout = TryCatch(async (req, res, next) => {
    res.status(200).cookie('token', "", { ...options, expires: new Date(0) }).json({
        success: true,
        message: "You’ve logged out, See you again soon!"
    })
})

exports.getMyProfile = TryCatch(async (req, res, next) => {
    const { _id, username } = req.user;

    const data = await User.findById(_id);

    if (!data) {
        return next(new ErrorHandler("user not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Profile fetch successfull",
        data,
    })
})

exports.searchUser = TryCatch(async (req, res, next) => {
    const { name = "" } = req.query;

    const chat = await Chat.find({
        groupChat: false,
        members: req.user._id
    })
        .select("members -_id")
        .exec();

    const myFriends = chat.flatMap(({ members }) => members);
    myFriends.push(req.user._id);

    const notMyFriends = await User.find({
        _id: { $nin: myFriends },
        name: { $regex: name, $options: "i" },
        // username : {$regex: name, $options: "i" }
    })
        .select("_id name avatar")
        .exec();

    const data = notMyFriends.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
    })).sort((a, b) => {
        const startsWithA = a.name.toLowerCase().startsWith(name.toLowerCase());
        const startsWithB = b.name.toLowerCase().startsWith(name.toLowerCase());

        if (startsWithA && !startsWithB) return -1;
        if (!startsWithA && startsWithB) return 1;

        return a.name.localeCompare(b.name);
    });

    return res.status(200).json({
        success: true,
        message: "user fetch",
        data,
    })
})

exports.sendRequest = TryCatch(async (req, res, next) => {
    const { userId } = req.body;
    const id = req.user?._id;

    if (!userId) {
        return next(new ErrorHandler("Receiver id required", 400));
    }

    const request = await Request.findOne({
        $or: [
            { sender: id, receiver: userId },
            { sender: userId, receiver: id }
        ]
    });

    if (request) {
        return next(new ErrorHandler('Request already send', 208));
    }

    await Request.create({
        sender: id,
        receiver: userId,
    });

    emitEvent(req, NEW_REQUEST, [userId],)

    return res.status(200).json({
        success: true,
        message: 'Request sent.'
    })
})

exports.acceptRequest = TryCatch(async (req, res, next) => {
    const { requestId, accept } = req.body;

    if (typeof (accept) !== "boolean") {
        return next(new ErrorHandler("Accept Value must be true or false"))
    }

    const request = await Request.findById(requestId)
        .populate("receiver", "name")
        .populate("sender", "name");

    if (!request) {
        return next(new ErrorHandler("Request not found", 404));
    }

    if (request.receiver._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to accept this request"));
    }

    // Declined Request
    if (!accept) {
        await request.deleteOne();
        return res.status(200).json({
            success: accept,
            message: "Reject Friend Request",
        })
    }

    const members = [request.receiver._id, request.sender._id];

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}-${request.receiver.name}`
        }),
        request.deleteOne(),
    ])

    emitEvent(req, REFETCH_CHATS, members);
    return res.status(200).json({
        success: accept,
        message: "Friend Request Accepted",
        senderId: request.sender._id,
    })
})

exports.getMyNotifications = TryCatch(async (req, res, next) => {
    const id = req.user?._id;

    const request = await Request.find({ receiver: id })
        .populate("sender", "name avatar")
        .exec();

    if (!request || request.length < 1) {
        return res.status(200).json({
            success: true,
            message: "You have not any notification!",
            data: request || [],
        })
    }

    const allrequest = request.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url,
        },
        totalNotification: request.length
    }));

    return res.status(200).json({
        success: true,
        message: "Notification fetched",
        data: allrequest,
    })
})

exports.getMyFriends = TryCatch(async (req, res, next) => {
    const chatId = req.query.chatId;
    const id = req.user._id;

    const chats = await Chat.find({
        groupChat: false,
        members: { $in: [id] },
    }).select("members").populate("members", "name avatar");

    if (!chats || chats.length < 1) {
        return res.status(200).json({
            success: true,
            message: "You have no friends, Please find and connects with new friends",
            data: chats,
        })
    }

    const friends = chats.map(({ members }) => {
        const friend = getOtherMember(members, id);
        const { name, avatar, _id } = friend;
        return {
            _id,
            name,
            avatar: avatar.url,
        }
    });

    if (chatId) {
        const chat = await Chat.findById(chatId);
        const data = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        );

        return res.status(200).json({
            success: true,
            message: "Available Friends fetched",
            data,
        })
    }


    return res.status(200).json({
        success: true,
        message: "Friends fetched",
        data: friends,
    })
})