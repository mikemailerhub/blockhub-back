const express = require('express');
const Payment = require('../models/payment');
const user = require('../models/user');
const { sendSuccessMessage } = require('../utils/nodemailer');

const axios = require("axios");
const crypto = require("crypto");


const Course = require("../models/Course");
const Purchase = require("../models/Purchase");
const Enrollment = require("../models/Enrollment");
const auth = require('../middlewave/auth');


// Create new payment
const router = express.Router();

async function fetchFXRates() {
    try {
        const res = await axios.get(
            "https://open.er-api.com/v6/latest/USD",
            { timeout: 5000 }
        );

        const ngnRate = res.data?.rates?.NGN;

        if (!ngnRate) throw new Error("NGN rate missing from FX API");




        return ngnRate;
    } catch (err) {
        console.log("⚠️ FX fetch failed:", err.message);

        // fallback (VERY IMPORTANT for production stability)
        const fallback = 1500;

        priceCache.set("usd_ngn", {
            price: fallback,
            timestamp: Date.now()
        });

        await saveToMongo("usd_ngn", fallback);

        console.log(`🟡 USING FALLBACK USD → NGN = ${fallback}`);

        return fallback;
    }
}




router.get("/use_token/:token", async (req, res) => {
    const { token } = req.params;

    const payment = await Payment.findOne({ token });

    if (!payment) return res.status(404).send("Invalid link");
    if (payment.tokenUsed) return res.status(400).send("Link already used");
    if (payment.expiresAt < new Date()) return res.status(400).send("Link expired");


    payment.tokenUsed = true;
    await payment.save();

    // redirect user to the actual booking link stored in DB
    if (payment.bookingLink) {
        return res.redirect(payment.bookingLink);
    } else {
        return res.status(400).send("No booking link found for this payment.");
    }
});

router.post('/create_payment', async (req, res) => {
    try {
        let { name, email, is_call_payment, username, product_id, product_title, product_price } = req.body;

        if (!name || !email || is_call_payment === undefined || !username || !product_id || !product_title || !product_price) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // ✅ Lowercase and trim the username
        username = username.toLowerCase().trim();

        // ✅ Check if the Twitter handle already exists in Users
        // const existingUser = await user.findOne({ twitterHandle: username });
        // if (existingUser) {
        //     return res.status(400).json({ message: 'This Twitter handle is already registered.' });
        // }

        // Booking link logic for call payments
        let bookingLink = "";
        if (is_call_payment && product_title.includes("30")) {
            bookingLink = "https://calendly.com/block-hub-mailer/30min";
        } else if (is_call_payment && product_title.includes("45")) {
            bookingLink = "https://calendly.com/block-hub-mailer/new-meeting";
        }

        const payment = new Payment({
            name,
            email,
            username,
            product_id,
            is_call_payment,
            product_title,
            product_price,
            bookingLink,
            status: false
        });

        await payment.save();

        res.status(201).json({
            message: 'Payment record created successfully',
            data: payment
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/mark_as_paid', async (req, res) => {
    try {
        const { name, paymentId } = req.body;

        // 1️⃣ Find and mark payment as paid
        const payment = await Payment.findOneAndUpdate(
            { _id: paymentId },
            { status: true },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        // 2️⃣ Find user by twitterHandle (username in payment)
        let Iuser = await user.findOne({ twitterHandle: payment.username });

        if (Iuser) {
            // ✅ Mark template as bought
            Iuser.template_bought = true;

            // Optional: update handle if not already correct
            if (payment.username && Iuser.twitterHandle !== payment.username) {
                Iuser.twitterHandle = payment.username;
            }

            await Iuser.save();
        } else {
            console.warn(`⚠️ No user found with handle ${payment.username}`);
        }

        // 3️⃣ Decide link to send
        let linkToSend;
        if (payment.is_call_payment) {
            const token = crypto.randomBytes(24).toString("hex");
            payment.token = token;
            payment.tokenUsed = false;
            payment.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await payment.save();

            linkToSend = `https://blockhub-server.onrender.com/user_payment/use_token/${token}`;
        } else if (payment.product_id === "kit_9f3a7c1b82d4") {
            linkToSend = "https://chat.whatsapp.com/HMKMLZpcDoU7K5kfl9ABy7";
        } else {
            linkToSend = "https://chat.whatsapp.com/DZGDVVInnjc1M1nQsfgh7y";
        }

        // 4️⃣ Send success email
        await sendSuccessMessage(payment.email, name, linkToSend);

        return res.status(200).json({
            message: 'Payment marked as paid, user updated, email sent',
            payment,
            user: Iuser
        });

    } catch (err) {
        console.error("❌ Error in mark_as_paid:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post("/course_payment_initialize", auth, async (req, res) => {
    try {

        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        // Find course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const originalAmount = course.pricing.amount;
        const currency = course.pricing.currency;

        let convertedAmount = originalAmount;
        let exchangeRate = null;

        // Only convert if course is priced in USDT/USD
        if (currency === "USDT" || currency === "USD") {
            exchangeRate = await fetchFXRates();
            convertedAmount = originalAmount * exchangeRate;
        }

        // Platform fee (10%)
        const platformFee = convertedAmount * 0.10;

        // Amount customer pays
        const finalAmount = Math.round(convertedAmount + platformFee);

        // Already enrolled?
        const already = await Enrollment.findOne({
            user: req.user._id,
            course: course._id
        });

        // if (already) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Already enrolled"
        //     });
        // }

        // Free Course
        if (course.pricing.type === "free") {

            const enrollment = await Enrollment.create({
                user: req.user._id,
                course: course._id,
                totalLessons: course.lessons.length,
                progress: 0,
                completed: false,
                completedLessons: []
            });

            return res.json({
                success: true,
                free: true,
                enrollment
            });

        }

        const amount = course.pricing.amount;

        const reference =
            `BH_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

        // Save purchase
        const purchase = await Purchase.create({

            user: req.user._id,

            course: course._id,

            tutor: course.tutor,

            amount: finalAmount,

            currency: "NGN",

            paymentMethod: "paystack",

            paymentReference: reference,

            paymentStatus: "pending"

        });

        // Initialize Paystack

        const response = await axios.post(

            "https://api.paystack.co/transaction/initialize",

            {

                email: req.user.email,

                amount: finalAmount * 100,

                currency: "NGN",

                reference,

                callback_url:
                    `${process.env.FRONTEND_URL}/payment/success`

            },

            {

                headers: {

                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

                    "Content-Type": "application/json"

                }

            }

        );

        return res.json({
            success: true,

            pricing: {
                originalAmount,
                originalCurrency: currency,

                exchangeRate, // null if no conversion happened

                convertedAmount,
                platformFee,
                total: finalAmount,

                payableCurrency: "NGN"
            },

            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference
        });
    }

    catch (err) {

        console.log(err.response?.data || err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.get("/course_payment_verify", auth, async (req, res) => {
    try {

        const { reference } = req.query;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Payment reference is required"
            });
        }

        // Find purchase
        const purchase = await Purchase.findOne({
            paymentReference: reference,
            user: req.user._id
        });

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        // Prevent duplicate verification
        if (purchase.paymentStatus === "paid") {

            const enrollment = await Enrollment.findOne({
                user: req.user._id,
                course: purchase.course
            });

            return res.json({
                success: true,
                alreadyVerified: true,
                enrollment
            });

        }

        // Verify with Paystack

        const verify = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const payment = verify.data.data;

        if (payment.status !== "success") {

            purchase.paymentStatus = "failed";
            await purchase.save();

            return res.status(400).json({
                success: false,
                message: "Payment not successful"
            });

        }

        purchase.paymentStatus = "paid";
        purchase.transactionHash = payment.reference;

        await purchase.save();

        // Get course

        const course = await Course.findById(purchase.course);

        // Create enrollment if missing

        let enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: purchase.course
        });

        if (!enrollment) {

            enrollment = await Enrollment.create({

                user: req.user._id,

                course: purchase.course,

                totalLessons: course.lessons.length,

                progress: 0,

                completed: false,

                completedLessons: []

            });

            await Course.findByIdAndUpdate(
                course._id,
                {
                    $inc: {
                        totalEnrollments: 1
                    }
                }
            );

        }

        return res.json({

            success: true,

            message: "Payment verified",

            purchase,

            enrollment

        });

    } catch (err) {

        console.log(err.response?.data || err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }
});


// module.exports = /;


module.exports = router;