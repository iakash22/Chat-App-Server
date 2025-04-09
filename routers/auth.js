const express = require('express');
const controllers = require('../controllers');
const { singleAvatar } = require('../middlewares/multer');
const errors = require('../constants/errors');
const { createValidator } = require('express-joi-validation');
const validator = require('../validators');
const requestIp = require('request-ip');
const userAgent = require('express-useragent');

const router = express.Router();
const validation = createValidator();


router.get('/', userAgent.express(), (req, res) => {
    const ip = requestIp.getClientIp(req);
    console.log("ip request", ip);
    const device = req.useragent;

    console.log("User Agent : ", date);


    return res.send(`Your Ip and device is ${ip} and ${device}`);
});


router.post(
    '/register',
    singleAvatar,
    validation.body(validator.authValidator.registerValidator),
    async (req, res) => {
        try {
            const ip = requestIp.getClientIp(req);
            // console.log("request", req);
            const data = await controllers.authContollers.register({ ...req.body, avatar: req.file, userIP: ip });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("Error Ocurred Occurred while register user route", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    });

router.post(
    "/login",
    userAgent.express(),
    validation.body(validator.authValidator.loginValidator),
    async (req, res) => {
        try {

            const ip = requestIp.getClientIp(req);
            const deviceInfo = req.useragent;
            const device = {
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                device: deviceInfo.isMobile ? "Mobile" : "Desktop",
            }
            const data = await controllers.authContollers.login({ ...req.body, userIP: ip, device, });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("Error Ocurred Occurred while login user route", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.post(
    "/logout",
    validation.body(validator.authValidator.logoutValidator),
    async (req, res) => {
        try {
            const data = await controllers.authContollers.logout(req.body);
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("Error Ocurred Occurred while login user route", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.post(
    '/send-otp',
    validation.body(validator.authValidator.sendOtpValidator),
    async (req, res) => {
        try {
            const data = await controllers.authContollers.sendOtp(req.body);
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("Error Ocurred Occurred while forget password user route ", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.post(
    '/reset-password',
    validation.body(validator.authValidator.resetPasswordValidator),
    async (req, res) => {
        try {
            const data = await controllers.authContollers.resetPassword(req.body);
            console.log("Data :", data);
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("Error Ocurred Occurred while reset password user route ", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

module.exports = router;