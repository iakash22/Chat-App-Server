const { TryCatch } = require("../middlewares/error");
const { ErrorHandler } = require("../utils/utility");
const Chat = require('../models/chat');
const { emitEvent, deleteFilesFromCloudinary } = require("../utils/features");
const { ALERT, REFETCH_CHATS, NEW_ATTACHMENT, NEW_MESSAGE, NEW_MESSAGE_ALERT } = require("../constants/events");
const { getOtherMember } = require('../lib/helper');
const User = require("../models/user");
const Message = require("../models/message");
const { uploadImageCloudinary } = require("../utils/imageUploader");

exports.newGroupChat = TryCatch(async (req, res, next) => {
    const { name, members } = req.body;

    if (members.length < 2) {
        return next(new ErrorHandler('Group chat must have atleast 3 members', 400));
    }

    // members = members.filter((members))

    const allmembers = [...members, req.user._id];

    await Chat.create({
        name,
        groupChat: true,
        members: allmembers,
        creator: req.user._id,
    });

    emitEvent(req, ALERT, allmembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, allmembers);

    return res.status(200).json({
        success: true,
        message: "Group Created"
    })
});

exports.getMyChat = TryCatch(async (req, res) => {
    const id = req.user._id;
    // console.count(id);
    const chats = await Chat.find(
        {
            members: {
                $elemMatch: {
                    $eq: id
                }
            }
        }
    ).populate('members', "name username avatar");


    const tranformData = chats.map(({ _id, name, groupChat, members }) => {
        const otherMember = getOtherMember(members, id);

        return {
            _id,
            groupChat,
            avatar: groupChat ? (
                members.slice(0, 3).map(({ avatar }) => (avatar.url)
                )
            ) : (
                [otherMember.avatar.url]
            ),
            name: groupChat ? name : otherMember.name,
            members: members.reduce((prev, curr) => {
                if (curr._id.toString() !== id.toString()) {
                    prev.push(curr._id);
                }

                return prev;
            }, []),
        }
    })

    return res.status(200).json({
        success: true,
        data: tranformData,
    })
});

exports.getMyGroups = TryCatch(async (req, res) => {
    const id = req.user._id;

    const chats = await Chat.find({
        members: id,
        groupChat: true,
        creator: id,
    }).populate('members', 'name avatar');

    const group = chats.map(({ members, _id, groupChat, name }) => (
        {
            _id,
            name,
            groupChat,
            avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
        }))

    return res.status(200).json({
        success: true,
        data: group,
    })
});

exports.addMembers = TryCatch(async (req, res, next) => {
    const { chatId, members } = req.body;

    if (!chatId) {
        return next(new ErrorHandler('chat id not valid', 400));
    }

    if (!members || members.length < 1) {
        return next(new ErrorHandler('Please provide members', 400));
    }

    const chat = await Chat.findById({ _id: chatId });

    if (!chat) {
        return next(new ErrorHandler('chat not found', 404));
    }

    if (!chat.groupChat) {
        return next(new ErrorHandler('this is not a group chat', 400));
    }

    if (chat.creator.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('You are not allowed to add members', 403));
    }

    const allNewMembers = await User.find({ _id: { $in: members } }, "name");
    const uniqueMembers = allNewMembers
        .filter(({ _id }) => !chat.members.includes(_id.toString()))
        .map(({ _id }) => _id);

    if (!uniqueMembers || uniqueMembers < 1) {
        return next(new ErrorHandler('Please provide members who does not exist in this group', 400));
    }

    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100) {
        return next(new ErrorHandler('Group members limit reached', 400));
    }

    await chat.save();

    const allUserName = allNewMembers.map(({ name }) => name).join(",");

    emitEvent(req, ALERT, chat.members, { message: `${allUserName} has been added in the group`, chatId });
    emitEvent(req, REFETCH_CHATS, chat.members);
    const data = chat.toObject();
    data.totalMembers = chat.members.length;

    return res.status(200).json({
        success: true,
        message: `${allUserName} has been added in the group successfully`,
        data,
    })
});

exports.removeMembers = TryCatch(async (req, res, next) => {
    const { userId, chatId } = req.body;
    const { _id } = req.user;
    if (!chatId || !userId) {
        return next(new ErrorHandler('user id and chat id is required', 428));
    }

    const [chat, removeUser] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "name"),
    ]);

    if (!chat || !removeUser) {
        return next(new ErrorHandler(!chat ? "chat is not found!" : !removeUser ? "user is not found" : "invalid credintials", 404))
    }

    if (!chat.groupChat) {
        return next(new ErrorHandler('this is not group chat', 400));
    }

    // console.log(_id);

    if (chat.creator.toString() !== _id) {
        return next(new ErrorHandler('You are not allowed to remove members', 403));
    }

    if (chat.members.length <= 3) {
        return next(new ErrorHandler('Group have at least 3 members', 400));
    }

    const allChatMemmbers = chat.members;

    chat.members = chat.members.filter((member) => (
        member._id.toString() !== userId.toString()
    ));

    await chat.save();

    emitEvent(req, ALERT, chat.members, { message: `${removeUser.name} has removed from the group`, chatId });
    emitEvent(req, REFETCH_CHATS, allChatMemmbers, { userId, chatId });

    return res.status(200).json({
        succcess: true,
        message: "Member removed successfully",
    });
});

exports.leaveGroup = TryCatch(async (req, res, next) => {
    const chatId = req.params?.id;
    const id = req.user._id;

    if (!chatId) {
        return next(new ErrorHandler('chat id is required', 428));
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    if (!chat.groupChat) {
        return next(new ErrorHandler('this is not group chat', 400));
    }

    if (!chat.members.includes(id)) {
        return next(new ErrorHandler(`User doesn't exist in this ${chat.name} group`, 404));
    }

    const reamingMembers = chat.members.filter((member) => member.toString() !== id.toString());


    if (chat.creator.toString() === id.toString()) {
        const randomIndex = Math.floor(Math.random() * chat.members.length);
        const newCreator = reamingMembers[randomIndex];
        chat.creator = newCreator;
    }

    chat.members = reamingMembers;
    const user = await User.findById(id, "name");
    await chat.save();

    emitEvent(req, ALERT, chat.members, { message: `${user.name} has left the group`, chatId });
    emitEvent(req, REFETCH_CHATS, chat.members, { chatId, userId: id });

    return res.status(200).json({
        success: true,
        message: `${user.name} leave the group successfully`,
    })
});

exports.sendAttachments = TryCatch(async (req, res, next) => {
    const { chatId } = req.body;
    const userId = req.user._id;
    const files = req.files || [];

    if (files.length < 1) {
        return next(new ErrorHandler("Please Upload Attachments", 400));
    }

    if (files.length > 5) {
        return next(new ErrorHandler("Attachment must be 1-5", 400));
    }

    if (!chatId) {
        return next(new ErrorHandler('chat id is required', 428));
    }

    const [chat, me] = await Promise.all([
        Chat.findOne({
            _id: chatId,
            members: {
                $in: [userId]
            }
        }),
        User.findById(userId, "name")
    ]);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    // uploads files 
    const attachments = await uploadImageCloudinary(files);
    // console.log("attachments", attachments);
    const messageDb = {
        content: "",
        attachments,
        sender: userId,
        chat: chatId,
    }

    const messageForRealTime = {
        ...messageDb,
        sender: {
            _id: userId,
            name: me?.name,
        },
    };

    const message = await Message.create(messageDb);

    emitEvent(req, NEW_MESSAGE, chat.members, { message: messageForRealTime, chatId });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(200).json({
        success: true,
        message,
    })
});

exports.getChatDetails = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const { populate } = req.query;
    const userId = req.user._id;

    if (!chatId) {
        return next(new ErrorHandler('chat id is required', 428));
    }

    const chat = await Chat.findOne(
        {
            _id: chatId,
            members: { $in: [userId] },
        }
    )
        .populate("members", "name avatar username")
        .lean()
        .exec();

    // console.log(chat);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    // console.log(chat);
    if (populate === "true") {
        chat.members = chat.members.map(({ _id, name, avatar, username }) => (
            {
                _id,
                name,
                avatar: avatar.url,
                username,
            }
        ));

        return res.status(200).json({
            success: true,
            chat,
        });
    } else {
        const { members, groupChat } = chat;

        const otherMember = getOtherMember(chat.members, userId);
        const transformData = {
            ...chat,
            avatar: groupChat ? (
                members.slice(0, 3).map(({ avatar }) => (avatar.url)
                )
            ) : (
                [otherMember.avatar.url]
            ),
            friendName : groupChat ? "" : otherMember.name,
            members: members.map(({ _id }) => _id),
        }

        return res.status(200).json({
            success: true,
            chat: transformData,
        });
    }
});

exports.renameGroupName = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const newName = req.body.name;
    const userId = req.user._id;

    if (!chatId || !newName || newName === " ") {
        return next(new ErrorHandler('All fields is required', 428));
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    if (!chat.groupChat) {
        return next(new ErrorHandler('this is not a group chat', 400));
    }

    if (chat.creator.toString() !== userId.toString()) {
        return next(new ErrorHandler('You are not allowed to rename group name', 400));
    }

    chat.name = newName;
    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success: true,
        message: "Rename group suceesfully",
    });
});

exports.deleteChat = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const userId = req.user._id;

    if (!chatId) {
        return next(new ErrorHandler('chat id is required', 428));
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    if (chat.groupChat && chat.creator.toString() !== userId.toString()) {
        return next(new ErrorHandler('You are not allowed to delete the group', 403));
    }

    if (!chat.groupChat && !chat.members.includes(userId.toString())) {
        return next(new ErrorHandler('You are not allowed to delete the chat', 403));
    }

    // delete all messages and attachments 
    const messageAttachments = await Message.find({
        chat: chatId,
        attachments: { $exists: true, $ne: [] }
    });

    const public_ids = [];

    messageAttachments.forEach(({ attachments }) => {
        attachments.forEach((attachment) => {
            public_ids.push(attachment.public_id);
        })
    })

    await Promise.all([
        deleteFilesFromCloudinary(public_ids),
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId }),
    ])

    emitEvent(req, REFETCH_CHATS, chat.members, { chatId, userId });

    return res.status(200).json({
        success: true,
        message: `${chat.name} group deleted`
    })

});

exports.getMessages = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const userId = req.user._id;
    const { page = 1 } = req.query;

    if (!chatId) {
        return next(new ErrorHandler('chat id is required', 428));
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new ErrorHandler("chat is not found!", 404));
    }

    if (!chat?.members.includes(userId.toString())) {
        return next(new ErrorHandler("Chat is not found", 404));
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const [messages, totalMessageCount] = await Promise.all([
        Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name avatar')
            .lean()
            .exec(),
        Message.countDocuments({ chat: chatId }),
    ]);

    if (!messages || messages.length < 1) {
        return res.status(200).json({
            success: true,
            message: "Messages not found",
            data: messages || []
        })
    }

    const totalPages = Math.ceil(totalMessageCount / limit);

    return res.status(200).json({
        success: true,
        message: "Messages found successfully",
        data: messages.reverse(),
        totalPages,
    })
});

exports.getChatMembers = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId).populate('members', 'avatar name');
    if (!chat) {
        return next(new ErrorHandler('Chat not found', 404));
    }
    const { members, groupChat, _id, name } = chat;
    const filterMembers = members
        .filter((member) => member._id.toString() !== userId.toString())
    const data = {
        _id,
        avatar : groupChat ? members.slice(0, 3).map(({ avatar }) => (avatar.url)
                ) : (
                [filterMembers[0].avatar.url]
            ),
        members: filterMembers.map(({_id,name}) => ({_id,name})),
        groupName: groupChat ? name : "",
        groupChat,
    }
    return res.status(200).json({
        success: true,
        message: "Members fetched",
        data,
        chatId,
    });
})