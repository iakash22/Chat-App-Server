const express = require('express');
const {
    getAllUsers,
    getAllChats,
    getAllMessages,
    getDashboardStats,
    login,
    getAdminData,
    adminLogout
} = require('../controllers/admin');
const { adminLoginValidator, validatorHandler } = require('../lib/validator');
const { errorMiddleware } = require('../middlewares/error');
const { isAuthenticate, isAdmin } = require('../middlewares/auth');

const router = express.Router();
router.post('/login', adminLoginValidator(), validatorHandler, login);
router.post('/logout', adminLogout);

router.use(isAuthenticate, isAdmin);


router.get('/', getAdminData);
router.get('/users', getAllUsers);
router.get('/chats', getAllChats);
router.get('/messages', getAllMessages);
router.get('/dashboard/stats', getDashboardStats);


router.use(errorMiddleware);

module.exports = router;