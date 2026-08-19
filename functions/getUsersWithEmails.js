// functions/getUsersWithEmails.js

const mongoose = require("mongoose");
const User = require("../models/user");

const dnsPromises = require("node:dns/promises");
const dns = require("dns");

dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const MONGO_URI =
    "mongodb+srv://blockhubmailer:%23%23Block34534%40God@blockhub.6omwwvj.mongodb.net/live?retryWrites=true&w=majority";


async function getUsersWithEmails() {

    try {

        await mongoose.connect(MONGO_URI);

        console.log("✅ MongoDB connected");


        const users = await User.find({
            email: {
                $exists: true,
                $nin: [null, ""]
            }
        })
        .select("fullName email")
        .lean();


        const usersWithEmails = users
            .filter(user =>
                user.email &&
                user.email.trim()
            )
            .map(user => ({
                name:
                    user.fullName ||
                    "BlockHub User",

                email:
                    user.email.trim().toLowerCase()
            }));


        console.log(
            `📧 BlockHub users with email: ${usersWithEmails.length}`
        );


        return usersWithEmails;


    } catch (error) {

        console.error(
            "❌ Error fetching users with emails:",
            error
        );

        throw error;

    } finally {

        await mongoose.connection.close();

        console.log(
            "🔌 MongoDB connection closed"
        );

    }

}


if (require.main === module) {

    getUsersWithEmails()
        .then((users) => {

            console.log(
                `\n📊 TOTAL USERS WITH EMAIL: ${users.length}`
            );

            console.log(users);

        })
        .catch(() => {

            process.exit(1);

        });

}


module.exports = getUsersWithEmails;