require('dotenv').config();
const basicAuth = require("basic-auth");

function authMiddleware(req, res, next) {
    const user = basicAuth(req);

    if (user && user.name === process.env.X_USER_AUTH && user.pass === process.env.X_USER_PASSWORD) {
        next(); // Lanjut ke handler berikutnya jika auth sukses
    } else {
        return res.status(401).json({ success: false, message: 'Invalid Unauthorized!' });
    }
}

module.exports = authMiddleware;