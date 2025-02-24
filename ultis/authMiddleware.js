require('dotenv').config();
const basicAuth = require("basic-auth");

function authMiddleware(req, res, next) {
    const contentType = req.headers["content-type"];
    const user = basicAuth(req);

    // console.log('user', user);
    console.log('contentType', contentType);


    if (user && user.name === process.env.X_USER_AUTH && user.pass === process.env.X_USER_PASSWORD) {
        // if (!contentType || !contentType.includes("application/json")) {
        //     return res.status(401).json({ message: "Unauthorized: ContentType Not Allowed" });
        // } else {
        next(); // Lanjut ke handler berikutnya jika auth sukses
        // }

    } else {
        return res.status(401).json({ success: false, message: 'Invalid Unauthorized!' });
    }
}

module.exports = authMiddleware;