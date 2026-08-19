const express = require("express");
const router = express.Router();

const passport = require("../confiq/passport");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const setAuthCookie = require("../utils/setAuthCookie");


// ============================================================
// STEP 1 — START TWITTER AUTHENTICATION
// ============================================================

router.get("/auth/twitter", (req, res, next) => {

    const source = req.query.source || "website";
    const telegramToken = req.query.telegramToken || null;

    // --------------------------------------------------------
    // Store OAuth context in the current Express session
    // --------------------------------------------------------

    req.session.twitterSource = source;

    if (source === "telegram" && telegramToken) {
        req.session.telegramToken = telegramToken;
    } else {
        delete req.session.telegramToken;
    }


    // --------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------

    console.log("\n=================================");
    console.log("TWITTER AUTH — START");
    console.log("=================================");

    console.log("Session ID:", req.sessionID);

    console.log("Twitter Source:", req.session.twitterSource);

    console.log(
        "Telegram Token:",
        req.session.telegramToken
    );

    console.log(
        "Cookie:",
        req.headers.cookie
    );

    console.log(
        "Session:",
        {
            twitterSource: req.session.twitterSource,
            telegramToken: req.session.telegramToken,
        }
    );

    console.log("=================================\n");


    // --------------------------------------------------------
    // IMPORTANT:
    // Save the session BEFORE sending the user to Twitter
    // --------------------------------------------------------

    req.session.save((err) => {

        if (err) {

            console.error(
                "❌ TWITTER AUTH SESSION SAVE ERROR:",
                err
            );

            return next(err);
        }


        console.log("\n=================================");
        console.log("TWITTER SESSION SAVED");
        console.log("=================================");

        console.log(
            "Session ID:",
            req.sessionID
        );

        console.log(
            "Source:",
            req.session.twitterSource
        );

        console.log(
            "Telegram Token:",
            req.session.telegramToken
        );

        console.log("=================================\n");


        // ----------------------------------------------------
        // Now start Passport Twitter authentication
        // ----------------------------------------------------

        passport.authenticate("twitter")(req, res, next);

    });

});


// ============================================================
// STEP 2 — TWITTER CALLBACK
// ============================================================

router.get(
    "/twitter/callback",

    // --------------------------------------------------------
    // Middleware BEFORE Passport
    // --------------------------------------------------------

    (req, res, next) => {

        console.log("\n=================================");
        console.log("TWITTER CALLBACK — BEFORE PASSPORT");
        console.log("=================================");

        console.log(
            "Session ID:",
            req.sessionID
        );

        console.log(
            "Cookie:",
            req.headers.cookie
        );

        console.log(
            "Session:",
            req.session
        );

        console.log(
            "Twitter Source:",
            req.session?.twitterSource
        );

        console.log(
            "Telegram Token:",
            req.session?.telegramToken
        );

        console.log("=================================\n");


        // ----------------------------------------------------
        // IMPORTANT
        //
        // Your old code had:
        //
        // req.session.authSource
        //
        // BUT you saved:
        //
        // req.session.twitterSource
        //
        // So we use twitterSource here.
        // ----------------------------------------------------

        req.oauthContext = {

            source:
                req.session?.twitterSource || "website",

            telegramToken:
                req.session?.telegramToken || null,

        };


        console.log(
            "OAuth context BEFORE Passport:",
            req.oauthContext
        );


        next();

    },


    // --------------------------------------------------------
    // Passport Twitter authentication
    // --------------------------------------------------------

    passport.authenticate("twitter", {

        failureRedirect: "/auth/failure",

    }),


    // --------------------------------------------------------
    // SUCCESS CALLBACK
    // --------------------------------------------------------

    async (req, res) => {

        try {

            console.log("\n=================================");
            console.log("TWITTER CALLBACK — AFTER PASSPORT");
            console.log("=================================");


            // ------------------------------------------------
            // Check authenticated user
            // ------------------------------------------------

            const loggedInUser = req.user;


            if (!loggedInUser) {

                console.error(
                    "❌ Twitter authenticated but req.user is missing"
                );

                return res.redirect(
                    `${process.env.USER_FRONTEND_URL || "http://localhost:5173"}/login`
                );

            }


            console.log(
                "Authenticated BlockHub User:",
                {
                    id: loggedInUser._id,
                    twitterId: loggedInUser.twitterId,
                    twitterHandle: loggedInUser.twitterHandle,
                    email: loggedInUser.email,
                }
            );


            // ------------------------------------------------
            // IMPORTANT
            //
            // Use req.oauthContext because it was captured
            // BEFORE Passport potentially modifies the session.
            // ------------------------------------------------

            const source =
                req.oauthContext?.source ||
                req.session?.twitterSource ||
                "website";


            const telegramToken =
                req.oauthContext?.telegramToken ||
                req.session?.telegramToken ||
                null;


            console.log("\n=================================");
            console.log("OAUTH CONTEXT AFTER PASSPORT");
            console.log("=================================");

            console.log(
                "Source:",
                source
            );

            console.log(
                "Telegram Token:",
                telegramToken
            );

            console.log(
                "Session ID:",
                req.sessionID
            );

            console.log("=================================\n");


            // ------------------------------------------------
            // CREATE JWT
            // ------------------------------------------------

            const token = jwt.sign(

                {
                    id: loggedInUser._id,
                    admin: loggedInUser.admin,
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "30d",
                }

            );


            // ------------------------------------------------
            // FRONTEND URL
            // ------------------------------------------------

            const frontendUrl =
                process.env.USER_FRONTEND_URL ||
                "http://localhost:5173";


            // ------------------------------------------------
            // DETERMINE REDIRECT
            // ------------------------------------------------

            let redirectBase;


            switch (source) {

                case "academy":

                    redirectBase =
                        `${frontendUrl}/academy/waitlist`;

                    break;


                case "website":

                    redirectBase =
                        `${frontendUrl}/profile`;

                    break;


                case "marketplace":

                    redirectBase =
                        `${frontendUrl}/market`;

                    break;


                case "continueAcademy":

                    redirectBase =
                        `${frontendUrl}/dashboard`;

                    break;


                case "newAcademy":

                    redirectBase =
                        `${frontendUrl}/academy/courses`;

                    break;


                case "telegram":

                    if (!telegramToken) {

                        console.error(
                            "❌ Telegram source but Telegram token is missing."
                        );

                        redirectBase =
                            `${frontendUrl}/profile`;

                    } else {

                        redirectBase =
                            `${frontendUrl}/connect-telegram?token=${encodeURIComponent(
                                telegramToken
                            )}`;

                    }

                    break;


                default:

                    redirectBase =
                        `${frontendUrl}/profile`;

                    break;

            }


            // ------------------------------------------------
            // SET BLOCKHUB JWT COOKIE
            // ------------------------------------------------

            setAuthCookie(res, token);


            // ------------------------------------------------
            // CLEAN ONLY OUR TEMPORARY OAUTH DATA
            // ------------------------------------------------

            delete req.session.twitterSource;

            delete req.session.telegramToken;


            // ------------------------------------------------
            // SAVE CLEANED SESSION
            // ------------------------------------------------

            req.session.save((err) => {

                if (err) {

                    console.error(
                        "❌ Session cleanup error:",
                        err
                    );

                    // Even if cleanup fails, we already have
                    // the redirect URL and JWT cookie.
                }


                console.log("\n=================================");
                console.log("TWITTER AUTH COMPLETE");
                console.log("=================================");

                console.log(
                    "User:",
                    loggedInUser.twitterHandle
                );

                console.log(
                    "Source:",
                    source
                );

                console.log(
                    "Telegram Token:",
                    telegramToken
                );

                console.log(
                    "Session ID:",
                    req.sessionID
                );

                console.log(
                    "Redirecting to:",
                    redirectBase
                );

                console.log("=================================\n");


                return res.redirect(
                    redirectBase
                );

            });

        } catch (err) {

            console.error(
                "❌ Twitter callback error:",
                err
            );


            return res.redirect(
                `${process.env.USER_FRONTEND_URL || "http://localhost:5173"}/login`
            );

        }

    }

);


// ============================================================
// SIGNUP
// ============================================================

router.post("/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            interest,
            linkedinUrl
        } = req.body;


        const uniqueId = Date.now();

        const dummyTwitterId =
            "demo_" + uniqueId;


        const userInstance =
            await user.create({

                fullName,

                email,

                interest:
                    interest || [],

                twitterId:
                    dummyTwitterId,

                twitterHandle:
                    linkedinUrl,

                linkedinUrl:
                    linkedinUrl || null,

            });


        res.status(201).json({

            success: true,

            userInstance,

        });

    } catch (err) {

        console.error(
            "Signup error:",
            err
        );


        res.status(500).json({

            success: false,

            message:
                "Signup failed",

        });

    }

});


// ============================================================
// LOGIN
// ============================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const FIXED_PASSWORD =
            process.env.FIXED_USER_PASSWORD ||
            "blockhub123";


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required",

            });

        }


        const userInstance =
            await user.findOne({
                email
            });


        if (
            !userInstance ||
            password !== FIXED_PASSWORD
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password",

            });

        }


        const token =
            jwt.sign(

                {
                    id: userInstance._id,
                    admin: userInstance.admin,
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d",
                }

            );


        const {
            admin,
            ...userWithoutAdmin
        } = userInstance.toObject();


        const fullUser = {

            ...userWithoutAdmin,

            token,

        };


        const encodedUser =
            encodeURIComponent(

                Buffer
                    .from(
                        JSON.stringify(fullUser)
                    )
                    .toString("base64")

            );


        const frontendUrl =
            process.env.USER_FRONTEND_URL ||
            "http://localhost:5173";


        const redirectUrl =
            `${frontendUrl}/profile?token=${token}&user=${encodedUser}`;


        setAuthCookie(
            res,
            token
        );


        return res.json({

            success: true,

            user: userInstance,

            redirectUrl,

        });


    } catch (err) {

        console.error(
            "Login error:",
            err
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed",

        });

    }

});


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;