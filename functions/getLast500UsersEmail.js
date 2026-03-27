// getLast500Users.js
const mongoose = require('mongoose');
const User = require('../modal/user'); // adjust path to your user model
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const dnsPromises = require("node:dns/promises");
const dns = require("dns");

// Force DNS to avoid Atlas SRV issues
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

// Connect to MongoDB
const MONGO_URI = 'mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

/**
 * Get last 500 users who haven't been sent the email
 * @returns {Promise<Array>} Array of user emails
 */
async function getLast500UsersEmail() {
    try {
        // Find last 500 users where emailSent is false or missing
        const users = await User.find({ emailSent: { $ne: true } })
            .sort({ createdAt: -1 }) // newest first
            .limit(500)
            .select('email fullName'); // only get email & name

        // Map to array of emails
        const emails = users.map(user => ({ email: user.email, name: user.fullName }));

        console.log(`✅ Found ${emails.length} users who haven't been emailed yet.`);
        return emails;
    } catch (err) {
        console.error('❌ Error fetching users:', err);
        return [];
    } finally {
        // Do NOT close connection if you want to reuse it later
        // mongoose.connection.close();
    }
}

// Run standalone for testing
if (require.main === module) {
    getLast500UsersEmail().then(users => console.log(users));
}

// Export function
module.exports = getLast500UsersEmail;
