const { apiLimiter } = require('./rate-limiter');
const verifyAuth = require('./verify-auth');

module.exports = {
    apiLimiter,
    verifyJwt: verifyAuth.verifyToken,
    verifyJwtForSocket: verifyAuth.verifySocketToken,
    modGuard: verifyAuth.modGuard,
    adminGuard: verifyAuth.adminGuard,
};

