const message = require("../models/message");

const status = 400;

const SERVER_ERROR = {
    status: 500,
    message: "Server Error!",
    type : "SERVER_ERROR",
}

const USER_ALREADY_EXISTS = {
    status,
    message: "USER ALREADY EXISTS",
    type: "USER_EXISTS",
}

const USER_DOESNOT_EXISTS = {
    status,
    message: "User doesn't exists, Please register!",
    type : "USER_DOESNOT_EXISTS",
}

const USERNAME_ALREADY_TAKEN = {
    status,
    message: "Username is already taken.",
    type : "USERNAME_ALREADY_TAKEN",
}

const WRONG_PASSWORD = {
    status: 401,
    message: "Wrong Password", 
    type : "WRONG_PASSWORD"
}

const INVALID_ACCESS_TOKEN = {
    status: 401,
    message: "Token Invalid",
    type : "INVALID_ACCESS_TOKEN",
}

const EXPIRE_ACCESS_TOKEN = {
    status: 422,
    message: "Token Expired",
    type : "EXPIRE_ACCESS_TOKEN",
}

const ACCOUNT_SOFT_DELETE = {
    status: 404,
    message: "Account Not Found",
    type : "ACCOUNT_SOFT_DELETE"
}

const ACCOUNT_ALREADY_SOFT_DELETE = {
    status: 404,
    message: "Account Already Delete",
    type : "ACCOUNT_ALREADY_SOFT_DELETE"
}

const BAD_REQUEST = {
    status,
    message: "Bad Request!",
    type : "BAD_REQUEST",
}

const EXPIRE_OTP = {
    status,
    message: "Otp Expire",
    type: "EXPIRE_OTP",
};

const INVALID_OTP = {
    status,
    message: "Invalid otp",
    type: "INVALID_OTP"
};

const FIELDS_REQUIRED = {
    status,
    message: "All Fields Required",
    type : "FIELDS_REQUIRED",
}

const INVALID_USER_ID = {
    status,
    message: "Invalid User Id",
    type : "INVALID_VALUE",
}

const USERNAME_NOT_FOUND = {
    status,
    message: "Username not found",
    type: "USERNAME_NOT_FOUND",
};

const IS_BLOCKED_USER = {
    status,
    message: "User Blocked",
    type : "IS_BLOCKED_USER"
}

const EMAIL_NOT_FOUND = {
    status,
    message: "Email not found",
    type: "EMAIL_NOT_FOUND",
};

const TOKEN_MISSING = {
    status,
    message: "Token is missing",
    type : "TOKEN_MISSING",
}

const UNAUTHORIZED_USER = {
    status: 404,
    message: "UNAUTHORIZED USER, THIS IS PRIVATE ROUTE",
    type: "UNAUTHORIZED_USER"
}

const SAME_PASSWORD_ERROR = {
    status: 400,
    message: "New password cannot be the same as the previous passwords.",
    type: "SAME_PASSWORD_ERROR"
};

// Friend Request

const FRIEND_REQUEST_ALREADY_SEND_OR_RECEIVE = {
    status: 400,
    message: "Request already recieve or send!",
    type : "FRIEND_REQUEST_ALREADY_SEND_OR_RECEIVE"
}

module.exports = {
    SERVER_ERROR : SERVER_ERROR,
    USER_ALREADY_EXISTS: USER_ALREADY_EXISTS,
    USER_DOESNOT_EXISTS: USER_DOESNOT_EXISTS,
    WRONG_PASSWORD: WRONG_PASSWORD,
    INVALID_ACCESS_TOKEN: INVALID_ACCESS_TOKEN,
    EXPIRE_ACCESS_TOKEN: EXPIRE_ACCESS_TOKEN,
    ACCOUNT_SOFT_DELETE: ACCOUNT_SOFT_DELETE,
    ACCOUNT_ALREADY_SOFT_DELETE: ACCOUNT_ALREADY_SOFT_DELETE,
    BAD_REQUEST: BAD_REQUEST,
    EXPIRE_OTP: EXPIRE_OTP,
    USERNAME_ALREADY_TAKEN: USERNAME_ALREADY_TAKEN,
    INVALID_OTP: INVALID_OTP,
    FIELDS_REQUIRED: FIELDS_REQUIRED,
    INVALID_USER_ID: INVALID_USER_ID,
    USERNAME_NOT_FOUND: USERNAME_NOT_FOUND,
    EMAIL_NOT_FOUND: EMAIL_NOT_FOUND,
    IS_BLOCKED_USER: IS_BLOCKED_USER,
    TOKEN_MISSING : TOKEN_MISSING,
    UNAUTHORIZED_USER: UNAUTHORIZED_USER,
    SAME_PASSWORD_ERROR: SAME_PASSWORD_ERROR,
    FRIEND_REQUEST_ALREADY_SEND_OR_RECEIVE : FRIEND_REQUEST_ALREADY_SEND_OR_RECEIVE,
};