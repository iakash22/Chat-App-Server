const authValidator = require('./auth');
const profileValidator = require('./profile');
const requestValidator = require('./request');


module.exports = {
    authValidator : authValidator,
    profileValidator: profileValidator,
    requestValidator : requestValidator,
}