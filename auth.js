const jwtSecret = process.env.JWT_SECRET || 'mySuperSecretKey123!'; // Reuse same secret from passport.js

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Load the passport strategies

// JWT generator function
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Encoded in JWT payload
    expiresIn: '7d',        // Valid for 7 days
    algorithm: 'HS256'      // Signature algorithm
  });
};

// Login endpoint
module.exports = (app) => {
  app.post('/login', (req, res) => {

    console.log("Login request body:", req.body);
    
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }

        // Create JWT and return with user object
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
