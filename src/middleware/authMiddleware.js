const jwt = require("jsonwebtoken");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header required." });
    }

    const parts = authHeader.trim().split(/\s+/);

    if (
        parts.length !== 2 ||
        parts[0].toLowerCase() !== "bearer" ||
        !parts[1]
    ) {
        return res.status(401).json({ message: "Token not valid or missing." });
    }

    try {
        const decode = jwt.verify(parts[1], process.env.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: "task-manager",
            audience: "task-manager",
        });

        const stringID = decode.sub;

        if (
            !stringID ||
            typeof stringID !== "string" ||
            stringID.trim().length === 0
        ) {
            return res
                .status(401)
                .json({ message: "Authentication failed, no id provided." });
        }

        if (!/^[0-9]+$/.test(stringID)) {
            return res
                .status(401)
                .json({ message: "Authentication failed, ID not valid." });
        }

        const userID = Number(decode.sub);

        if (userID <= 0 || !Number.isSafeInteger(userID)) {
            return res
                .status(401)
                .json({ message: "Authentication failed, ID not valid." });
        }

        req.user = {
            id: userID,
        };
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Token expired.",
            });
        }
        if (err instanceof jwt.NotBeforeError) {
            return res.status(401).json({
                message: "JWT is not valid.",
            });
        }
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid token credentials.",
            });
        }

        return next(err);
    }
    next();
};

module.exports = { authenticateToken };
