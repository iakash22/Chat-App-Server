const Joi = require('joi');


const profileUsernamevalidator = Joi.object({
    username: Joi.string().required()
});

const updateProfileGeneralDetailsValidator = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    bio: Joi.string().optional(),
    public_id: Joi.alternatives().try(Joi.string().allow(null, ''), Joi.optional()), 
    avatar: Joi.optional(),
});

const profileAvatarValidator = Joi.object({
    public_id: Joi.string().optional(),
    avatar: Joi.any(),
});

const updateUsernameValidator = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).trim().required(),
    update: Joi.boolean(),
});

const updatePasswordValidator = Joi.object({
    password: Joi.string()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/)
        .messages({
            "string.pattern.base": "Password must be 6-20 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
            "any.required": "Password is required."
        })
});



module.exports = {
    profileUsernamevalidator: profileUsernamevalidator,
    updateProfileGeneralDetailsValidator: updateProfileGeneralDetailsValidator,
    updateUsernameValidator: updateUsernameValidator,
    profileAvatarValidator: profileAvatarValidator,
    updatePasswordValidator: updatePasswordValidator,
};