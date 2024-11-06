const { Schema, model, Types } = require('mongoose');

const messageSchema = Schema({
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    chat: {
        type: Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    content: String,
    attachments: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ]
}, {
    timestamps: true,
})

module.exports = model('Message', messageSchema);