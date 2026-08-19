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
    name: "Daniel",
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
    pass: "raay ufip eira unic",
  },

});


// ============================================================
// EMAIL SUBJECT
// ============================================================

const subject =
  "🚀 BlockHub Cohort 1.0 Is Coming";


// ============================================================
// EMAIL CONTENT
// ============================================================

const htmlMessage = `

<div style="
    background:#fff;
    padding:12px 0;
">

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

        <div style="
            text-align:center;
            margin-bottom:24px;
        ">

            <img
                src="https://res.cloudinary.com/dd7faellv/image/upload/v1786722510/photo_2026-08-14_16-46-58_pvjbxl.jpg"
                alt="BlockHub"
                style="
                    max-width:100%;
                    border-radius:8px;
                "
            />

        </div>


        <!-- Greeting -->

        <p style="
            font-size:15px;
            margin-bottom:18px;
        ">

            Hello BlockHubber 👋

        </p>


        <!-- Main Heading -->

        <p style="node 
            font-size:16px;
            line-height:1.3;
            margin:0 0 20px;
            font-weight:700;
        ">

            🚀 BlockHub Cohort 1.0 Is Coming

        </h1>


        <!-- Message -->

        <p style="
            font-size:14px;
            line-height:1.7;
            margin-top:12px;
        ">

            Something exciting is coming to BlockHub.

        </p>


        <p style="
            font-size:14px;
            line-height:1.7;
            margin-top:12px;
        ">

            We’re getting ready to launch
            <strong>BlockHub Cohort 1.0</strong>,
            a free learning experience designed to bring people together to
            learn, grow, and explore new opportunities.

        </p>


        <p style="
            font-size:14px;
            line-height:1.7;
            margin-top:12px;
        ">

            Participants in Cohort 1.0 will also get access to
            <strong>
                additional free packages, useful tools, and other resources
            </strong>
            along the way.

        </p>


        <p style="
            font-size:14px;
            line-height:1.7;
            margin-top:12px;
        ">

            Be part of
            <strong>BlockHub Cohort 1.0</strong>
            as more details will be revealed soon.

        </p>


        <!-- CTA -->

       


        <!-- Social Buttons -->

         <div style="margin-top:24px;text-align:center;">
     

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


        <!-- Footer -->

        <p style="
            font-size:12px;
            line-height:1.6;
            color:#666666;
            text-align:center;
            margin-top:28px;
        ">

            More details about BlockHub Cohort 1.0 will be revealed soon.
            Stay connected. 🚀

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

      users =
        await getAllEmailUsers();

    }


    // ==========================================
    // CHECK USERS
    // ==========================================

    if (!users || users.length === 0) {

      console.log(
        "❌ No users with email addresses found."
      );

      return;

    }


    console.log(
      "=========================================="
    );

    console.log(
      `📨 Total users to email: ${users.length}`
    );

    console.log(
      "=========================================="
    );


    // ==========================================
    // SEND EMAILS
    // ==========================================

    for (const user of users) {

      const mailOptions = {

        from:
          '"BlockHub" <block.hub.mailer@gmail.com>',

        to:
          user.email,

        subject:
          subject,

        html:
          htmlMessage.replace(
            "{{name}}",
            user.name || "BlockHubber"
          ),

      };


      try {

        await transporter.sendMail(
          mailOptions
        );


        console.log(
          `✅ Email sent to ${user.email}`
        );


        sentUsers.push(
          user.email
        );


      } catch (err) {

        console.error(
          `❌ Failed to send to ${user.email}:`,
          err.message
        );


        failedUsers.push(
          user.email
        );

      }


      // ==========================================
      // SMALL DELAY
      // ==========================================

      await new Promise(
        resolve =>
          setTimeout(resolve, 1500)
      );

    }


    // ==========================================
    // SUMMARY
    // ==========================================

    console.log(
      "=========================================="
    );

    console.log(
      `📊 Total users: ${users.length}`
    );

    console.log(
      `✅ Successfully sent: ${sentUsers.length}`
    );

    console.log(
      `❌ Failed: ${failedUsers.length}`
    );

    console.log(
      "=========================================="
    );


    // ==========================================
    // SEND SUMMARY TO YOURSELF
    // ==========================================

    await transporter.sendMail({

      from:
        '"BlockHub" <block.hub.mailer@gmail.com>',

      to:
        "danieldaudu65@gmail.com",

      subject:
        "📧 BlockHub Cohort Email Summary",

      html: `

                <div
                    style="
                        font-family:Arial,sans-serif;
                        padding:20px;
                    "
                >

                    <h2>
                        📧 BlockHub Email Campaign Summary
                    </h2>

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


                    <h3>
                        ✅ Sent Emails
                    </h3>

                    <p>
                        ${sentUsers.length
          ? sentUsers.join("<br>")
          : "None"
        }
                    </p>


                    <h3>
                        ❌ Failed Emails
                    </h3>

                    <p>
                        ${failedUsers.length
          ? failedUsers.join("<br>")
          : "None"
        }
                    </p>

                </div>

            `,

    });


    console.log(
      "📧 Summary email sent successfully."
    );


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