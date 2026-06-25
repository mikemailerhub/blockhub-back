// SPDX-License-Identifier: MIT
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const payment = require('../models/payment');
const { TwitterApi } = require('twitter-api-v2');
const twitterOAuth = require('../models/twitterOAuth');
const User = require('../models/user');
const auth = require('../middlewave/auth');
const sanitizeUser = require('../utils/sanitizeUser');
const router = express.Router();


router.post("/connect-wallet", auth, async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                walletAddress
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            user: sanitizeUser(user)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.post("/disconnect-wallet", auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    walletAddress: 1
                }
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            message: "Wallet disconnected",
            user: sanitizeUser(user)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
