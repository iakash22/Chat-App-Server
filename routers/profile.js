const express = require('express');
const validation = require('express-joi-validation').createValidator();
const validators = require('../validators');
const errors = require('../constants/errors');
const controllers = require('../controllers');
const { verifyToken } = require('../middlewares/auth');
const { singleAvatar } = require('../middlewares/multer');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.get(
    '/:username',
    validation.params(validators.profileValidator.profileUsernamevalidator),
    async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            let decode = null;
            if (token) {
                decode = jwt.decode(token);
            }
            
            const data = await controllers.profileControllers.getProfileByUsername({...req.params, userId : decode?.id});
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("GET PROFILE ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.use(
    validation.headers(validators.authValidator.headerTokenValidator),
    verifyToken,
)

router.put(
    '/updateProfileGeneralDetails',
    singleAvatar,
    validation.body(validators.profileValidator.updateProfileGeneralDetailsValidator),
    async (req, res) => {
        try {
            const avatar = req.file
            const data = await controllers.profileControllers.updateProfileGeneralDetails({ ...req.body, avatar, userId: req?.user?._id });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("UPDATE PROFILE GENERAL DETAILS ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
);

router.put(
    '/updateAvatar',
    singleAvatar,
    validation.body(validators.profileValidator.profileAvatarValidator),
    async (req, res) => {
        try {
            // console.log("file :", req.file);
            const data = await controllers.profileControllers.updateProfileAvatar({ avatar: req.file, ...req.body, userId: req?.user?._id });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("UPDATE PROFILE AVATAR ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    });

router.put(
    '/updateUsername',
    validation.body(validators.profileValidator.updateUsernameValidator),
    async (req, res) => {
        try {
            const data = await controllers.profileControllers.updateUsername({ ...req.body, userId: req?.user?._id });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("UPDATE PROFILE USERNAME ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.put(
    '/updatePassword',
    validation.body(validators.profileValidator.updatePasswordValidator),
    async (req, res) => {
        try {
            const data = await controllers.profileControllers.updatePassword({ ...req.body, userId: req?.user?._id });
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("UPDATE PROFILE PASSWORD ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

module.exports = router;