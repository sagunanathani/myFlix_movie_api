/**
 * @file index.js
 * @title myFlix Movie API
 * @author Saguna Nathani
 * @version 1.0.0
 * @description A RESTful API built with Express and MongoDB for managing movies, genres, directors, and users.
 *  * Initializes Express, connects to MongoDB, configures middleware,
 * authentication, and defines routes for movies and user management.
 */

// Load environment variables from .env
require("dotenv").config();

// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const path = require("path");

// Import models
const { Movie, User } = require("./models");

// Initialize Express app
const app = express();

// Swagger setup
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Initializes the Express application by setting up middleware, routes, authentication, and error handling.
 * @function initializeApp
 * @returns {void}
 */
function initializeApp() {
  // Middleware setup
  app.use(morgan("common"));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());

  // Allowed origins for CORS
  const allowedOrigins = [
    "http://localhost:4200",
    "http://localhost:8080",
    "http://testsite.com",
    "http://localhost:1234",
    "https://myflix-movies-sagunanathani.netlify.app",
    "https://sagunanathani.github.io",
  ];

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          return callback(
            new Error(
              "CORS policy does not allow access from origin " + origin
            ),
            false
          );
        }
        return callback(null, true);
      },
    })
  );

  // Authentication setup
  require("./auth")(app);
  const passport = require("passport");
  require("./passport");

  /**
   * GET /
   * @summary Serves the homepage of the API.
   * @returns {HTML} 200 - The homepage HTML file
   */
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  /**
   * GET /movies
   * @summary Returns a list of all movies.
   * @security JWT
   * @returns {Array<Object>} 200 - A list of movie objects
   * @returns {Error} 500 - Internal server error
   */
  app.get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const movies = await Movie.find();
        res.json(movies);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  /**
   * GET /movies/id/{movieID}
   * @summary Returns a movie by its MongoDB ID.
   * @param {string} movieID.path - The ID of the movie
   * @returns {Object} 200 - Movie object
   * @returns {Error} 404 - Movie not found
   */
  app.get("/movies/id/:movieID", async (req, res) => {
    try {
      const movieID = req.params.movieID;
      if (!mongoose.Types.ObjectId.isValid(movieID)) {
        return res.status(400).send("Invalid movie ID");
      }
      const movie = await Movie.findById(movieID);
      movie ? res.json(movie) : res.status(404).send("Movie not found");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /movies/{title}
   * @summary Returns a movie by its title.
   * @param {string} title.path - Movie title
   * @returns {Object} 200 - Movie object
   * @returns {Error} 404 - Movie not found
   */
  app.get("/movies/:title", async (req, res) => {
    try {
      const movie = await Movie.findOne({ Title: req.params.title });
      movie ? res.json(movie) : res.status(404).send("Movie not found");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /genres/{Name}
   * @summary Returns data about a specific genre by name.
   * @param {string} Name.path - Genre name
   * @returns {Object} 200 - Genre object
   * @returns {Error} 404 - Genre not found
   */
  app.get("/genres/:Name", async (req, res) => {
    try {
      const movie = await Movie.findOne({ "Genre.Name": req.params.Name });
      movie ? res.json(movie.Genre) : res.status(404).send("Genre not found");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /directors/{name}
   * @summary Returns data about a specific director by name.
   * @param {string} name.path - Director name
   * @returns {Object} 200 - Director object
   * @returns {Error} 404 - Director not found
   */
  app.get("/directors/:name", async (req, res) => {
    try {
      const movie = await Movie.findOne({ "Director.Name": req.params.name });
      movie
        ? res.json(movie.Director)
        : res.status(404).send("Director not found");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /movies
   * @summary Adds a new movie to the database.
   * @param {Object} request.body.required - Movie data
   * @returns {Object} 201 - Newly created movie
   * @returns {Error} 400 - Invalid movie data
   */
  app.post("/movies", async (req, res) => {
    try {
      const newMovie = await Movie.create(req.body);
      res.status(201).json(newMovie);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * POST /users
   * @summary Registers a new user.
   * @param {Object} request.body.required - User info
   * @param {string} request.body.username - Username
   * @param {string} request.body.password - Password
   * @param {string} request.body.email - Email
   * @param {string} request.body.birthday - Birthday
   * @returns {Object} 201 - Created user (without password)
   * @returns {Error} 422 - Validation error
   */
  app.post(
    "/users",
    [
      check("username").isAlphanumeric().isLength({ min: 5 }),
      check("email").isEmail(),
      check("birthday").notEmpty(),
      check("password")
        .exists()
        .custom((value) => {
          if (!value.trim().length) throw new Error("Password cannot be empty");
          return true;
        }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      try {
        const existingUser = await User.findOne({
          username: req.body.username,
        });
        if (existingUser)
          return res.status(400).send(`${req.body.username} already exists`);

        const hashedPassword = User.hashPassword(req.body.password);
        const newUser = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        });
        res.status(201).json({
          username: newUser.username,
          email: newUser.email,
          birthday: newUser.birthday,
        });
      } catch (err) {
        res.status(500).send("Error: " + err.message);
      }
    }
  );

  /**
   * GET /users
   * @summary Returns a list of all registered users.
   * @security JWT
   * @returns {Array<Object>} 200 - List of users
   */
  app.get(
    "/users",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      User.find()
        .then((users) => res.json(users))
        .catch((err) => res.status(500).send("Error: " + err));
    }
  );

  /**
   * GET /users/{username}
   * @summary Returns a user by username.
   * @param {string} username.path - The username
   * @security JWT
   * @returns {Object} 200 - User object
   * @returns {Error} 404 - User not found
   */
  app.get(
    "/users/:username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      User.findOne({ username: req.params.username })
        .then((user) =>
          user ? res.json(user) : res.status(404).send("User not found")
        )
        .catch((err) => res.status(500).send("Error: " + err));
    }
  );

  /**
   * PUT /users/{username}
   * @summary Updates a user's profile.
   * @param {string} username.path - Username to update
   * @param {Object} request.body - Updated user info
   * @security JWT
   * @returns {Object} 200 - Updated user object
   */
  app.put(
    "/users/:username",
    [
      check("username").isAlphanumeric().isLength({ min: 5 }),
      check("email").isEmail(),
    ],
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      if (req.user.username !== req.params.username)
        return res.status(400).send("Permission denied");

      try {
        const updateData = { ...req.body };
        if (updateData.password)
          updateData.password = await User.hashPassword(updateData.password);

        const updatedUser = await User.findOneAndUpdate(
          { username: req.params.username },
          { $set: updateData },
          { new: true }
        );

        updatedUser
          ? res.json(updatedUser)
          : res.status(404).send("User not found");
      } catch (err) {
        res.status(500).send("Error: " + err.message);
      }
    }
  );

  /**
   * POST /users/{username}/movies/{movieID}
   * @summary Adds a movie to the user's favorite movies.
   * @param {string} username.path - The username
   * @param {string} movieID.path - The movie ID
   * @security JWT
   * @returns {Object} 200 - Updated user with favorites
   */
  app.post(
    "/users/:username/movies/:movieID",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { username: req.params.username },
          { $addToSet: { favoriteMovies: req.params.movieID } },
          { new: true }
        );
        res.json(updatedUser);
      } catch (err) {
        res.status(500).send("Error: " + err.message);
      }
    }
  );

  /**
   * DELETE /users/{username}/movies/{movieID}
   * @summary Removes a movie from the user's favorite list.
   * @param {string} username.path - The username
   * @param {string} movieID.path - The movie ID
   * @returns {Object} 200 - Updated user without removed movie
   */
  app.delete("/users/:username/movies/:movieID", async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $pull: { favoriteMovies: req.params.movieID } },
        { new: true }
      );
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  });

  /**
   * DELETE /users/{username}
   * @summary Deletes a user account.
   * @param {string} username.path - Username to delete
   * @returns {Object} 200 - Confirmation message
   */
  app.delete("/users/:username", async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({
        username: req.params.username,
      });
      res.json({ message: "User deleted", user: deletedUser });
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
  });

  /**
   * Global error handler middleware.
   * Logs errors and returns a 500 status response.
   * @function
   * @param {Error} err - Error object
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });
}

const port = process.env.PORT || 8080;

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("Using DB:", mongoose.connection.name);
    initializeApp();
    app.listen(port, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
