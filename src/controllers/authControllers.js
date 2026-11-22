const pool = require("../database/db.js");
const bcrypt = require("bcrypt");
const { validateName } = require("../validators/taskValidators.js");
const { createAccessToken } = require("../utils/tokenUtils.js");

const SALT_ROUNDS = 11;

const register = async (req, res, next) => {
    try {
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({ message: "Invalid request body." });
        }

        const { name, pass, email } = req.body;

        // Checking if user inputed required fields to register
        if (!name || !pass || !email) {
            return res.status(400).json({ message: "Invalid input fields." });
        }

        const nameValidator = validateName(name);
        if (!nameValidator.valid) {
            return res.status(400).json({ message: nameValidator.message });
        }
        const validName = nameValidator.value;

        if (validName.length > 30) {
            return res.status(400).json({ message: "Invalid user name." });
        }

        if (typeof email != "string") {
            return res
                .status(400)
                .json({ message: "Email must be string format." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
            return res
                .status(400)
                .json({ message: "Email format not correct." });
        }

        if (normalizedEmail.length > 254) {
            return res
                .status(400)
                .json({ message: "Email excedes character limit." });
        }

        if (typeof pass != "string") {
            return res
                .status(400)
                .json({ message: "Invalid password type, must be string." });
        }

        // Checking if user inputed password with enough length
        if (pass.length < 7) {
            return res
                .status(400)
                .json({ message: "Password must have at least 7 letters." });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail],
        );

        if (existingUser.rowCount !== 0) {
            return res.status(409).json({
                message: "Account already exists",
            });
        }

        const hashedPass = await bcrypt.hash(pass, SALT_ROUNDS);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING name, email ",
            [validName, normalizedEmail, hashedPass],
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code == "23505" && err.constraint == "users_email_key") {
            return res
                .status(409)
                .json({ message: "Email already exists in database." });
        } else {
            return next(err);
        }
    }
};

const login = async (req, res, next) => {
    try {
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({ message: "Invalid request body." });
        }

        const { email, pass } = req.body;

        //Checking if user inputed both required fields
        if (!email || !pass) {
            return res.status(400).json({ message: "No fields inputed." });
        }
        if (typeof email != "string") {
            return res.status(400).json({ message: "Email must be string." });
        }
        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
            return res
                .status(400)
                .json({ message: "Invalid email type or format." });
        }

        if (normalizedEmail.length > 254) {
            return res
                .status(400)
                .json({ message: "Email excedes length policy." });
        }

        if (typeof pass != "string") {
            return res.status(400).json({ message: "Invalid password type." });
        }

        const existingUser = await pool.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [normalizedEmail],
        );

        const user = existingUser.rows[0];

        if (existingUser.rowCount === 0) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const storedPassword = user.password_hash;

        const isMatch = await bcrypt.compare(pass, storedPassword);
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        const token = createAccessToken(user.id);

        return res.status(200).json({
            message: "Login successful",
            token: token,
        });
    } catch (err) {
        return next(err);
    }
};

const verify = async (req, res) => {};

module.exports = {
    register,
    login,
};
