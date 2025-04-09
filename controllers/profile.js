const errors = require('../constants/errors');
const models = require('../models');
const { uploadImageCloudinary, deleteImageCloudinary } = require('../utils/imageUploader');
const { VerifyPassword, encryptPassword } = require('../utils/features');
const { model } = require('mongoose');


const getProfileByUsername = async (payload) => {
    try {
        console.log("payload :", payload);
        const user = await models.User.findOne({
            username: { $eq: payload.username },
            isDeleted: false,
        }).select("username avatar _id name bio email createdAt isBlocked updatedAt").lean().exec();

        if (!user) return errors.USERNAME_NOT_FOUND;
        if (user?.isBlocked) return errors.IS_BLOCKED_USER;


        let friendStatus = {
            sendRequest: false,
            receieveRequest: false,
            alreadyFriend: false,
        }

        if (payload?.userId && payload?.userId !== user?._id.toString()) {
            const myUser = await models.User.findById(payload?.userId).select("_id");

            if (myUser) {
                const alreadyFriend = await models.Chat.findOne({
                    groupChat: false,
                    members: { $all: [user?._id, myUser?._id] }
                });
                // console.log("alreadyFriend :", alreadyFriend);

                // check already friend
                if (alreadyFriend) {
                    friendStatus.alreadyFriend = true;
                }

                // check already send request
                if (!friendStatus.alreadyFriend) {
                    const sendRequestAlready = await models.Request.findOne({
                        sender: myUser?._id,
                        receiver: user?._id,
                    });

                    if (sendRequestAlready) {
                        friendStatus.sendRequest = true;
                    }
                }

                // check alreay receive reuest 
                if (!friendStatus.sendRequest && !friendStatus.alreadyFriend) {
                    const receieveRequestAlready = await models.Request.findOne({
                        sender: user?._id,
                        receiver: myUser?._id,
                    });

                    if (receieveRequestAlready) {
                        friendStatus.receieveRequest = true;
                    }
                }

            }
        }

        return { status: 200, message: "User Data Fetched", data: { ...user, friendStatus } };
    } catch (error) {
        console.log("Get Pofile by Username Controller Error :", error);
        return errors.SERVER_ERROR;
    }
}

const updateProfileGeneralDetails = async (payload) => {
    console.log("payload :", payload);
    try {
        const user = await models.User.findById(payload?.userId).select("avatar name email bio");
        if (!user) return errors.INVALID_USER_ID;

        let isUpdated = false;
        const updateFields = {};

        if (payload?.name && user.name !== payload?.name) {
            updateFields.name = payload?.name;
            isUpdated = true;
        }
        if (payload?.bio && user.bio !== payload?.bio) {
            updateFields.bio = payload?.bio;
            isUpdated = true;
        }
        if (payload?.email && user.email !== payload?.email) {
            updateFields.email = payload?.email;
            isUpdated = true;
        }
        if (payload?.public_id) {
            await deleteImageCloudinary(payload.public_id, 'image');
            updateFields.avatar = { url: null, public_id: null };
            isUpdated = true;
        }
        if (payload?.avatar) {
            const result = await uploadImageCloudinary([payload.avatar], 'Profile');
            updateFields.avatar = {
                public_id: result[0]?.public_id,
                url: result[0]?.url,
            };
            isUpdated = true;
        }

        if (!isUpdated) {
            return { status: 200, message: "No updates were made." };
        }

        // Apply updates and save
        Object.assign(user, updateFields);
        await user.save();

        return { status: 200, message: "Profile Updated", data: { ...user.toObject(), ...updateFields } };
    } catch (error) {
        console.log("Update Pofile General Details Controller Error :", error);
        return errors.SERVER_ERROR;
    }
}

const updateProfileAvatar = async (payload) => {
    try {
        const userId = payload?.userId;
        const file = payload?.avatar;
        const public_id = payload?.public_id;

        // console.log("avatar", file);

        if (!file) {
            return { ...errors.FIELDS_REQUIRED, message: "Please Upload Avatar" };
        }

        if (public_id) {
            const { error, result } = await deleteImageCloudinary(public_id, "image");

            if (error) {
                return { status: 401, error: error };
            }

            // console.log("result :", result);
        }

        const result = await uploadImageCloudinary([file], 'profile');

        const Avatar = {
            public_id: result[0]?.public_id,
            url: result[0]?.url,
        }

        const user = await models.User.findByIdAndUpdate(
            userId,
            { $set: { avatar: Avatar } },
            { new: true, select: "avatar" }
        );

        if (!user) return errors.INVALID_USER_ID;

        return { status: 200, message: "Avatar updated", data: user };

    } catch (error) {
        console.log("Update Pofile Avatar Controller Error :", error);
        return errors.SERVER_ERROR;
    }
}

const updateUsername = async (payload) => {
    try {
        const userId = payload?.userId;
        const usernameExist = await models.User.findOne({ username: payload.username });

        if (usernameExist) {
            return errors.USERNAME_ALREADY_TAKEN;
        }

        if (payload?.update) {
            const user = await models.User.findByIdAndUpdate(
                userId,
                { $set: { username: payload.username } },
                { new: true, select: "username" },
            );

            if (!user) return errors.INVALID_USER_ID;

            return { success: true, status: 200, message: "Username updated", data: user };
        }

        return { success: true, status: 200, message: "Available" };


    } catch (error) {
        console.log("Update Username Controller Error :", error);
        return errors.SERVER_ERROR;
    }
}

const updatePassword = async (payload) => {
    try {
        const userId = payload?.userId;
        const user = await models.User.findOne({ _id: userId });
        if (!user) {
            return errors.INVALID_USER_ID;
        }

        if (await VerifyPassword(payload?.password, user.password)) {
            return errors.SAME_PASSWORD_ERROR;
        }

        const hashPassword = await encryptPassword(payload.password);
        user.password = hashPassword;
        await user.save();

        return { success: true, status: 200, message: "Password updated", };
    } catch (error) {
        console.log("Update Username Controller Error :", error);
        return errors.SERVER_ERROR;
    }
}

module.exports = {
    getProfileByUsername: getProfileByUsername,
    updateUsername: updateUsername,
    updateProfileAvatar: updateProfileAvatar,
    updatePassword: updatePassword,
    updateProfileGeneralDetails: updateProfileGeneralDetails,
};