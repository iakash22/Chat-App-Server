const nodemailer = require('nodemailer');
const errors = require('../constants/errors');
require('dotenv').config();

const emailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // console.log("email body : ", body);

        let info = await transporter.sendMail({
            from: 'Chat Easy',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        return info;

    } catch (err) {
        console.error("Error Occurred while email sender instance ", err);
        return errors.SERVER_ERROR;
    }
}

module.exports = emailSender;