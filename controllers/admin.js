const { TryCatch } = require("../middlewares/error");
const chat = require("../models/chat");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const { ErrorHandler } = require("../utils/utility"); 
const jwt = require("jsonwebtoken");
const { options } = require('../utils/features');


exports.login = TryCatch(async (req, res, next) => {
    const { secretKey } = req.body;
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || "Akash022#";
    const isMatched = secretKey === adminSecretKey;
    if (!isMatched) {
        return next(new ErrorHandler("Secret key is wrong", 401));
    }

    const payload = {
        role: "Admin",
        secretKey,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

    return res.status(200).cookie(
        "token",
        token,
        {
            ...options,
            expires: new Date(Date.now() + 15 * 60 * 1000)
        }
    ).json({
        success: true,
        message: "Welcome back, Time to take charge and keep everything running smoothly."
    })
});

exports.adminLogout = TryCatch(async (req, res, next) => {
    res.status(200).cookie("token", "", { ...options, expires: new Date(0) }).json({
        success: true,
        message: "You’ve logged out, See you again soon!"
    })
})

exports.getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find();

    const transformUsers = await Promise.all(
        users.map(async ({ name, avatar, username, _id }) => (
            {
                name,
                avatar: avatar.url,
                _id,
                username,
                groups: await Chat.countDocuments({ groupChat: true, members: _id }),
                friends: await Chat.countDocuments({ groupChat: false, members: _id })
            }
        ))
    );

    return res.status(200).json({
        success: true,
        message: "Users data fetched",
        data: transformUsers,
    });
})

exports.getAllChats = TryCatch(async (req, res, next) => {
    const chats = await Chat.find().populate("members", "name avatar").populate("creator", "name avatar");

    const transformChats = await Promise.all(
        chats.map(async ({ members, _id, groupChat, name, creator }) => {
            return {
                name,
                _id,
                groupChat,
                avatar: members.slice(0, 3).map((member) => member.avatar.url),
                members: members.map(({ _id, name, avatar }) => ({
                    _id,
                    name,
                    avatar: avatar.url,
                })),
                creator: {
                    // _id: creator._id,
                    name: creator?.name || "None",
                    avatar: creator?.avatar.url || "None",
                },
                totalMessages: await Message.countDocuments({ chat: _id }),
                totalMembers: members.length
            }
        })
    )

    return res.status(200).json({
        success: true,
        message: "Chat data fetched",
        data: transformChats,
    });
});

exports.getAllMessages = TryCatch(async (req, res, next) => {

    const messages = await Message.find().populate('sender', "name avatar").populate("chat", "groupChat name");

    const transformMessage = messages.map(({ content, attachments, _id, sender, createdAt, chat }) => ({
        _id,
        attachments,
        content,
        createdAt,
        chat: {
            _id: chat._id,
            name: chat.name,
        },
        groupChat: chat.groupChat,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url,
        }
    }))

    return res.status(200).json({
        success: true,
        message: "Messages data fetched",
        data: transformMessage.reverse(),
    });
});

exports.getAdminData = TryCatch(async (req, res, next) => {
    return res.status(200).json({
        success: true,
        admin: true,
    });
})

exports.getDashboardStats = TryCatch(async (req, res, next) => {

    const [groupsCount, usersCount, messagesCount, totalChatsCount] = await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
    ]);

    const today = new Date();
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);

    const last7daysMessage = await Message.find({
        createdAt: {
            $gte: last7days,
            $lte: today,
        }
    }).select("createdAt").exec();
    const messages = new Array(7).fill(0);

    last7daysMessage.forEach((message) => {
        const dayInMS = 1000 * 60 * 60 * 24;
        const index = Math.floor(
            (today.getTime() - message.createdAt.getTime()) / dayInMS
        );
        messages[6 - index]++;
    })

    const data = {
        usersCount,
        singleChatCount : totalChatsCount - groupsCount,
        totalChatsCount,
        groupsCount,
        messagesCount,
        messageChart: messages
    };

    return res.status(200).json({
        success: true,
        message: "Dashboard Stats data fetched",
        data,
    });
});