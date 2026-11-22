const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

function createAccessToken(userID) {
    const payload = {
        sub: userID,
    };

    const options = {
        algorithm: "HS256",
        expiresIn: "15m",
        issuer: "task-manager",
        audience: "task-manager",
        jwtid: crypto.randomUUID(),
    };

    return jwt.sign(payload, SECRET_KEY, options);
}

module.exports = { createAccessToken };
