// SPDX-License-Identifier: MIT
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const payment = require('../models/payment');
const { TwitterApi } = require('twitter-api-v2');
const twitterOAuth = require('../models/twitterOAuth');
const user = require('../models/user');
const router = express.Router();

// Initialize Twitter client (OAuth2 PKCE)
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const redirectUri = process.env.USER_TWITTER_CALLBACK_URL;

// ✅ Paystack verification helper
async function hasUserPaidPaystack(email) {
  try {
    const transRes = await axios.get(
      `https://api.paystack.co/transaction?status=success`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return transRes.data.data.some(
      (tx) => tx.customer.email.toLowerCase() === email.toLowerCase()
    );
  } catch (err) {
    console.error(
      'Error checking Paystack payments:',
      err.response?.data || err.message
    );
    return false;
  }
}

// ==========================
// Step 1: Redirect to Twitter login
// ==========================
router.get('/auth/twitter', async (req, res) => {
  try {
    const { source } = req.query;
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      redirectUri,
      {
        scope: [
          'tweet.read',
          'users.read',
          'offline.access',
          'follows.read',
        ],
      }
    );

    await twitterOAuth.create({ state, codeVerifier, role: 'user', source });

    console.log('Redirecting User to Twitter login URL:', url);
    res.redirect(url);
  } catch (err) {
    console.error('Error generating Twitter login URL:', err);
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
});

// ==========================
// Step 2: Handle Twitter callback
// ==========================
router.get('/auth/twitter/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // 1️⃣ Find OAuth record
    const record = await twitterOAuth.findOne({ state, role: 'user' });
    if (!record) return res.redirect(`${process.env.FRONTEND_URL}`);

    const userSource = record.source || 'website';
    console.log(userSource);


    // 2️⃣ Exchange code for access token
    const { client: loggedClient } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier: record.codeVerifier,
      redirectUri,
    });

    await twitterOAuth.deleteOne({ state });

    // 3️⃣ Get Twitter user info
    const twitterUser = await loggedClient.v2.me({
      'user.fields': [
        'id',
        'name',
        'username',
        'profile_image_url',
        'verified',
        'public_metrics',
      ],
    });

    const { id, name, username, profile_image_url, verified, public_metrics } = twitterUser.data;

    const twitterData = {
      fullName: name,
      twitterHandle: '@' + username.toLowerCase(),
      twitterId: id,
      profileImage: profile_image_url,
      verified: verified || false,
      followersCount: public_metrics?.followers_count || 0,
      followingCount: public_metrics?.following_count || 0,
      tweetCount: public_metrics?.tweet_count || 0,
    };

    // 4️⃣ Update or create user in DB
    let userDoc = await user.findOneAndUpdate(
      { twitterId: id },
      {
        ...twitterData,
        userFirstLogin: true,
        source: userSource,
      },
      { new: true, upsert: true }
    );

    // 5️⃣ Create JWT
    const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // 6️⃣ Serialize full user object for redirect
    const fullUser = {
      ...userDoc.toObject(), // convert mongoose doc to plain object
      token,                // include JWT
    };

    // Base64 encode it to safely pass in URL
    const encodedUser = encodeURIComponent(Buffer.from(JSON.stringify(fullUser)).toString('base64'));

    // 7️⃣ Redirect based on source

    const frontendUrl = process.env.USER_FRONTEND_URL || 'http://localhost:5173';
    let redirectBase = '';

    switch (userSource) {
      case 'academy':
        redirectBase = `${frontendUrl}/academy/waitlist`;
        break;
      case 'website':
        redirectBase = `${frontendUrl}/profile`;
        break;
      case 'marketplace':
        redirectBase = `${frontendUrl}/market`;
        break;
      case 'continueAcademy':
        redirectBase = `${frontendUrl}/dashboard`;
        break;
      case 'newAcademy':
        redirectBase = `${frontendUrl}/academy/courses`;
        break;
      default:
        redirectBase = frontendUrl;
    }


    res.redirect(`${redirectBase}?token=${token}&user=${encodedUser}`);

  } catch (err) {
    console.error('User Twitter callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
});


// ==========================
// Endpoint: Get all paid users from Paystack
// ==========================
router.get('/paystack/paid-users', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.paystack.co/transaction',
      {
        params: {
          status: 'success',
          perPage: 100,
          page: 1,
        },
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const transactions = response.data.data || [];
    const paidUsers = transactions.map((tx) => ({
      email: tx.customer.email,
      name: `${tx.customer.first_name || ''} ${tx.customer.last_name || ''
        }`.trim(),
    }));

    res.json({ count: paidUsers.length, users: paidUsers });
  } catch (err) {
    console.error(
      'Error fetching Paystack payments:',
      err.response?.data || err.message
    );
    res.status(500).json({ error: 'Unable to fetch paid users from Paystack' });
  }
});

module.exports = router;
