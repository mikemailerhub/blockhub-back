const mongoose = require("mongoose");
const User = require("../models/user");

const dnsPromises = require("node:dns/promises");
const dns = require("dns");

// DNS
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const MONGO_URI =
    "mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority";


async function getUserCount() {

    try {

        console.log("🔌 Connecting to MongoDB...");

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
        });

        console.log("✅ MongoDB connected");

        const count =
            await User.countDocuments({});

        console.log(
            `📊 Total number of users in the database: ${count}`
        );

        return count;

    } catch (error) {

        console.error(
            "❌ Error fetching user count:",
            error
        );

    } finally {

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    }

}


if (require.main === module) {
    getUserCount();
}


module.exports = getUserCount;