const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../models/user");
const jwt = require("jsonwebtoken");

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
      includeEmail: true,
    },
    async (token, tokenSecret, profile, done) => {
      console.log("Raw Twitter profile:", profile);

      try {
        const { id, displayName, username, photos, emails, _json } = profile;

        const twitterData = {
          fullName: displayName,
          twitterHandle: "@" + username.toLowerCase(),
          twitterId: id,
          profileImage: photos?.[0]?.value,
          verified: _json?.verified || false,
          followersCount: _json?.followers_count || 0,
          followingCount: _json?.friends_count || 0,
          tweetCount: _json?.statuses_count || 0,
          email: emails?.[0]?.value || null,
        };

        // 1️⃣ Find existing user
        let user = await User.findOne({ twitterId: id });

        if (user) {
          // 2️⃣ Update missing or outdated fields
          let updated = false;
          for (const key in twitterData) {
            if (!user[key] && twitterData[key] !== undefined) {
              user[key] = twitterData[key];
              updated = true;
            }
          }
          if (updated) await user.save();
        } else {
          // 3️⃣ Create new user
          user = await User.create(twitterData);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;