const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/user');
require('dotenv').config();


const verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};



// Endpoint to get all courses
router.get('/courses', async (req, res) => {
    try {

        const excludedTutorId = "69a9403baad07a476521df9d";

        const courses = await Course.find({
            isPublished: true,
            isDraft: false,
            tutor: { $ne: excludedTutorId } // 👈 EXCLUDE THIS TUTOR
        })
            .populate({
                path: 'tutor',
                populate: {
                    path: 'user',
                    select: 'fullName twitterHandle profileImage bio' // adjust based on your user model
                }
            });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔥 GET USER COURSES
router.get("/user_courses", verifyUser, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id })
            .populate({
                path: "course",
                populate: {
                    path: "tutor",
                    populate: {
                        path: "user",
                        select: "fullName twitterHandle profileImage bio",
                    },
                },
            });

        // split into active + completed
        const active = enrollments.filter(e => !e.completed);
        const completed = enrollments.filter(e => e.completed);

        res.json({
            active,
            completed,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/complete-lesson", verifyUser, async (req, res) => {
    const { courseId, lessonIndex } = req.body;

    try {
        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Not enrolled" });
        }

        // prevent duplicates
        if (!enrollment.completedLessons.includes(lessonIndex)) {
            enrollment.completedLessons.push(lessonIndex);
        }

        // safety check
        const total = enrollment.totalLessons || 1;

        // calculate progress ONCE
        const progress =
            (enrollment.completedLessons.length / total) * 100;

        enrollment.progress = Math.min(progress, 100);

        // mark completion
        if (enrollment.completedLessons.length >= total) {
            enrollment.completed = true;
            enrollment.completedAt = new Date();
        }

        enrollment.lastAccessedAt = new Date();

        await enrollment.save();

        return res.json(enrollment);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post("/enroll", verifyUser, async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const existing = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (existing) {
            return res.status(400).json({ message: "Already enrolled" });
        }

        const enrollment = await Enrollment.create({
            user: req.user.id,
            course: courseId,
            totalLessons: course.lessons?.length || 0,
            completedLessons: [],
            progress: 0,
            completed: false,
            lastAccessedAt: new Date(),
        });

        await Course.findByIdAndUpdate(courseId, {
            $inc: { totalEnrollments: 1 }
        });

        return res.status(201).json({
            message: "Enrolled successfully",
            enrollment,
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


// PATCH: complete quiz


router.post("/complete-quiz", verifyUser, async (req, res) => {
    try {
        const { courseId, lessonIndex, score } = req.body;

        if (!courseId || lessonIndex === undefined || score === undefined) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        // prevent double reward
        // if (enrollment.quizCompletedLessons.includes(lessonIndex)) {
        //     return res.status(400).json({ message: "Quiz already completed" });
        // }

        const POINTS_PER_QUESTION = 10;
        const earnedPoints = score * POINTS_PER_QUESTION;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🪙 update points
        user.points = (user.points || 0) + earnedPoints;
        user.total_points = (user.total_points || 0) + earnedPoints;
        user.academy_points = (user.academy_points || 0) + earnedPoints;

        // 📘 mark quiz completed
        enrollment.quizCompletedLessons.push(lessonIndex);

        if (!enrollment.completedLessons.includes(lessonIndex)) {
            enrollment.completedLessons.push(lessonIndex);
        }

        // 📊 update progress
        enrollment.progress = Math.round(
            (enrollment.completedLessons.length / enrollment.totalLessons) * 100
        );

        if (enrollment.progress >= 100) {
            enrollment.completed = true;
            enrollment.completedAt = new Date();
        }

        enrollment.lastAccessedAt = new Date();

        await enrollment.save();
        await user.save();

        return res.json({
            success: true,
            earnedPoints,
            newUserPoints: user.points,
            progress: enrollment.progress
        });

    } catch (err) {
        console.error("complete-quiz error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


router.post("/complete_lesson", verifyUser, async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.body;

        if (!courseId || lessonIndex === undefined) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Not enrolled in course" });
        }

        // prevent duplicate lesson completion
        if (!enrollment.completedLessons.includes(lessonIndex)) {
            enrollment.completedLessons.push(lessonIndex);
        }

        const totalLessons = enrollment.totalLessons || 1;

        // 📊 calculate progress
        const progress = Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100
        );

        enrollment.progress = Math.min(progress, 100);

        // 🎯 mark course complete
        if (enrollment.completedLessons.length >= totalLessons) {
            enrollment.completed = true;
            enrollment.completedAt = new Date();
        }

        enrollment.lastAccessedAt = new Date();

        await enrollment.save();

        return res.json({
            success: true,
            message: "Lesson completed",
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
        });

    } catch (err) {
        console.error("complete_lesson error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


router.post("/complete_course", verifyUser, async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user.id,
            course: courseId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Not enrolled in course" });
        }

        // ✅ mark everything complete
        enrollment.completed = true;
        enrollment.progress = 100;
        enrollment.completedAt = new Date();

        // optional safety: ensure all lessons are marked done
        if (enrollment.totalLessons > 0) {
            enrollment.completedLessons = Array.from(
                { length: enrollment.totalLessons },
                (_, i) => i
            );
        }

        await enrollment.save();

        // 🔥 return normalized format for frontend cache update
        const response = {
            courseId: enrollment.course.toString(),
            progress: enrollment.progress,
            completed: enrollment.completed,
            completedLessons: enrollment.completedLessons,
            totalLessons: enrollment.totalLessons,
            lastLessonIndex: enrollment.totalLessons - 1,
        };

        return res.json({
            success: true,
            message: "Course completed successfully",
            enrollment,
            userCourse: response,
        });

    } catch (err) {
        console.error("complete-course error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;