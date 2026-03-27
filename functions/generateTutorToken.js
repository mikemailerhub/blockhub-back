const jwt = require('jsonwebtoken');

// Secret key (store in env)
const TUTOR_SECRET = process.env.TUTOR_SECRET || 'mysecretkey';

// Admin generates a tutor token
function generateTutorToken(userId) {
  const payload = { userId }; // attach the user id
  // Expires in 24 hours
  return jwt.sign(payload, TUTOR_SECRET, { expiresIn: '24h' });
}

// Example usage
const token = generateTutorToken('689437850a216fc5210fbaa2'); // user's ObjectId
console.log(token);

