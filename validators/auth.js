const Joi = require('joi');
const { isValidObjectId } = require('mongoose');

const registerValidator = Joi.object({
    name: Joi.string().min(2).max(50).trim().required().pattern(/^[a-zA-Z\s]+$/),
    username: Joi.string().alphanum().min(5).max(30).trim().required(),
    email: Joi.string().email().required(),
    bio: Joi.string(),
    password: Joi.string().min(6).max(50).required(),
    file: Joi.object(),
});

const loginValidator = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).trim().required(),
    password: Joi.string().min(6).max(50).required(),
});

const logoutValidator = Joi.object({
    userId: Joi.string().required(),
}).custom((value, helpers) => {
    if (!isValidObjectId(value.userId)) {
        return helpers.message("Invalid User Id");
    }
    return value;
})

const sendOtpValidator = Joi.object({
    username: Joi.string().alphanum(),
    email: Joi.string().email(),
}).custom((value, helpers) => {
    if (!value.username && !value.email) {
        return helpers.message('Either username or email is required');
    }
    return value;
})

const resetPasswordValidator = Joi.object({
    username: Joi.string().alphanum(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(50).required(),
    otp: Joi.string().length(6).required(),
}).custom((value, helpers) => {
    if (!value.username && !value.email) {
        return helpers.message('Either username or email is required');
    }
    return value;
})

const headerTokenValidator = Joi.object({
    authorization: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "Authorization token is missing"
        })
}).unknown(true);

module.exports = {
    registerValidator: registerValidator,
    loginValidator: loginValidator,
    logoutValidator: logoutValidator,
    sendOtpValidator, sendOtpValidator,
    resetPasswordValidator: resetPasswordValidator,
    headerTokenValidator : headerTokenValidator,
}
