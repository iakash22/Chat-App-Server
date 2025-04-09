
const accountCreatedWelcomeEmail = (payload) => {
    return `
        <!DOCTYPE html>
        <html>

        <head>
            <meta charset="UTF-8">
            <title>Welcome to Chat Easy</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    background-color: #121212;
                    font-family: 'Poppins', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: linear-gradient(135deg, #3AE8FD, #10B6ED);
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    text-align: center;
                }
                .logo {
                    max-width: 100px;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #fff;
                    font-size: 28px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .cta-button {
                    background: #ffffff;
                    color: #007bff;
                    padding: 14px 24px;
                    border-radius: 30px;
                    text-decoration: none;
                    display: inline-block;
                    margin-top: 25px;
                    font-weight: 700;
                    font-size: 18px;
                    box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease-in-out;
                }
                .cta-button:hover {
                    background: #007bff;
                    color: #ffffff;
                }
                .footer {
                    font-size: 12px;
                    color: #ddd;
                    margin-top: 20px;
                }
                a {
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 600;
                }
                .highlight {
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dfrl5x5gr/image/upload/v1741871504/logo-2_tvjuqy.png" alt="Chat Easy Logo" class="logo">
                <h1>Welcome to Chat Easy!</h1>
                <p>Hi ${payload?.NAME},</p>
                <p class="highlight">You're officially part of the Chat Easy family! 🎉</p>
                <p>Enjoy seamless conversations, rich media sharing, and a whole new way to stay connected with your friends and loved ones.</p>
                <a href="${payload?.CLIENT_URL}" class="cta-button">Start Chatting Now</a>
                <p>Need help? <a href="${payload?.CLIENT_URL}">Visit our Help Center</a></p>
                <p>Cheers,<br><strong>The Chat Easy Team</strong></p>
                <div class="footer">
                    <p>Chat Easy Inc, 123 Tech Street, Bangalore</p>
                    <p>&copy; 2025 Chat Easy. All rights reserved.</p>
                </div>
            </div>
        </body>

        </html>

    `
}


const sendOtpEmail = (payload) => {
    return `
        <!DOCTYPE html>
        <html>

        <head>
            <meta charset="UTF-8">
            <title>Reset Password Request</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    background-color: #f4f4f4;
                    font-family: 'Poppins', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    width: 220px;
                    max-with : 200px;
                    margin-bottom: 20px;
                }
                h2 {
                    background: #007bff;
                    display: inline-block;
                    padding: 10px 20px;
                    color: #fff;
                    border-radius: 5px;
                }
                .footer {
                    font-size: 12px;
                    color: #777;
                    margin-top: 20px;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dfrl5x5gr/image/upload/v1741871504/logo-2_tvjuqy.png" alt="Chat Easy Logo" class="logo">
                <h1>Reset Your Password</h1>
                <p>Hi,</p>
                <p>You have requested to reset your password for <strong>Chat Easy</strong>. Use the following OTP to complete your password reset process. This OTP is valid for 5 minutes.</p>
                <h2>${payload?.OTP}</h2>
                <p>If you did not request this, please ignore this email.</p>
                <p>Regards,<br><strong>Chat Easy Team</strong></p>
                <div class="footer">
                    <p>Chat Easy Inc, 123 Tech Street, Bangalore</p>
                    <p>&copy; 2025 Chat Easy. All rights reserved.</p>
                </div>
            </div>
        </body>

        </html>
    `
}

const passwordUpdatedEmail = (payload) => {
    return `
        <!DOCTYPE html>
        <html>

        <head>
            <meta charset="UTF-8">
            <title>Password Update Confirmation</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    background-color: #f4f4f4;
                    font-family: 'Poppins', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    width: 220px;
                    max-with : 200px;
                    margin-bottom: 20px;
                }
                h2 {
                    background: #007bff;
                    display: inline-block;
                    padding: 10px 20px;
                    color: #fff;
                    border-radius: 5px;
                }
                .footer {
                    font-size: 12px;
                    color: #777;
                    margin-top: 20px;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dfrl5x5gr/image/upload/v1741871504/logo-2_tvjuqy.png" alt="Chat Easy Logo" class="logo">
                <h1>Password Update Confirmation</h1>
                <p>Hi,</p>
                <p>Your password for <strong>Chat Easy</strong> has been successfully updated.</p>
                <p>If you did not request this change, please contact our support team immediately.</p>
                <p>Regards,<br><strong>Chat Easy Team</strong></p>
                <div class="footer">
                    <p>Chat Easy Inc, 123 Tech Street, Bangalore</p>
                    <p>&copy; 2025 Chat Easy. All rights reserved.</p>
                </div>
            </div>
        </body>

        </html>
    `
}

const newLoginAlertEmail = (payload) => {
    return `
        <!DOCTYPE html>
        <html>

        <head>
            <meta charset="UTF-8">
            <title>New Login Detected - Chat Easy</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    background-color: #121212;
                    font-family: 'Poppins', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: linear-gradient(135deg, #3AE8FD, #10B6ED);
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    text-align: center;
                }
                .logo {
                    max-width: 100px;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #fff;
                    font-size: 28px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .cta-button {
                    background: #ffffff;
                    color: #007bff;
                    padding: 14px 24px;
                    border-radius: 30px;
                    text-decoration: none;
                    display: inline-block;
                    margin-top: 25px;
                    font-weight: 700;
                    font-size: 18px;
                    box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease-in-out;
                }
                .cta-button:hover {
                    background: #007bff;
                    color: #ffffff;
                }
                .footer {
                    font-size: 12px;
                    color: #ddd;
                    margin-top: 20px;
                }
                a {
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 600;
                }
                .highlight {
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dfrl5x5gr/image/upload/v1741871504/logo-2_tvjuqy.png" alt="Chat Easy Logo" class="logo">
                <h1>New Login Detected!</h1>
                <p>Hi there,</p>
                <p class="highlight">We noticed a new login to your Chat Easy account. 📍</p>
                <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
                <p><strong>Login Details:</strong></p>
                <p>📅 Date: <strong>${payload?.DATE}</strong></p>
                <p>🌍 Location: <strong>${payload?.LOCATION}</strong></p>
                <p>🖥️ Device: <strong>${payload?.DEVICE}</strong></p>
                <a href="${payload?.CLIENT_URL}" class="cta-button">Secure My Account</a>
                <p>Need help? <a href="#">Visit our Help Center</a></p>
                <p>Cheers,<br><strong>The Chat Easy Team</strong></p>
                <div class="footer">
                    <p>Chat Easy Inc, 123 Tech Street, Bangalore</p>
                    <p>&copy; 2025 Chat Easy. All rights reserved.</p>
                </div>
            </div>
        </body>

        </html>
    `
}


module.exports = {
    accountCreatedWelcomeEmail: accountCreatedWelcomeEmail,
    sendOtpEmail: sendOtpEmail,
    passwordUpdatedEmail: passwordUpdatedEmail,
    newLoginAlertEmail : newLoginAlertEmail,
};