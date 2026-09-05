const express = require("express");
const router = express.Router();

const User = require("../models/user");

// Change this to wherever your auth middleware lives
const CohortRegistration = require("../models/Cohort");
const Referral = require("../models/Referral");


// =====================================================
// GET COHORT STATISTICS
// GET /user_cohort/stats
//
// Supported query params:
// ?page=1
// ?limit=10
// ?search=john
// ?track=Backend Development
// =====================================================

router.get("/stats", async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
            track = "",
        } = req.query;

        page = Math.max(parseInt(page) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

        const skip = (page - 1) * limit;

        // -------------------------------------------------
        // Base filter
        // -------------------------------------------------

        const filter = {};

        // -------------------------------------------------
        // Search
        // Searches:
        // - Full name
        // - Email
        // - Telegram username
        // - Country
        // - Track
        // -------------------------------------------------

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            filter.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { telegramUsername: searchRegex },
                { country: searchRegex },
                { track: searchRegex },
            ];
        }

        // -------------------------------------------------
        // Track filter
        // -------------------------------------------------

        if (track.trim()) {
            filter.track = track.trim();
        }

        // -------------------------------------------------
        // Total registrations
        // -------------------------------------------------

        const total = await CohortRegistration.countDocuments({});

        // -------------------------------------------------
        // Today's registrations
        // -------------------------------------------------

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const today = await CohortRegistration.countDocuments({
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday,
            },
        });

        // -------------------------------------------------
        // Track/course statistics
        // -------------------------------------------------

        const trackStats = await CohortRegistration.aggregate([
            {
                $match: {
                    track: {
                        $exists: true,
                        $nin: ["", null],
                    },
                },
            },
            {
                $group: {
                    _id: "$track",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        const tracks = trackStats.map((item) => ({
            name: item._id,
            count: item.count,
            percentage:
                total > 0
                    ? Number(((item.count / total) * 100).toFixed(1))
                    : 0,
        }));

        // -------------------------------------------------
        // Registered users
        // -------------------------------------------------

        const registrations = await CohortRegistration.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // -------------------------------------------------
        // Total search results
        // -------------------------------------------------

        const filteredTotal =
            await CohortRegistration.countDocuments(filter);

        const totalPages = Math.ceil(filteredTotal / limit);

        // -------------------------------------------------
        // Most popular course
        // -------------------------------------------------

        const mostPopularTrack =
            tracks.length > 0
                ? tracks[0]
                : null;

        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        return res.status(200).json({
            success: true,

            data: {
                overview: {
                    total,
                    today,
                    totalTracks: tracks.length,
                    mostPopularTrack,
                },

                tracks,

                registrations,

                pagination: {
                    page,
                    limit,
                    total: filteredTotal,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("❌ Cohort stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cohort statistics",
            error: error.message,
        });
    }
});


// =====================================================
// GET ALL COHORT TRACKS
// GET /user_cohort/tracks
//
// Useful for the frontend filter dropdown.
// =====================================================

router.get("/tracks", async (req, res) => {
    try {
        const tracks = await CohortRegistration.distinct("track");

        const cleanTracks = tracks
            .filter(Boolean)
            .filter((track) => track.trim() !== "")
            .sort();

        return res.status(200).json({
            success: true,
            data: cleanTracks,
        });
    } catch (error) {
        console.error("❌ Cohort tracks error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cohort tracks",
            error: error.message,
        });
    }
});
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
            referralCode,
        } = req.body;

        // --------------------------------
        // Validate required fields
        // --------------------------------

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

        // =====================================================
        // REFERRAL SYSTEM
        // =====================================================

        if (referralCode) {
            try {
                // Normalize referral code
                const normalizedReferralCode =
                    referralCode.trim().toUpperCase();

                // --------------------------------
                // Find the person who owns the code
                // --------------------------------

                const referrer = await User.findOne({
                    referralCode: normalizedReferralCode,
                });

                // --------------------------------
                // Only continue if referral code is valid
                // --------------------------------

                if (referrer) {
                    // --------------------------------
                    // Prevent self-referral
                    // --------------------------------

                    if (
                        referrer._id.toString() !==
                        user._id.toString()
                    ) {
                        // --------------------------------
                        // Check if this user already has
                        // a referral
                        // --------------------------------

                        const existingReferral =
                            await Referral.findOne({
                                referredUser: user._id,
                            });

                        // --------------------------------
                        // Create referral if one doesn't exist
                        // --------------------------------

                        if (!existingReferral) {
                            await Referral.create({
                                referrer: referrer._id,

                                referredUser: user._id,

                                referralCode:
                                    normalizedReferralCode,

                                cohortRegistration:
                                    registration._id,

                                cohort: "cohort-1.0",

                                status: "registered",

                                paymentReference: null,

                                paymentAmount: 0,

                                paidAt: null,

                                rewardAmount: 0,

                                rewardStatus: "pending",

                                rewardPaidAt: null,
                            });

                            console.log(
                                `✅ Referral created: ${referrer.fullName} referred ${user.fullName}`
                            );
                        } else {
                            console.log(
                                "ℹ️ User already has a referral."
                            );
                        }
                    } else {
                        console.log(
                            "⚠️ Self-referral attempt blocked."
                        );
                    }
                } else {
                    console.log(
                        `⚠️ Invalid referral code: ${normalizedReferralCode}`
                    );
                }
            } catch (referralError) {
                // --------------------------------
                // Referral failure should NOT cancel
                // the user's cohort registration
                // --------------------------------

                console.error(
                    "❌ Referral creation error:",
                    referralError
                );
            }
        }

        // --------------------------------
        // Registration successful
        // --------------------------------

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

        // --------------------------------
        // Handle duplicate registration
        // --------------------------------

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This email is already registered for Cohort 1.0.",
            });
        }

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