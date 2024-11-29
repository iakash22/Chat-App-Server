const express = require('express');
const { register, login, getMyProfile, searchUser, sendRequest, acceptRequest, getMyNotifications, getMyFriends, logout, getProfile } = require('../controllers/user');
const { singleAvatar } = require('../middlewares/multer');
const { errorMiddleware } = require('../middlewares/error');
const { isAuthenticate } = require('../middlewares/auth');
const { registerValidator, validatorHandler, loginValidator, sendRequestValidator, acceptRequestValidator } = require('../lib/validator');

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hello user page!");
})

router.post('/register', singleAvatar, registerValidator(), validatorHandler, register);
router.post('/login', loginValidator(), validatorHandler, login);
router.get('/profile/:username', getProfile);
router.post('/logout', logout);


router.get('/me', isAuthenticate, getMyProfile);
router.get('/search', isAuthenticate, searchUser);

router.use(isAuthenticate);
// Request routes
router.put('/sendrequest',
    sendRequestValidator(),
    validatorHandler,
    sendRequest
);

router.put(
    '/acceptrequest',
    acceptRequestValidator(),
    validatorHandler,
    acceptRequest,
)

router.get('/my-friends', getMyFriends);

router.get('/my-notification', getMyNotifications);

router.use(errorMiddleware);

module.exports = router;