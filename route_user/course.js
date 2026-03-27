const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const Course = require('../models/Course');
require('dotenv').config();

router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find({
            isPublished: true,
            isDraft: false
        })
            .populate({
                path: 'tutor',
                populate: {
                    path: 'user',
                    select: 'name twitterHandle profileImage' // adjust based on your user model
                }
            });

            

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;