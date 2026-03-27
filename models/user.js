const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String },
    twitterHandle: { type: String, unique: true, required: true },
    twitterId: { type: String, unique: true, required: true },
    email: { type: String, default: null },
    profileImage: { type: String, default: null },
    verified: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    tweetCount: { type: Number, default: 0 },

    points: { type: Number, default: 0 },
    total_points: { type: Number, default: 0 },
    level: { type: String, default: 'Beginner' },
    tasks_completed: { type: Number, default: 0 },

    template_bought: { type: Boolean, default: false },
    portfolio: { type: Boolean, default: false },
    portfolioUrl: [{ type: String, default: '' }],
    portfolioPublicId: [{ type: String, default: '' }],
    portfolioNames: [{ type: String, default: '' }],

    interest: [{ type: String, required: true }],
    is_ambassador: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    userFirstLogin: { type: Boolean, default: false },

    isTutor: { type: Boolean, default: false }, // NEW: quick flag
    tutorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'tutors' },


    source: { type: String, default: 'website' }, // track login source

    admin: { type: Boolean, default: false }, // NEW: admin flag

    createdAt: { type: Date, default: Date.now },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'jobs' }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'jobs' }],

    emailSent: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'users'
});


module.exports = mongoose.models.users || mongoose.model('users', userSchema);