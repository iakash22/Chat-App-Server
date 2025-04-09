const { model } = require('mongoose');
const errors = require('../constants/errors');
const models = require('../models');
const { emitEvent } = require('../utils/features');
const { REFETCH_CHATS, NEW_REQUEST } = require('../constants/events');


const sendRequest = (payload) => async (io) => {
    try {
        console.log("io cn:", io);
        const checkRequestIfExist = await models.Request.findOne({
            $or: [
                { sender: payload?.myId, receiver: payload?.userId },
                { sender: payload?.userId, receiver: payload?.myId }
            ]
        });

        if (checkRequestIfExist) {
            return errors.FRIEND_REQUEST_ALREADY_SEND_OR_RECEIVE;
        }

        await models.Request.create({
            sender: payload?.myId,
            receiver: payload?.userId,
            status: "pending"
        });

        emitEvent(null, NEW_REQUEST, [payload?.userId], null, io);

        const friendStatus = {
            alreadyFriend: false,
            receieveRequest: false,
            sendRequest: true,
        };

        return { status: 200, success: false, message: "Friend Request Send", data: friendStatus };
    } catch (error) {
        console.error("GET SEND REQUEST CONTROLLER ERROR :", error);
        return errors.SERVER_ERROR;
    }
}

const acceptOrDeclinedRequest = (payload) => async (io) => {
    try {
        const { accepted, requestId, myId, userId } = payload;

        let request = null;
        if (requestId) {
            request = await models.Request.findOne({ _id: requestId }).populate("receiver", "name").populate("sender", "name");
        } else {
            request = await models.Request.findOne({
                sender: userId,
                receiver: myId,
            }).populate("receiver", "name").populate("sender", "name");
        }

        if (!request) {
            return errors.BAD_REQUEST;
        }

        if (request.receiver._id.toString() !== myId.toString()) {
            return errors.BAD_REQUEST;
        }

        const friendStatus = {
            alreadyFriend: false,
            receieveRequest: false,
            sendRequest: false
        }

        if (!accepted) {
            await request.deleteOne();
            return { status: 200, success: true, message: "Friend Request Rejected", data: friendStatus };
        }

        const members = [request.receiver._id, request.sender._id];
        await Promise.all([
            models.Chat.create({
                members,
                name: `${request.sender.name}-${request.receiver.name}`
            }),
            request.deleteOne()
        ]);

        emitEvent(null, REFETCH_CHATS, members, null, io);
        friendStatus.alreadyFriend = true;
        return { status: 200, success: true, message: "Friend Request Accepted", data: friendStatus }
    } catch (error) {
        console.error("GET ACCEPT OR DECLINED REQUEST CONTROLLER ERROR :", error);
        return errors.SERVER_ERROR;
    }
}


module.exports = {
    sendRequest: sendRequest,
    acceptOrDeclinedRequest: acceptOrDeclinedRequest,
}