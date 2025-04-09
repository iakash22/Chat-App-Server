const User = require('../models/user');
const { tokenGenerateToken, encryptPassword, VerifyPassword, generateOtp, getGeoLocation } = require('../utils/features');
const { uploadImageCloudinary } = require('../utils/imageUploader');
const errors = require('../constants/errors');
const emailSender = require('../utils/emailSender');
const mail = require('../mail');
const { format } = require('date-fns');

const CLIENT_URL = "http://localhoast:5173"

const register = async (payload) => {
    try {
        const { name, username, password, bio, email, deviceToken, userIP } = payload;
        // console.log("Payload :", payload);

        const file = payload?.avatar;
        // console.log("file : ", file);

        if (!file) {
            return { ...errors.FIELDS_REQUIRED, message: "Please Upload Avatar" };
        }

        const checkUserName = await User.findOne({ username });
        if (checkUserName) {
            return errors.USERNAME_ALREADY_TAKEN;
        }

        const checkWithEmail = await User.findOne({ email });
        if (checkWithEmail) {
            return errors.USER_ALREADY_EXISTS;
        }


        // console.log(file);

        const result = await uploadImageCloudinary([file], 'Profile');
        // console.log("result :", result);
        const Avatar = {
            public_id: result[0]?.public_id,
            url: result[0]?.url,
        }


        const hashPassword = await encryptPassword(password);
        const tokenGenerateAt = Date.now();

        const user = await User.create({
            name,
            username,
            bio,
            email,
            password: hashPassword,
            avatar: Avatar,
            isDeleted: false,
            isBlocked: false,
            tokenGenerateAt,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deviceToken,
            userIP,
        });

        const token = tokenGenerateToken({ username, tokenGenerateAt, id: user?._id });
        user.token = token;
        await user.save();
        await emailSender(email, "Account Created", mail.templates.accountCreatedWelcomeEmail({ CLIENT_URL, NAME: name, }));

        user.password = undefined;

        return { status: 200, data: user, message: `Hello ${user.name}, let’s chat, connect, and have fun!` };
    } catch (error) {
        console.error("Error Ocurred Occurred while register user controller", error);
        return errors.SERVER_ERROR;
    }
};


// Pending password not get in user findOne method
const login = async (payload) => {
    try {
        const { username, password, email, userIP, device } = payload;
        const user = await User.findOne({ username })

        if (!user) {
            return errors.USER_DOESNOT_EXISTS;
        }
        // console.log(user);

        if (await VerifyPassword(password, user.password)) {
            const tokenGenerateAt = Date.now();
            const token = tokenGenerateToken({ tokenGenerateAt, username, id: user._id });

            const lastUserIp = user?.userIP;

            if (lastUserIp && lastUserIp !== userIP) {
                const newLocation = await getGeoLocation(userIP);
                const deviceInfo = `${device.browser} on ${device.os} (${device.isMobile ? "Mobile" : "Desktop"})`
                console.log("New Location Login detect", deviceInfo);

                const today = new Date();
                const date = format(today, "EEEE dd/mm/yyy kk:mm O");

                if (user?.email) {
                    // Send email alert
                    emailSender(user.email, "New Login Detected", mail.templates.newLoginAlertEmail({ DATE: date, LOCATION: newLocation, DEVICE: deviceInfo, CLIENT_URL }));
                }
            }

            const updateUser = await User.findByIdAndUpdate(user._id, { token, tokenGenerateAt, userIP }, { new: true }).select("-password").exec();

            return { status: 200, message: `Welcome Back, ${user.name}`, data: updateUser }
        } else {
            return errors.WRONG_PASSWORD;
        }

    } catch (error) {
        console.error("Error Ocurred Occurred while login controller", error);
        return errors.SERVER_ERROR;
    }
}

const logout = async (payload) => {
    try {
        const userId = payload.userId;
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return errors.INVALID_USER_ID;
        }

        user.token = null;
        user.tokenGenerateAt = null;
        await user.save();
        return { status: 200, message: "You’ve logged out, See you again soon!" };
    } catch (error) {
        console.error("Error Ocurred Occurred while logout controller", error);
        return errors.SERVER_ERROR;
    }
}

const sendOtp = async (payload) => {
    try {
        const { email, username } = payload;
        let user;
        if (username) {
            user = await User.findOne({ username });
        } else {
            user = await User.findOne({ email });
        }

        if (!user) {
            return username ? errors.USERNAME_NOT_FOUND : errors.EMAIL_NOT_FOUND;
        }

        const otp = generateOtp();
        const expiryTime = 5 * 60 * 1000
        const otpExipreAt = Date.now() + expiryTime;

        user.otp = otp;
        user.otpExipreAt = otpExipreAt;
        await user.save();
        if (user?.email) {
            console.log("Email send on :", user?.email);
            await emailSender(user?.email, "Reset Password Request", mail.templates.sendOtpEmail({ OTP: otp }));
        }

        return { status: 200, message: "Code Send to register email id", data: { otp, email: user?.email, username: user?.username } };
    } catch (error) {
        console.error("Error Ocurred Occurred while forgetPassword controller", error);
        return errors.SERVER_ERROR;
    }
}

const resetPassword = async (payload) => {
    try {
        const { otp, username, email, password } = payload;

        let user;
        if (username) {
            user = await User.findOne({ username });
        } else {
            user = await User.findOne({ email });
        }

        if (!user) {
            return errors.USER_DOESNOT_EXISTS;
        }

        if (otp !== user?.otp) {
            return errors.INVALID_OTP;
        }

        if (Date.now() > user?.otpExpiresAt) {
            return errors.EXPIRE_OTP;
        }

        const hashPassword = await encryptPassword(password);
        user.password = hashPassword;
        user.otp = null;
        user.otpExipreAt = null;
        user.updatedAt = Date.now();
        await user.save();
        if (user?.email) {
            await emailSender(user?.email, "Password Updated", mail.templates.passwordUpdatedEmail({}));
        }

        return { status: 200, message: "Password Reseted." };

    } catch (error) {
        console.error("Error Ocurred Occurred while reset password controller", error);
        return errors.SERVER_ERROR;
    }
}


module.exports = {
    register: register,
    login: login,
    sendOtp: sendOtp,
    resetPassword: resetPassword,
    logout: logout
}