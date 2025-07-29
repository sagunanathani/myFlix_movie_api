// Import the Express module and assign it to a constant called 'express'
// This allows us to use Express functions and features
// Require express and other needed modules

// Load environment variables from .env
require("dotenv").config();

// Import dependencies
const express = require("express"); // Express framework
const mongoose = require("mongoose"); // MongoDB ORM
const morgan = require("morgan"); //Step 6: Require Morgan middleware - Logs HTTP requests (for debugging and analytics)
const cors = require("cors"); // Cross-origin handling
const bcrypt = require("bcrypt"); // Password hashing
const { check, validationResult } = require("express-validator"); // Input validation
const path = require("path");

// Import models
const { Movie, User } = require("./models");

// Initialize the Express app
const app = express();

// Swagger setup
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function initializeApp() {
  // Middleware
  app.use(morgan("common"));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());

  // CORS
  const allowedOrigins = ["http://localhost:8080", "http://testsite.com"];
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

  // Authentication
  require("./auth")(app); // Auth setup
  // Passport setup (important to do *after* auth import)
  const passport = require("passport");
  require("./passport"); // Passport strategies

  // Route: Default home message
  /* app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
  }); */

// Route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

  app.get("/", (req, res) => {
    res.send(`
    <html>
      <head><title>Movie API</title></head>
      <body>
        <h1>Welcome to the Movie API!</h1>
        <ul>
          <li>📄<a href="/public/documentation.html">HTML Documentation (Local)</a></li>
          <li>🔧<a href="http://127.0.0.1:8080/api-docs/">Swagger Docs (Local)</a></li>
          <li>🌐<a href="https://flix-fusion-api-movies-51cd1c6d37f8.herokuapp.com/documentation.html" target="_blank" 
              rel="noopener"
>HTML Documentation (Deployed)</a></li>
          <li>🚀<a href="https://flix-fusion-api-movies-51cd1c6d37f8.herokuapp.com/api-docs/" target="_blank" 
              rel="noopener"
>Swagger Docs (Deployed)</a></li>
        </ul>
      </body>
    </html>
  `);
  });

  // Example route using the Movie model
  // Get all movies
  app.get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      console.log("Route was triggered"); // Confirmed route is called
      try {
        const movies = await Movie.find();
        console.log("Fetched movies:", movies); //Confirmed data retrieval
        res.json(movies);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  // Endpoint: Return movie data by title
  app.get("/movies/:title", async (req, res) => {
    try {
      const movie = await Movie.findOne({ Title: req.params.title });
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Route: Get genre info by name
  app.get("/genres/:Name", async (req, res) => {
    try {
      const movie = await Movie.findOne({ "Genre.Name": req.params.Name });
      if (movie) {
        res.json(movie.Genre);
      } else {
        res.status(404).send("Genre not found");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Route: Get director info by name
  app.get("/directors/:name", async (req, res) => {
    try {
      const movie = await Movie.findOne({ "Director.Name": req.params.name });
      if (movie) {
        res.json(movie.Director);
      } else {
        res.status(404).send("Director not found");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Route: Add a new movie to the database
  app.post("/movies", async (req, res) => {
    console.log("POST /movies route triggered");
    try {
      const newMovie = await Movie.create(req.body);
      res.status(201).json(newMovie);
    } catch (err) {
      console.error("Error creating movie:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // Route: Register a new user
  app.post(
    "/users",
    [
      check(
        "username",
        "Username contains non-alphanumeric characters - not allowed."
      )
        .isAlphanumeric()
        .isLength({ min: 5 }),
      check("email").isEmail().withMessage("Email must be valid"),
      check("birthday").notEmpty().withMessage("Birthday is required"),
      check("password")
        .exists()
        .withMessage("Password is required")
        .custom((value) => {
          if (!value || value.trim().length === 0) {
            throw new Error("Password cannot be empty or just spaces");
          }
          return true;
        }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      //Error handling with validationResult()
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      try {
        // Check if username already exists
        const existingUser = await User.findOne({
          username: req.body.username,
        });
        if (existingUser) {
          return res.status(400).send(`${req.body.username} already exists`);
        }
        // Hash the password before saving
        const hashedPassword = User.hashPassword(req.body.password);

        // Create new user
        const newUser = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        });
        console.log("✅ User created:", newUser);
        // Only return selected fields (not the password)
        //const { username, email, birthday } = newUser;
        res.status(201).json({
          username: newUser.username,
          email: newUser.email,
          birthday: newUser.birthday,
        });
      } catch (err) {
        console.error("Crash in /users:", err);
        res.status(500).send("Error: " + err.message);
      }
    }
  );

  // Route: Update a user's info
  app.put(
    "/users/:username",
    [
      check("username", "Username is required").isLength({ min: 5 }),
      check(
        "username",
        "Username contains non-alphanumeric characters - not allowed."
      ).isAlphanumeric(),
      check("password", "Password is required").not().isEmpty(),
      check("email", "Email does not appear to be valid").isEmail(),
    ],
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      // Use lowercase 'username' consistently - conditions to check
      if (req.user.username !== req.params.username) {
        return res.status(400).send("Permission denied");
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { username: req.params.username },
          { $set: req.body },
          { new: true } //This line makes sure that the updated document is returned
        );
        // Check if user was not found
        if (!updatedUser) {
          return res.status(404).send("User not found");
        }
        // If found, send updated user data
        res.json(updatedUser);
      } catch (err) {
        res.status(500).send("Error: " + err.message);
      }
    }
  );

  // Route: Add movie to user's favorites
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

  // Route: Remove movie from user's favorites
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

  // Route: Delete user account
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

  // Middleware: Global error handler
  // Middleware: Error-handling (logs all errors to terminal)
  app.use((err, req, res, next) => {
    console.error(err.stack); // Log the full error stack trace
    res.status(500).send("Something went wrong!");
  });
}

const port = process.env.PORT || 8080;

// 📦 Connect to MongoDB first
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("Using DB:", mongoose.connection.name);

    // ✅ Initialize the app AFTER DB is connected
    initializeApp();

    // ✅ Start the server now that DB is ready
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
