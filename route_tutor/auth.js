const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Tutor = require("../models/Tutor");
const User = require("../models/user");
const Course = require("../models/Course");

const TUTOR_ACCESS_SECRET = process.env.TUTOR_ACCESS_SECRET_KEY || "tutoraccesskey";

// Generate tutor code
function generateTutorCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TUT${random}`;
}

router.post("/signup-tutor", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isTutor) {
      return res.status(400).json({ message: "User already a tutor" });
    }

    const tutorCode = generateTutorCode();

    const tutorProfile = await Tutor.create({
      user: user._id,
      tutorCode,
      bio: ""
    });

    user.isTutor = true;
    user.tutorProfile = tutorProfile._id;

    await user.save();

    res.status(200).json({
      message: "Tutor created successfully",
      tutorCode,
      tutorProfile
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login-tutor", async (req, res) => {
  try {
    const { tutorCode } = req.body;

    if (!tutorCode) {
      return res.status(400).json({ message: "Tutor code required" });
    }

    const tutor = await Tutor.findOne({ tutorCode }).populate("user");

    if (!tutor) {
      return res.status(404).json({ message: "Invalid tutor code" });
    }

    // Get all courses created by this tutor
    const allTutorCourses = await Course.find({ tutor: tutor._id });

    const token = jwt.sign(
      {
        tutorId: tutor._id,
        userId: tutor.user._id,
        admin: tutor.user.admin
      },
      TUTOR_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    // Convert Mongoose doc to plain object
    const tutorObj = tutor.toObject();

    // Remove admin field from user sub-document
    if (tutorObj.user && tutorObj.user.admin !== undefined) {
      delete tutorObj.user.admin;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      tutor: tutorObj, // all fields except admin
      allCourses: allTutorCourses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;