const { Schema, model, Types } = require('mongoose');

const chatSchema = Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    groupChat: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: Types.ObjectId,
        ref: "User",
    },
    members: [
        {
            type: Types.ObjectId,
            ref: "User",
        }
    ]
}, {
    timestamps: true,
})

module.exports = model('Chat', chatSchema);