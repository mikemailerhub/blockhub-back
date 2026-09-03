const express = require("express");
const router = express.Router();

const User = require("../models/user");

// Change this to wherever your auth middleware lives
const CohortRegistration = require("../models/Cohort");


router.post("/register", async (req, res) => {
    try {
        const {
            fullName,
            email,
            telegramUsername,
            country,
            track,
            about,
            source,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !country ||
            !track ||
            !about ||
            !source
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // --------------------------------
        // Find existing BlockHub user
        // --------------------------------

        let user = await User.findOne({
            email: normalizedEmail,
        });

        // --------------------------------
        // Create user if they don't exist
        // --------------------------------

        if (!user) {
            user = await User.create({
                fullName: fullName.trim(),
                email: normalizedEmail,
                source: "cohort",
            });
        }

        // --------------------------------
        // Check if already registered
        // --------------------------------

        const existingRegistration =
            await CohortRegistration.findOne({
                user: user._id,
                cohort: "cohort-1.0",
            });

        if (existingRegistration) {
            return res.status(409).json({
                success: false,
                message:
                    "This email is already registered for Cohort 1.0.",
                registration: existingRegistration,
            });
        }

        // --------------------------------
        // Create cohort registration
        // --------------------------------

        const registration =
            await CohortRegistration.create({
                user: user._id,

                cohort: "cohort-1.0",

                fullName: user.fullName,

                email: user.email,

                telegramUsername:
                    telegramUsername?.trim() || null,

                country: country.trim(),

                track,

                about,

                source,
            });

        return res.status(201).json({
            success: true,

            message:
                "Successfully registered for Cohort 1.0.",

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },

            registration,
        });

    } catch (error) {
        console.error(
            "Cohort registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong during registration.",
        });
    }
});


/**
 * GET /cohort/registrations
 *
 * Get all Cohort 1.0 registrations
 */
router.get("/registrations", async (req, res) => {
    try {
        const registrations = await CohortRegistration.find({
            cohort: "cohort-1.0",
        })
            .populate(
                "user",
                "fullName email twitterHandle twitterId profileImage"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });

    } catch (error) {
        console.error(
            "Get cohort registrations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cohort registrations.",
        });
    }
});



module.exports = router;