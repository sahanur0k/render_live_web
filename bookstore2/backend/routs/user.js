const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Register
router.post("/register", async (req, res) => {
    try {
        const { username = "", email = "", password = "", address = "", phone = "" } = req.body;

        if (username.length < 4) {
            return res.status(400).json({ message: "Username should be at least 4 characters long" });
        }
        if (await User.findOne({ username })) {
            return res.status(400).json({ message: "Username already exists" });
        }
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: "Email already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters long" });
        }
        if (address.length < 6) {
            return res.status(400).json({ message: "Address should be at least 6 characters long" });
        }
        if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
            return res.status(400).json({ message: "Please enter a valid phone number" });
        }
        if (await User.findOne({ phone })) {
            return res.status(409).json({ message: "Phone number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = ["ayonkumar2014@gmail.com", "advnex.team@gmail.com"].includes(email.toLowerCase()) ? "admin" : "user";

        const newUser = new User({ username, email, password: hashedPassword, address, phone, role });
        await newUser.save();

        res.status(201).json({ message: "User created successfully", role });
    } catch (error) {
        console.log("Error in sign-up", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// Sign-in
router.post("/sign-in", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });

        if (!existingUser) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: existingUser._id, username: existingUser.username, role: existingUser.role },
            "bookstore123",
            { expiresIn: "30d" }
        );

        // Set token in httpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.status(200).json({
            message: "Login successful",
            id: existingUser._id,
            role: existingUser.role,
            token: token
        });
    } catch (error) {
        console.log("Error in sign-in", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user info (protected route)
router.get("/get-user-info", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in get-user-info", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user details by ID (protected route)
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "User not found"
            });
        }
        return res.status(200).json({
            status: "Success",
            data: user
        });
    } catch (error) {
        console.log("Error in get-user-by-id", error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error"
        });
    }
});

module.exports = router;
