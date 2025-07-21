// Import the Express module and assign it to a constant called 'express'
// This allows us to use Express functions and features
// Require express and other needed modules
const express = require("express");
const morgan = require("morgan"); // Step 6: Require Morgan middleware

// Import Mongoose and models to connect REST API with MongoDB
const mongoose = require("mongoose");
const { Movie, User } = require("./models"); // 👈 Import models

// movieappDB
// Connect to MongoDB database
mongoose.connect("mongodb://localhost:27017/movieAppDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB successfully");
  console.log("Using DB:", mongoose.connection.name); 
});

const app = express();

// Middleware: Log all requests using Morgan
app.use(morgan("common")); // also use 'dev', 'tiny', etc.

// Middleware: Serve static files from the "public" folder
app.use(express.static("public"));

// This allows access to req.body for POST and PUT methods
// Middleware to parse incoming JSON requests
app.use(express.json());

// Route: Default home message
app.get("/", (req, res) => {
  res.send("Welcome to the Movie API!");
});

// Example route using the Movie model
// Get all movies
app.get("/movies", async (req, res) => {
  console.log("Route was triggered"); // Confirmed route is called
  try {
    const movies = await Movie.find();
    console.log("Fetched movies:", movies); //Confirmed data retrieval
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
app.post("/users", async (req, res) => {
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).send(`${req.body.username} already exists`);
    }

    // Create new user
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday,
    });

    // Only return selected fields (not the password)
    const { username, email, birthday } = newUser;
    res.status(201).json({ username, email, birthday });

  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Route: Update a user's info
app.put("/users/:username", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Route: Add movie to user's favorites
app.post("/users/:username/movies/:movieID", async (req, res) => {
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
});

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

// Start the server and listen on port 8080
const PORT = 8080; // Define the port server will listen on
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
