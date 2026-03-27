const express = require("express");
const router = express.Router();
const passport = require("../confiq/passport");
const jwt = require("jsonwebtoken");
const user = require("../models/user");


// Step 1: Redirect to Twitter
// ==========================
// Step 1: Redirect to Twitter (with source)
// ==========================
router.get("/auth/twitter", (req, res, next) => {
    // Save source in session so we can use it in callback
    req.session.twitterSource = req.query.source || "website";
    passport.authenticate("twitter")(req, res, next);
});

// ==========================
// Step 2: Twitter callback
// ==========================
router.get(
    "/twitter/callback",
    passport.authenticate("twitter"),
    async (req, res) => {
        try {
            const user = req.user;

            // Create JWT
            const token = jwt.sign({ id: user._id, admin: user.admin }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });

            // Serialize full user object for frontend
            const { admin, ...userWithoutAdmin } = user.toObject();

            const fullUser = {
                ...userWithoutAdmin,
                token,
            };

            const encodedUser = encodeURIComponent(
                Buffer.from(JSON.stringify(fullUser)).toString("base64")
            );

            const frontendUrl = process.env.USER_FRONTEND_URL || "http://localhost:5173";

            // ✅ Dynamic redirect based on `source`
            const source = req.session.twitterSource || "website";
            let redirectBase = frontendUrl;

            switch (source) {
                case "academy":
                    redirectBase = `${frontendUrl}/academy/waitlist`;
                    break;
                case "website":
                    redirectBase = `${frontendUrl}/profile`;
                    break;
                case "marketplace":
                    redirectBase = `${frontendUrl}/market`;
                    break;
                case "continueAcademy":
                    redirectBase = `${frontendUrl}/dashboard`;
                    break;
                case "newAcademy":
                    redirectBase = `${frontendUrl}/academy/courses`;
                    break;
                default:
                    redirectBase = `${frontendUrl}/profile`;
            }

            // Redirect to frontend with JWT + encoded user
            res.redirect(`${redirectBase}?token=${token}&user=${encodedUser}`);
        } catch (err) {
            console.error("Twitter callback error:", err);
            res.redirect(`${process.env.USER_FRONTEND_URL}`);
        }
    }
);


// Simple signup (NO Twitter)
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, interest, linkedinUrl } = req.body;

        // Generate dummy twitter data
        const uniqueId = Date.now();
        const dummyTwitterId = "demo_" + uniqueId;

        const userInstance = await user.create({
            fullName,
            email,
            interest: interest || [],

            twitterId: dummyTwitterId,
            twitterHandle: linkedinUrl,

            // Optional LinkedIn storage
            linkedinUrl: linkedinUrl || null,
        });

        res.status(201).json({
            success: true,
            userInstance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Signup failed",
        });
    }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ For MVP: fixed password check
    const FIXED_PASSWORD = process.env.FIXED_USER_PASSWORD || "blockhub123";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user by email
    const userInstance = await user.findOne({ email });

    if (!userInstance || password !== FIXED_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT (same as Twitter flow)
    const token = jwt.sign({ id: userInstance._id, admin: userInstance.admin }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Serialize full user object for frontend
    const { admin, ...userWithoutAdmin } = userInstance.toObject();

    const fullUser = {
      ...userWithoutAdmin,
      token,
    };

    const encodedUser = encodeURIComponent(
      Buffer.from(JSON.stringify(fullUser)).toString("base64")
    );

    // Frontend redirect (just like Twitter)
    const frontendUrl = process.env.USER_FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/profile?token=${token}&user=${encodedUser}`;

    res.json({
      success: true,
      redirectUrl,
      fullUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});


module.exports = router;