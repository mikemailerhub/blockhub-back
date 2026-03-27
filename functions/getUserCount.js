// getUserCount.js

const mongoose = require('mongoose');
const User = require('../modal/user'); // Adjust the path to your User model
const dnsPromises = require("node:dns/promises");
const dns = require("dns");

// 1️⃣ Force Node.js to use specific DNS servers
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS
dns.setDefaultResultOrder("ipv4first");

// 2️⃣ Connect to MongoDB
const MONGO_URI = 'mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// 3️⃣ Function to get total number of users
async function getUserCount() {
    try {
        const count = await User.countDocuments({});
        console.log(`📊 Total number of users in the database: ${count}`);
    } catch (err) {
        console.error('❌ Error fetching user count:', err);
    } finally {
        mongoose.connection.close(); // close connection after done
    }
}

// 4️⃣ Run the function if called directly
if (require.main === module) {
    getUserCount();
}

module.exports = getUserCount;
