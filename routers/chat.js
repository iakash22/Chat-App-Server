const express = require('express');
const { errorMiddleware } = require('../middlewares/error');
const { isAuthenticate, isUser } = require('../middlewares/auth');
const { newGroupChat, getMyChat, getMyGroups, addMembers, removeMembers, leaveGroup, sendAttachments, getChatDetails, renameGroupName, deleteChat, getMessages, getChatMembers } = require('../controllers/chat');
const { attachmentsMulter } = require('../middlewares/multer');
const { newGroupValidator, validatorHandler, addMembersValidator, removeValidator, paramsValidator, sendAttachmentsValidator, renameValidator } = require('../lib/validator');

const router = express.Router();

router.use(isAuthenticate, isUser);

router.post('/new', newGroupValidator(), validatorHandler, newGroupChat);

router.get('/get-chat', getMyChat);

router.get('/get-group', getMyGroups);

router.put('/add-members', addMembersValidator(), validatorHandler, addMembers);

router.put('/remove-members', removeValidator(), validatorHandler, removeMembers);

router.delete('/leave-group/:id', paramsValidator(), validatorHandler, leaveGroup);

router.post('/message', attachmentsMulter, sendAttachmentsValidator(), validatorHandler, sendAttachments);

router.get('/message/:id', paramsValidator(), validatorHandler, getMessages);

router.route('/:id')
    .get(paramsValidator(), validatorHandler, getChatDetails)
    .put(renameValidator(), validatorHandler, renameGroupName)
    .delete(paramsValidator(), validatorHandler, deleteChat);

router.get('/members/:id', getChatMembers);

router.use(errorMiddleware);

module.exports = router;