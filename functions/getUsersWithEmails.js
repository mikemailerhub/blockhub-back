const mongoose = require("mongoose");
const User = require("../models/user");
const Waitlist = require("../models/Waitlist");

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

    // Get normal BlockHub users
    const users = await User.find({
      email: {
        $exists: true,
        $nin: [null, ""],
      },
    })
      .select("fullName email")
      .lean();

    const blockHubUsers = users
      .filter((user) => user.email && user.email.trim())
      .map((user) => ({
        name: user.fullName || "BlockHub User",
        email: user.email.trim().toLowerCase(),
      }));

    // Get waitlist users
    const waitlistUsersRaw = await Waitlist.find({
      email: {
        $exists: true,
        $nin: [null, ""],
      },
    })
      .select("fullName email")
      .lean();

    const waitlistUsers = waitlistUsersRaw
      .filter((user) => user.email && user.email.trim())
      .map((user) => ({
        name: user.fullName || "BlockHub User",
        email: user.email.trim().toLowerCase(),
      }));

    // Combine both
    const combinedUsers = [...blockHubUsers, ...waitlistUsers];

    // Remove duplicate emails
    const uniqueEmails = new Map();

    for (const user of combinedUsers) {
      if (!user.email) continue;

      const email = user.email.trim().toLowerCase();

      if (!uniqueEmails.has(email)) {
        uniqueEmails.set(email, {
          name: user.name || "BlockHub User",
          email,
        });
      }
    }

    const usersWithEmails = Array.from(uniqueEmails.values());

    console.log(
      `📧 BlockHub users with email: ${blockHubUsers.length}`
    );

    console.log(
      `📝 Waitlist users with email: ${waitlistUsers.length}`
    );

    console.log(
      `📨 Total unique database users: ${usersWithEmails.length}`
    );

    return usersWithEmails;
  } catch (error) {
    console.error("❌ Error fetching users with emails:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

if (require.main === module) {
  getUsersWithEmails()
    .then((users) => {
      console.log(`\n📊 TOTAL UNIQUE USERS WITH EMAIL: ${users.length}`);
      console.log(users);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = getUsersWithEmails;