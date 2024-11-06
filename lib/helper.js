const { userSocketIDs } = require('../constants/userMap')

exports.getOtherMember = (members, _id) => {
    return members.find((member) => member._id.toString() !== _id.toString())
};

exports.checkCreator = (creatorId, userId) => {
    return creatorId.toString === userId.toString();
}

exports.getSocketIDs = (users) => {
    return users.map((user) => userSocketIDs.get(user.toString()));
}

exports.getBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}