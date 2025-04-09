const { Schema, model } = require('mongoose');

const userSchema = Schema({
    name: { type: String, trim: true, default: null },
    username: { type: String, trim: true, unique: true, default: null },
    email: { type: String, default: null }, // new 
    password: { type: String, default: null },
    avatar: {
        public_id: { type: String, default: null, },
        url: { type: String, default: null, }
    },
    token: { type: String, default: null }, // new 
    otp: { type: String, default: null }, // new 
    otpExipreAt: { type: Number, default: null, }, // new 
    tokenGenerateAt: { type: Number, default: null }, // new 
    bio: { type: String, default: "" },
    userIP: { type: String, default: "" }, // new 
    deviceToken: { type: String, default: null },
    isDeleted: { type: Boolean, default: false }, // new 
    isBlocked: { type: Boolean, default: false }, // new 
    createdAt: { type: Date, default: Date.now() }, // new 
    updatedAt: { type: Date, default: Date.now() }, // new 
});


module.exports = model('User', userSchema);