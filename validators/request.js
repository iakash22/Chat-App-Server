const Joi = require('joi');

const sendRequestValidator = Joi.object({
    userId: Joi.string().required()
});

const acceptOrDeclinedRequestValidator = Joi.object({
    requestId: Joi.string().optional(),
    accepted: Joi.boolean().required(),
    userId : Joi.string().optional(),
})


module.exports = {
    sendRequestValidator: sendRequestValidator,
    acceptOrDeclinedRequestValidator : acceptOrDeclinedRequestValidator,
}

