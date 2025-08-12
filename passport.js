const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models"),
  passportJWT = require("passport-jwt");
bcrypt = require("bcrypt");
const { User } = require("./models");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy: handles login
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, callback) => {
      try {
        const user = await Users.findOne({ username: username });
        console.log("Found user:", user); // Might show password hash in logs — be cautious!
        console.log(`Login attempt: ${username}`);
        if (!user) {
          console.log("User not found.");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }
        if (!user.validatePassword(password)) {
          console.log("Incorrect password");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);

// JWTStrategy: verifies token on each request
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "mySuperSecretKey123!",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => callback(null, user))
        .catch((error) => callback(error));
    }
  )
);
