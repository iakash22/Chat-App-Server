const { validationResult, body, check, param } = require('express-validator');
const { ErrorHandler } = require('../utils/utility');
const { default: mongoose } = require('mongoose');

const validatorHandler = (req, res, next) => {
    if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler('Invalid Chat ID format', 400));
    }
    const errors = validationResult(req);
    // console.log(req.file);
    const errorMessage = errors.array().map((error) => error.msg).join(", ");
    // console.log(errors);
    if (errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessage, 400));
}

const registerValidator = () => [
    body('name', "Please Enter Name").notEmpty(),
    body('username', "Please Enter Username").notEmpty(),
    body('password', "Please Enter Password").notEmpty(),
    body('bio', "Please Enter Bio").notEmpty(),
];

const loginValidator = () => [
    body('username', "Please Enter Username").notEmpty(),
    body('password', "Please Enter Password").notEmpty(),
];

const newGroupValidator = () => [
    body('name', "Please Enter Group Name").notEmpty(),
    body('members')
        .notEmpty().withMessage('Please Add Members')
        .isArray({ min: 2, max: 100 }).withMessage('Members must be 2-100'),
];

const removeValidator = () => [
    body('chatId', "Please Enter Chat ID").notEmpty(),
    body('userId', "Please Enter Remover User ID").notEmpty(),
]

const sendAttachmentsValidator = () => [
    body('chatId', "Please Enter Chat ID").notEmpty(),
]

const addMembersValidator = () => [
    body('chatId', "Please Enter Chat ID").notEmpty(),
    body('members')
        .notEmpty().withMessage('Please Add Members')
        .isArray({ min: 1, max: 97 }).withMessage('Members must be 1-97'),
]
const paramsValidator = () => [
    param('id', "Please Enter Chat ID").notEmpty(),
]

const renameValidator = () => [
    paramsValidator(),
    body('name', "Please Enter your group new name").notEmpty(),
]

const sendRequestValidator = () => [
    body('userId', "Please Enter Receiver ID").notEmpty(),
]

const acceptRequestValidator = () => [
    body('requestId', "Please Enter Request ID").notEmpty(),
    body('accept')
        .notEmpty().withMessage("Please give accept value")
        .isBoolean().withMessage('Accept Value must be true or false')
]

const adminLoginValidator = () => [
    body("secretKey", "Please Enter Admin key").notEmpty(),
];

module.exports = {
    validatorHandler,
    registerValidator,
    newGroupValidator,
    loginValidator,
    removeValidator,
    addMembersValidator,
    renameValidator,
    sendAttachmentsValidator,
    paramsValidator,
    sendRequestValidator,
    acceptRequestValidator,
    adminLoginValidator
}