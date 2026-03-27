const mongoose = require('mongoose');
const User = require('../modal/user'); // your user model
const dnsPromises = require("node:dns/promises");
const dns = require("dns");

// 1️⃣ Force Node.js to use specific DNS servers
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS
dns.setDefaultResultOrder("ipv4first");

// 2️⃣ Connect to MongoDB
const MONGO_URI = 'mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// 3️⃣ Function to search all string fields dynamically
async function searchUsers(searchTerm) {
    try {
        if (!searchTerm) {
            console.log('Please provide a search term.');
            return;
        }

        const regex = new RegExp(searchTerm, 'i'); // case-insensitive search

        // Get all string fields from the schema
        const stringFields = Object.keys(User.schema.paths).filter(field => {
            return User.schema.paths[field].instance === 'String';
        });

        // Build $or condition for all string fields
        const orCondition = stringFields.map(field => ({ [field]: { $regex: regex } }));

        // Run query
        const users = await User.find({ $or: orCondition });

        console.log(`Found ${users.length} users matching "${searchTerm}":`);
        users.forEach(user => {
            console.log(`- ${user.fullName} (${user.twitterHandle})`);
        });
    } catch (err) {
        console.error('Error fetching users:', err);
    } finally {
        mongoose.connection.close(); // close connection after done
    }
}

// 4️⃣ Call function with search term from command line or default
const searchTerm = process.argv[2] || 'chio';
searchUsers(searchTerm);
