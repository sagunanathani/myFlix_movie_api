// Import the Express module and assign it to a constant called 'express'
// This allows us to use Express functions and features
// Require express and other needed modules
const express = require('express');
const morgan = require('morgan'); // Step 6: Require Morgan middleware
const app = express();

// Middleware: Log all requests using Morgan
app.use(morgan('common')); // also use 'dev', 'tiny', etc.

// Middleware: Serve static files from the "public" folder
app.use(express.static('public'));

// This allows access to req.body for POST and PUT methods
// Middleware to parse incoming JSON requests
app.use(express.json()); 

/* // Data: top 10 movies 
const topMovies = [
  { title: 'The Shawshank Redemption', director: 'Frank Darabont' },
  { title: 'The Godfather', director: 'Francis Ford Coppola' },
  { title: 'The Dark Knight', director: 'Christopher Nolan' },
  { title: 'Pulp Fiction', director: 'Quentin Tarantino' },
  { title: 'The Lord of the Rings', director: 'Peter Jackson' },
  { title: 'Forrest Gump', director: 'Robert Zemeckis' },
  { title: 'Inception', director: 'Christopher Nolan' },
  { title: 'Fight Club', director: 'David Fincher' },
  { title: 'The Matrix', director: 'The Wachowskis' },
  { title: 'Goodfellas', director: 'Martin Scorsese' }
]; */

// In-memory movies array with sample data
const movies = [
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years...',
    genre: 'Drama',
    director: 'Frank Darabont',
    imageURL: 'https://example.com/shawshank.jpg'
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty...',
    genre: 'Crime',
    director: 'Francis Ford Coppola',
    imageURL: 'https://example.com/godfather.jpg'
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology...',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    imageURL: 'https://example.com/inception.jpg'
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster\'s wife...',
    genre: 'Crime',
    director: 'Quentin Tarantino',
    imageURL: 'https://example.com/pulpfiction.jpg'
  },
  {
    title: 'The Dark Knight',
    description: 'Batman must accept one of the greatest psychological and physical tests...',
    genre: 'Action',
    director: 'Christopher Nolan',
    imageURL: 'https://example.com/darkknight.jpg'
  }
];

// Endpoint: Return list of ALL movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// Endpoint: Return movie data by title
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// Route: Default home message
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Endpoint: Return list of ALL movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// Endpoint: Return movie data by title
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

/* // Route: Get all movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Route: Get a movie by title
app.get('/movies/:title', (req, res) => {
  res.send(`GET movie by title: ${req.params.title}`);
}); */

// Route: Get genre info by name
app.get('/genres/:name', (req, res) => {
  res.send(`GET genre by name: ${req.params.name}`);
});

// Route: Get director info by name
app.get('/directors/:name', (req, res) => {
  res.send(`GET director by name: ${req.params.name}`);
});

// Route: Register a new user
app.post('/users', (req, res) => {
  res.send('POST register user');
});

// Route: Update a user's info
app.put('/users/:username', (req, res) => {
  res.send(`PUT update user: ${req.params.username}`);
});

// Route: Add movie to user's favorites
app.post('/users/:username/movies/:movieID', (req, res) => {
  res.send(`POST add movie ${req.params.movieID} to user ${req.params.username}`);
});

// Route: Remove movie from user's favorites
app.delete('/users/:username/movies/:movieID', (req, res) => {
  res.send(`DELETE remove movie ${req.params.movieID} from user ${req.params.username}`);
});

// Route: Delete user account
app.delete('/users/:username', (req, res) => {
  res.send(`DELETE user ${req.params.username}`);
});

// Middleware: Global error handler
// Middleware: Error-handling (logs all errors to terminal)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack trace
  res.status(500).send('Something went wrong!');
});

// Start the server and listen on port 8080
const PORT = 8080; // Define the port server will listen on
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


