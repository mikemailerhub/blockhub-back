// functions/getAllEmailUsers.js

const { usersP } = require("./paystack_customers");
const getUsersWithEmails = require("./getUsersWithEmails");

const excludeEmail = "danieldaudu65@gmail.com";

// ==========================================
// ADDITIONAL EMAIL USERS
// ==========================================
const additionalEmailUsers = [
    "simpabassador@gmail.com",
    "faisallweb3@gmail.com",
    "saidudabai73@gmail.com",
    "olanaseabdulmalik343@gmail.com",
    "aremujesuninsola@gmail.com",
    "tuanhm.forwork@gmail.com",
    "yaukhadija772@gmail.com",
    "rs47825@gmail.com",
    "olamiking112@gmail.com",
    "idrisanisoba@gmail.com",
    "melarneen@gmail.com",
    "shadrachadeyemi22@gmail.com",
    "ewuosoolusesi@gmail.com",
    "reallawancy980@gmail.com",
    "munachicollins16@gmail.com",
    "samueljohnny300@gmail.com",
    "abuyusro0x@gmail.com",
    "loyaltybassey@gmail.com",
    "mra476899@gmail.com",
    "tourmaline537@gmail.com",
    "basmahabdullahi25@gmail.com",
    "argnby2@gmail.com",
    "haseebashiq68@gmail.com",
    "emedionggregory12@gmail.com",
    "kaylashowdq@gmail.com",
    "bigchorux@gmail.com",
    "davidparkerr1109@gmail.com",
    "dilshanmapalahiru@gmail.com",
    "mirasam554@gmail.com",
    "temmymaverick@gmail.com",
    "ekwecollins202@gmail.com",
    "mikailushehu6396@gmail.com",
    "ntatubokjonathan@gmail.com",
    "meerwaseem242@gmail.com",
    "muhammadtoheed016@gmail.com",
    "waqascrypto1212@gmail.com",
    "zeexeeusman@gmail.com",
    "kehnybello@gmail.com",
    "nanakhadija5759@gmail.com",
    "cryptofirst2121@gmail.com",
    "ubomrichard@gmail.com",
    "ahmadmusamusawa05@gmail.com",
    "oparafavouramarachi@gmail.com",
    "blessingaffangkan@gmail.com",
    "isaiahosarobo08@gmail.com",
    "akpanisrael339@gmail.com",
    "ikeorapeace9@gmail.com",
    "nosiriprecious100@gmail.com",
    "gripyodha@gmail.com",
    "idowuadeleye64@gmail.com",
    "obaroelozino@gmail.com",
    "mubaraksultan08132@gmail.com",
    "emaximuse90@gmail.com",
    "clintonallen312@gmail.com",
    "researchererick@gmail.com",
    "moibiridwan05@gmail.com",
    "eyeplays68@gmail.com",
    "emiresshakur@gmail.com",
    "aniebietudo01@gmail.com",
    "justann3771@gmail.com",
    "iwariogi@gmail.com",
    "joesunday2022@gmail.com",
    "sisibaby34@gmail.com",
    "orieoghenebrurugodspower@gmail.com",
    "noelemmanuel1080@gmail.com",
    "danny3adel@gmail.com",
    "raiutkarsh768@gmail.com",
    "freemanweb3@gmail.com",
    "willieuwakmfonabasi@gmail.com",
    "realbayoladimeji@gmail.com",
    "chocofweb3@gmail.com",
    "kaludc7@gmail.com",
    "nemeethan@gmail.com",
    "billionscyberltd@gmail.com",
    "ariaace73@gmail.com",
    "jehanmrda@gmail.com",
    "calliopeburns50@gmail.com",
    "clareonchain@gmail.com",
    "afolajayeola@gmail.com",
    "olajidesolomon033@gmail.com",
    "victoruduma2020@gmail.com",
    "ahamedabdl46@gmail.com",
    "oluebubevictor9448@gmail.com",
    "deesammy27@gmail.com",
    "adebayovictor2021@gmail.com",
    "allehezekiel09@gmail.com",
    "danieletim786@gmail.com",
    "mesh.remusa@gmail.com",
    "damilolan60@gmail.com",
    "justineze9@gmail.com",
    "tessa.creates1@gmail.com",
    "ojigombadavid@gmail.com",
    "cyrusweb8@gmail.com",
    "bumojasper@gmail.com",
    "0xnirjon@gmail.com",
    "philipmujuzi19@gmail.com",
    "danielbabatunde21@gmail.com",
    "kaneejoshua@gmail.com",
    "oyatokunanu2019@gmail.com",
    "sashinmeena@gmail.com",
    "pocox40036@gmail.com",
    "asiandanieluyo@gmail.com",
    "cryptolab746@gmail.com",
    "taminatorweb3@gmail.com",
    "tafatafamustapha@gmail.com",
    "riheaukale@gmail.com",
    "udomme78@gmail.com",
    "dienyejason@gmail.com",
    "cryptoshuraim@gmail.com",
    "olusholadex4u@gmail.com",
    "lexandermbila@gmail.com",
    "leomarvis112@gmail.com",
    "himskid1717@gmail.com",
    "paulbello2005@gmail.com",
    "bebedstar@gmail.com",
    "aasimeer123@gmail.com",
    "ednaramcc@gmail.com",
    "emprezzoftech@gmail.com",
    "fluxioeth@gmail.com",
    "asuquoedidiong100@gmail.com",
    "yyqq15539@gmail.com",
    "faithadesholar@gmail.com",
    "damilolaomokehinde9@gmail.com",
    "zacharyfx459@gmail.com",
    "estrada.kebs@gmail.com",
    "abdulabdulforex@gmail.com",
    "abdulhamidib21@gmail.com",
    "tonystarkq2@gmail.com",
    "nanmwaku97@gmail.com",
    "stephenstevester@gmail.com",
    "marveltroops999@gmail.com",
    "inioluwaoladele14@gmail.com",
    "remivictor20@gmail.com",
    "holamikky50@gmail.com",
    "abubakarabdulwaheed890@gmail.com",
    "abubakaradam08145@gmail.com",
    "boywonder3006@gmail.com",
    "maureenarchibong020@gmail.com",
    "cmcodedx@gmail.com",
    "basseymiracle589@gmail.com",
    "fedorahlazarus@gmail.com",
    "emmakunmi@gmail.com",
    "charlesbella247@gmail.com",
    "shelleymaeph@gmail.com",
    "foyedepo47@gmail.com",
    "decentral24diva@gmail.com",
    "oladeniunique16@gmail.com"
];



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

       // ==========================================
// COMBINE ALL SOURCES
// ==========================================

const combinedUsers = [
    ...blockHubUsers,
    ...paystackUsers,
    ...additionalEmailUsers.map(email => ({
        name: "BlockHub User",
        email: email.trim().toLowerCase()
    }))
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