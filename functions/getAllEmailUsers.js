// functions/getAllEmailUsers.js

const { usersP } = require("./paystack_customers");
const getUsersWithEmails = require("./getUsersWithEmails");

const excludeEmail = "danieldaudu65@gmail.com";

async function getAllEmailUsers() {
    try {

        // ==========================================
        // GET BLOCKHUB DATABASE USERS
        // ==========================================

        const blockHubUsers =
            await getUsersWithEmails();


        // ==========================================
        // GET PAYSTACK USERS
        // ==========================================

        const paystackUsers =
            (usersP || [])
                .filter(user =>
                    user.email &&
                    user.email.trim()
                )
                .map(user => ({
                    name:
                        user.name ||
                        "BlockHub User",

                    email:
                        user.email.trim().toLowerCase()
                }));


        // ==========================================
        // COMBINE BOTH SOURCES
        // ==========================================

        const combinedUsers = [
            ...blockHubUsers,
            ...paystackUsers
        ];


        // ==========================================
        // REMOVE DUPLICATES
        // ==========================================

        const uniqueEmails = new Map();


        for (const user of combinedUsers) {

            if (!user.email) {
                continue;
            }


            const email =
                user.email.trim().toLowerCase();


            // Skip excluded email
            if (
                email ===
                excludeEmail.toLowerCase()
            ) {
                continue;
            }


            // Only add email once
            if (!uniqueEmails.has(email)) {

                uniqueEmails.set(
                    email,
                    {
                        name:
                            user.name ||
                            "BlockHub User",

                        email
                    }
                );

            }

        }


        const users =
            Array.from(
                uniqueEmails.values()
            );


        // ==========================================
        // LOG SUMMARY
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            `📧 BlockHub users: ${blockHubUsers.length}`
        );

        console.log(
            `💳 Paystack users: ${paystackUsers.length}`
        );

        console.log(
            `📨 Combined unique users: ${users.length}`
        );

        console.log(
            "=========================================="
        );


        return users;

    } catch (error) {

        console.error(
            "❌ Error getting all email users:",
            error
        );

        throw error;
    }
}

// ==========================================
// TEST FUNCTION
// ==========================================

if (require.main === module) {

    getAllEmailUsers()
        .then((users) => {

            console.log("\n📋 ALL EMAIL USERS:\n");

            console.log(users);

            console.log(
                `\n📊 TOTAL UNIQUE EMAIL USERS: ${users.length}`
            );

        })
        .catch((error) => {

            console.error(
                "❌ Failed to get email users:",
                error
            );

        });

}


module.exports = getAllEmailUsers;