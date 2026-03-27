const mongoose = require('mongoose');
const User = require('../modal/user'); // your User model
const dnsPromises = require("node:dns/promises");
const dns = require("dns");

// Force DNS to avoid Atlas SRV issues
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

// Connect to MongoDB
const MONGO_URI = 'mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function deleteUser(twitterHandle) {
    try {
        const result = await User.deleteOne({ twitterHandle });
        if (result.deletedCount === 1) {
            console.log(`User with twitterHandle "${twitterHandle}" has been deleted.`);
        } else {
            console.log(`No user found with twitterHandle "${twitterHandle}".`);
        }
    } catch (err) {
        console.error('Error deleting user:', err);
    } finally {
        mongoose.connection.close();
    }
}

// Call the function with the exact twitterHandle
deleteUser('@princessof_web3');
