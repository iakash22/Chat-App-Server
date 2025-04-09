const { Schema, model, Types } = require('mongoose');

const requestSchema = Schema({
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"],
    },
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    updatedAt: {
        type: Number,
        default: Date.now(),
    }
});

module.exports = model('Request', requestSchema);