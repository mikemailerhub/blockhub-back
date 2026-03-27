const nodemailer = require('nodemailer');
const { usersP } = require('./paystack_customers');

// 1️⃣ The email you want to exclude (already tested)
const excludeEmail = "danieldaudu65@gmail.com";

// 2️⃣ Filter usersP to remove the excluded email and remove duplicates
const uniqueEmailsMap = new Map();

for (let u of usersP) {
  const email = u.email.toLowerCase(); // normalize
  if (email !== excludeEmail.toLowerCase() && !uniqueEmailsMap.has(email)) {
    uniqueEmailsMap.set(email, { email: u.email, name: "Friend" });
  }
}
const TEST_MODE = false; // change to false when ready

// 3️⃣ Convert map to array
// 🔥 TEST MODE — send only to excluded email
const allUsers = Array.from(uniqueEmailsMap.values());

const users = TEST_MODE
  ? [{ email: excludeEmail, name: "Daniel" }, { email: "01jesusbaby@gmail.com", name: "Daniel" }]
  : allUsers;


console.log("Users after filtering:", users);

// Arrays to track sent and failed emails
const sentUsers = [];
const failedUsers = [];

// 2️⃣ Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "block.hub.mailer@gmail.com",
    pass: "fdyq nopf aqhi hfaf"
  }
});

// 3️⃣ Email content
const subject = '🚀 BlockHub Academy Launches This March — 1,000 Free Seats';

const htmlMessage = `
<div style="background:#fff;padding:12px 0;">
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#ffffff;
    padding:22px;
    border-radius:14px;
    font-family:Arial, sans-serif;
    color:#000000;
    box-shadow:0 16px 40px rgba(0,0,0,0.08);
  ">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://res.cloudinary.com/dd7faellv/image/upload/v1770282650/emails/xdnzuqipyjjnjpsvx1ea.jpg" alt="BlockHub" style="max-width:100%;border-radius:8px;" />
    </div>

    <p style="font-size:15px;">
      GM BlockHub Family,
    </p>

    <p style="font-size:14px;">
      It's another week of learning, connecting, and accumulating information.
    </p>

    <p style="font-size:16px;font-weight:600;margin-top:10px;">
      Here's what's cooking in the Hub:
    </p>

    <p style="font-size:16px;font-weight:600;margin-top:18px;">
      BlockHub Academy: Calling all Founding Educators
    </p>

    <p style="font-size:14px;margin-top:12px;">
      BlockHub Academy is more than just a learning platform; it's a self-sustaining flywheel:
    </p>

    <p style="font-size:14px;margin-top:12px;">
      If you have battle-tested expertise, now is your chance to:
    </p>

    <ul style="font-size:14px;margin-top:12px;padding-left:18px;line-height:1.6;">
      <li> Own your content</li>
      <li> Build your brand</li>
      <li> Revenue Share</li>
      <li> Shape the future</li>
    </ul>

    <p style="font-size:16px;font-weight:600;margin-top:18px;">
      What happens next at BlockHub?
    </p>

    <ul style="font-size:14px;margin-top:12px;padding-left:18px;line-height:1.6;">
      <li> Community calls and X Spaces (keep alerts turned on for @Block_hubV2)</li>
      <li> Upcoming AMA Space on Saturday by 6pm</li>
    </ul>

    <p style="font-size:14px;margin-top:12px;">
      https://x.com/web3xamals/status/2031355692292964560
    </p>

    <p style="font-size:14px;margin-top:12px;">
      Do well to set a reminder so you don’t miss it.
    </p>

    <p style="font-size:14px;margin-top:12px;">
      • New income opportunities are emerging with our partners.
    </p>

    <p style="font-size:14px;margin-top:16px;">
      If you're working on something great or simply looking for a place to hang out, our direct messages are always open.
    </p>

    <!-- CTA Buttons -->
    <div style="margin-top:24px;text-align:center;">
      <a href="https://blockhubglobal.xyz/academy/waitlist"
        style="
          display:block;
          width:100%;
          margin-bottom:12px;
          padding:14px 0;
          text-decoration:none;
          color:#ffffff;
          font-size:13px;
          font-weight:600;
          background:linear-gradient(135deg,#16a34a,#020617);
          border-radius:10px;
        ">
        JOIN THE WAITLIST
      </a>

      <a href="https://x.com/Block_hubV2"
        style="
     display:inline-block;
          width:48%;
          padding:14px 0;
          text-decoration:none;
          color:#ffffff;
          font-size:12px;
          font-weight:600;
          background:linear-gradient(135deg,#22c55e,#000000);
          border-radius:10px;
        ">
        Follow us on X
      </a>

      <a href="https://t.me/blockhubVii"
        style="
          display:inline-block;
          width:48%;
          padding:14px 0;
          text-decoration:none;
          color:#ffffff;
          font-size:12px;
          font-weight:600;
          background:linear-gradient(135deg,#22c55e,#000000);
          border-radius:10px;
        ">
        Join the Telegram
      </a>
    </div>

  </div>
</div>
`;
// 4️⃣ Send emails
async function sendTestEmail() {
  for (let user of users) {
    const mailOptions = {
      from: '"BlockHub" <block.hub.mailer@gmail.com>',
      to: user.email,
      subject: subject,
      html: htmlMessage.replace('{{name}}', user.name),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
      sentUsers.push(user.email);
    } catch (err) {
      console.error(`Failed to send to ${user.email}:`, err);
      failedUsers.push(user.email);
    }

    // Optional: small delay to avoid Gmail throttling
    await new Promise(r => setTimeout(r, 1500));
  }

  // 5️⃣ Send summary to yourself after loop
  await transporter.sendMail({
    from: '"BlockHub" <block.hub.mailer@gmail.com>',
    to: 'danieldaudu65@gmail.com', // <-- replace with your real email
    subject: '📧 Email Sending Summary',
    html: `
            <p>✅ Sent to: ${sentUsers.join(', ')}</p>
            <p>❌ Failed to send to: ${failedUsers.join(', ')}</p>
        `
  });
  console.log('Summary email sent to yourself');
}

// Run the function
sendTestEmail();
