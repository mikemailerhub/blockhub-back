const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    twitterId: String,
    projectName: { type: String, required: true },
    twitterHandle: String,
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // if you want a project owner
    profileImage: { type: String },
    hashtags : [String],
    cloud_img_id: String,
    compensation: { type: String },
    project: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'projects' });

module.exports = mongoose.model('projects', projectSchema);