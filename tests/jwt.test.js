require("dotenv").config();

const jwt = require("jsonwebtoken");
const { createAccessToken } = require("../src/utils/tokenUtils.js");

const token = createAccessToken(5);

console.log("Token generated", Boolean(token));

const realSecret = jwt.verify(token, process.env.JWT_SECRET);

console.log("Test with real secret", Boolean(realSecret));

try {
    const fakeSecret = jwt.verify(token, "fake_secret");

    console.log("Test with fake secret", Boolean(fakeSecret));
} catch (err) {
    console.log(err.message);
}

console.log("JWT token works as intended");
