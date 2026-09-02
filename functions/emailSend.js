const nodemailer = require("nodemailer");
const getAllEmailUsers = require("./getAllEmailUsers");

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

const subject = "🚀 BlockHub Cohort 1.0 Registration Is Now Open";

// ============================================================
// WHATSAPP GROUP
// ============================================================

const whatsappGroup =
  "https://chat.whatsapp.com/IqUSevVWFhTI4I3LSUPL0V?mode=gi_t";

// ============================================================
// EMAIL CONTENT
// ============================================================

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
        src="https://res.cloudinary.com/dd7faellv/image/upload/v1786722510/photo_2026-08-14_16-46-58_pvjbxl.jpg"
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
      font-size:26px;
      line-height:1.25;
      margin:0 0 18px;
      font-weight:700;
    ">
      🚀 BlockHub Cohort 1.0 Registration Is Now Open
    </h1>

    <!-- Intro -->
    <p style="
      font-size:15px;
      line-height:1.75;
      margin:0 0 14px;
    ">
      Registration for <strong>BlockHub Cohort 1.0</strong> has officially started.
      This is your opportunity to learn, build, improve your skills, and connect
      with other people growing in the digital space.
    </p>

    <p style="
      font-size:15px;
      line-height:1.75;
      margin:0 0 18px;
    ">
      We have a range of practical learning tracks available, so you can choose
      the area that best matches your interest and goals.
    </p>

    <!-- Courses -->
    <div style="
      margin:22px 0;
      padding:20px;
      background:#f7f7f7;
      border-radius:12px;
      border:1px solid #e9e9e9;
    ">

      <h2 style="
        font-size:17px;
        margin:0 0 14px;
        color:#111111;
      ">
        Available Tracks
      </h2>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>01.</strong> Project Management
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>02.</strong> Vibe Coding / Frontend Development
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>03.</strong> Backend Development / DevOps
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>04.</strong> Full-Stack Development
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>05.</strong> 3D Animation
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>06.</strong> AI Video Making
      </p>

      <p style="margin:8px 0;font-size:14px;line-height:1.6;">
        <strong>07.</strong> Deriv Trading
      </p>

    </div>

    <!-- Main CTA -->
    <div style="
      text-align:center;
      margin:28px 0;
    ">

      <p style="
        font-size:15px;
        line-height:1.7;
        margin:0 0 18px;
      ">
        Join the official BlockHub Cohort 1.0 WhatsApp group to get
        registration details, updates, announcements, and other important
        information about the cohort.
      </p>

      <a
        href="${whatsappGroup}"
        target="_blank"
        style="
          display:inline-block;
          background:linear-gradient(135deg,#22c55e,#111111);
          color:#ffffff;
          text-decoration:none;
          padding:15px 28px;
          border-radius:10px;
          font-size:14px;
          font-weight:700;
        "
      >
        Join the Cohort WhatsApp Group
      </a>

    </div>

    <!-- Secondary message -->
    <div style="
      margin-top:24px;
      padding-top:20px;
      border-top:1px solid #eeeeee;
    ">

      <p style="
        font-size:14px;
        line-height:1.7;
        margin:0;
        color:#555555;
      ">
        More details about the learning schedule, onboarding, and next steps
        will be shared inside the group.
      </p>

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
          background:#111111;
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
          background:#22c55e;
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
    console.log(`📨 Total users to email: ${users.length}`);
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

        console.log(`✅ Email sent to ${user.email}`);

        sentUsers.push(user.email);

      } catch (err) {
        console.error(
          `❌ Failed to send to ${user.email}:`,
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
    console.log(`📊 Total users: ${users.length}`);
    console.log(`✅ Successfully sent: ${sentUsers.length}`);
    console.log(`❌ Failed: ${failedUsers.length}`);
    console.log("==========================================");

    // ==========================================
    // SEND SUMMARY TO YOURSELF
    // ==========================================

    await transporter.sendMail({
      from: '"BlockHub" <block.hub.mailer@gmail.com>',
      to: "danieldaudu65@gmail.com",
      subject: "📧 BlockHub Cohort Registration Email Summary",

      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
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
            ${
              sentUsers.length
                ? sentUsers.join("<br>")
                : "None"
            }
          </p>

          <h3>❌ Failed Emails</h3>

          <p>
            ${
              failedUsers.length
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
