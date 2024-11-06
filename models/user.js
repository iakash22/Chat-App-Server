const { Schema, model } = require('mongoose');
const {hash} = require('bcrypt')

const userSchema = Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    bio: {
        type: String,
    }
}, {
    timestamps: true,
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await hash(this.password, 10);
});

module.exports = model('User', userSchema);