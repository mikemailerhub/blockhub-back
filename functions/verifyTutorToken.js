const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');

const TUTOR_ACCESS_SECRET = process.env.TUTOR_ACCESS_SECRET_KEY || 'tutoraccesskey';

// Middleware to verify tutor token
const verifyTutorToken = async (req, res, next) => {
  try {
    // Expect token in Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    // Verify JWT
    const decoded = jwt.verify(token, TUTOR_ACCESS_SECRET);

    // Attach tutorId & userId to request
    req.tutorId = decoded.tutorId;
    req.userId = decoded.userId;

    // Optional: check if tutor still exists
    const tutor = await Tutor.findById(req.tutorId);
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    req.tutor = tutor; // attach tutor document for convenience
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyTutorToken;