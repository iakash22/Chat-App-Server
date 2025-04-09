const express = require('express');
const validators = require('../validators');
const errors = require('../constants/errors');
const controllers = require('../controllers');
const { verifyToken } = require('../middlewares/auth');
const validation = require('express-joi-validation').createValidator();

const router = express.Router();

router.use(
    validation.headers(validators.authValidator.headerTokenValidator),
    verifyToken,
);

router.post(
    '/send',
    validation.body(validators.requestValidator.sendRequestValidator),
    async (req, res) => {
        try {
            const io = req.app.get('io');
            const data = await controllers.requestControllers.sendRequest({ myId: req.user.id, ...req.body, })(io);
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("SEND REQUEST ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)

router.post(
    '/action',
    validation.body(validators.requestValidator.acceptOrDeclinedRequestValidator),
    async (req, res) => {
        try {
            const io = req.app.get('io');
            const data = await controllers.requestControllers.acceptOrDeclinedRequest({ myId: req.user._id, ...req.body })(io);
            return res.status(data.status).json(data);
        } catch (error) {
            console.error("GET REQUEST ACTION ROUTE ERROR :", error);
            return res.status(500).json(errors.SERVER_ERROR);
        }
    }
)


module.exports = router; 