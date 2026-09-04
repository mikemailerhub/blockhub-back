const nodemailer = require("nodemailer");
const getAllEmailUsers = require("./getAllEmailUsers");


const failedEmails = [
  "danny3adel@gmail.com",
  "raiutkarsh768@gmail.com",
  "freemanweb3@gmail.com",
  "willieuwakmfonabasi@gmail.com",
  "realbayoladimeji@gmail.com",
  "chocofweb3@gmail.com",
  "kaludc7@gmail.com",
  "billionscyberltd@gmail.com",
  "ariaace73@gmail.com",
  "jehanmrda@gmail.com",
  "calliopeburns50@gmail.com",
  "clareonchain@gmail.com",
  "afolajayeola@gmail.com",
  "olajidesolomon033@gmail.com",
  "victoruduma2020@gmail.com",
  "ahamedabdl46@gmail.com",
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
  "oladeniunique16@gmail.com",
];

// ============================================================
// TEST MODE
// ============================================================

// false = send to all combined users
// true  = send only to the test emails below
const TEST_MODE = false;

// ============================================================
// TEST EMAILS
// ============================================================

const testUsers = [
  {
    email: "danieldaudu65@gmail.com",
    name: "Daniel",
  },
  {
    email: "gbadeboprecious113@gmail.com",
    name: "Precious",
  },
];

// ============================================================
// ARRAYS TO TRACK EMAILS
// ============================================================

const sentUsers = [];
const failedUsers = [];

// ============================================================
// NODEMAILER TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "block.hub.mailer@gmail.com",
    pass: "ipbn panb bbvq ubgq",
  },
});

// ============================================================
// EMAIL SUBJECT
// ============================================================

const subject = "🚀 BlockHub Cohort 1.0 Registration Is Now Active!";

// ============================================================
// WHATSAPP GROUP
// ============================================================

// const whatsappGroup =
//   "https://chat.whatsapp.com/IqUSevVWFhTI4I3LSUPL0V?mode=gi_t";

// ============================================================
// EMAIL CONTENT
// ============================================================
const registrationLink =
  "https://blockhubglobal.xyz/cohort/registration";

const whatsappGroup =
  "https://chat.whatsapp.com/IqUSevVWFhTI4I3LSUPL0V?mode=gi_t";

const htmlMessage = `

<div style="
  background:#f5f5f5;
  padding:20px 0;
">

  <div style="
    max-width:640px;
    margin:0 auto;
    background:#ffffff;
    padding:28px;
    border-radius:16px;
    font-family:Arial,Helvetica,sans-serif;
    color:#111111;
    box-shadow:0 12px 35px rgba(0,0,0,0.08);
  ">

    <!-- Logo -->

    <div style="
      text-align:center;
      margin-bottom:24px;
    ">

      <img
        src="https://res.cloudinary.com/dd7faellv/image/upload/v1788434434/photo_2026-09-03_12-19-22_tvehzz.jpg"
        alt="BlockHub"
        style="
          max-width:100%;
          border-radius:10px;
          display:block;
          margin:0 auto;
        "
      />

    </div>


    <!-- Greeting -->

    <p style="
      font-size:15px;
      margin:0 0 18px;
    ">
      Hello dear 👋
    </p>


    <!-- Heading -->

    <h1 style="
      font-size:20px;
      line-height:1.25;
      margin:0 0 18px;
      font-weight:700;
    ">
      🚀BlockHub Cohort 1.0 Registration Is Now Active!
    </h1>


    <!-- Intro -->

    <p style="
      font-size:15px;
      line-height:1.75;
      margin:0 0 14px;
    ">
      Good news! <strong>Registration for BlockHub Cohort 1.0 is now officially active.</strong>
      You can now register for this <strong>FREE</strong> cohort and secure your spot for the upcoming cohort.
    </p>



    <!-- Courses -->

    <div style="
      margin:22px 0;
      padding:20px;
      background:#ffffff;
      border-radius:12px;
      border:1px solid #e9e9e9;
    ">

      <h2 style="
        font-size:17px;
        margin:0 0 14px;
        color:#111111;
      ">
        📚 Available Courses
      </h2>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>01.</strong> Project Management
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>02.</strong> Vibe Coding & Frontend Development
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>03.</strong> Backend Development
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>04.</strong> DevOps Engineering
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>05.</strong> Full-Stack Development
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>06.</strong> 3D Design & Animation
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>07.</strong> AI Video & Content Creation
      </p>

      <p style="margin:9px 0;font-size:14px;line-height:1.6;">
        <strong>08.</strong> Crypto Trading (Degen)
      </p>

    </div>



    <!-- Cohort Details -->

    <div style="
      margin:22px 0;
      padding:18px;
      background:#f7f7f7;
      border-radius:12px;
    ">

      <p style="
        font-size:14px;
        line-height:1.7;
        margin:0;
      ">
        <strong>Classes start:</strong> Mid October
      </p>

      <p style="
        font-size:14px;
        line-height:1.7;
        margin:8px 0 0;
      ">
        <strong>Cost:</strong> Completely FREE
      </p>

      <p style="
        font-size:14px;
        line-height:1.7;
        margin:8px 0 0;
      ">
        <strong>Level:</strong> Beginner-friendly & practical
      </p>

    </div>



    <!-- Registration CTA -->

    <div style="
      text-align:center;
      margin:30px 0;
    ">

      <p style="
        font-size:15px;
        line-height:1.7;
        margin:0 0 18px;
      ">
        Registration is now active. Choose your preferred course and
        register today.
      </p>

      <a
        href="${registrationLink}"
        target="_blank"
        style="
          display:inline-block;
          background:linear-gradient(to right,#166534 0%,#14532d 45%,#111111 100%);
          color:#ffffff;
          text-decoration:none;
          padding:15px 30px;
          border-radius:10px;
          font-size:14px;
          font-weight:700;
        "
      >
        🚀 Register for Cohort 1.0
      </a>

    </div>



    <!-- Social buttons -->

    <div style="
      margin-top:26px;
      text-align:center;
    ">

      <a
        href="https://x.com/_blockhub"
        target="_blank"
        style="
          display:inline-block;
          width:46%;
          padding:13px 0;
          margin-right:2%;
          text-decoration:none;
          color:#ffffff;
          font-size:12px;
          font-weight:600;
          background:linear-gradient(to right,#166534 0%,#14532d 45%,#111111 100%);
          border-radius:10px;
        "
      >
        Follow us on X
      </a>

      <a
        href="https://t.me/blockhub_V2"
        target="_blank"
        style="
          display:inline-block;
          width:46%;
          padding:13px 0;
          text-decoration:none;
          color:#ffffff;
          font-size:12px;
          font-weight:600;
          background:linear-gradient(to right,#166534 0%,#14532d 45%,#111111 100%);
          border-radius:10px;
        "
      >
        Join Telegram
      </a>

    </div>



    <!-- Footer -->

    <p style="
      font-size:12px;
      line-height:1.6;
      color:#777777;
      text-align:center;
      margin-top:28px;
      margin-bottom:0;
    ">
      BlockHub Cohort 1.0 — Learn. Build. Grow.
    </p>

  </div>

</div>

`;


// ============================================================
// SEND EMAILS
// ============================================================

async function sendTestEmail() {
  try {

    // ==========================================
    // GET ALL USERS
    // ==========================================

    let users;

    if (TEST_MODE) {
      users = testUsers;
    } else {
      users = await getAllEmailUsers();
    }

    // ==========================================
    // CHECK USERS
    // ==========================================

    if (!users || users.length === 0) {
      console.log("❌ No users with email addresses found.");
      return;
    }

    console.log("==========================================");
    console.log(`📨 Total users to email: ${users.length} `);
    console.log("==========================================");

    // ==========================================
    // SEND EMAILS
    // ==========================================

    for (const user of users) {
      const mailOptions = {
        from: '"BlockHub" <block.hub.mailer@gmail.com>',
        to: user.email,
        subject,
        html: htmlMessage.replace(
          "{{name}}",
          user.name || "BlockHubber"
        ),
      };

      try {
        await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent to ${user.email} `);

        sentUsers.push(user.email);

      } catch (err) {
        console.error(
          `❌ Failed to send to ${user.email}: `,
          err.message
        );

        failedUsers.push(user.email);
      }

      // Small delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }

    // ==========================================
    // SUMMARY
    // ==========================================

    console.log("==========================================");
    console.log(`📊 Total users: ${users.length} `);
    console.log(`✅ Successfully sent: ${sentUsers.length} `);
    console.log(`❌ Failed: ${failedUsers.length} `);
    console.log("==========================================");

    // ==========================================
    // SEND SUMMARY TO YOURSELF
    // ==========================================

    await transporter.sendMail({
      from: '"BlockHub" <block.hub.mailer@gmail.com>',
      to: "danieldaudu65@gmail.com",
      subject: "📧 BlockHub Cohort Registration Email Summary",

      html: `
  < div style = "font-family:Arial,sans-serif;padding:20px;" >
          <h2>📧 BlockHub Cohort 1.0 Email Campaign Summary</h2>

          <p>
            👥 <strong>Total users:</strong>
            ${users.length}
          </p>

          <p>
            ✅ <strong>Successfully sent:</strong>
            ${sentUsers.length}
          </p>

          <p>
            ❌ <strong>Failed:</strong>
            ${failedUsers.length}
          </p>

          <hr>

          <h3>✅ Sent Emails</h3>

          <p>
            ${sentUsers.length
          ? sentUsers.join("<br>")
          : "None"
        }
          </p>

          <h3>❌ Failed Emails</h3>

          <p>
            ${failedUsers.length
          ? failedUsers.join("<br>")
          : "None"
        }
          </p>
        </div>
`,
    });

    console.log("📧 Summary email sent successfully.");

  } catch (error) {
    console.error(
      "❌ Email campaign failed:",
      error
    );
  }
}

// ============================================================
// RUN
// ============================================================

sendTestEmail();
