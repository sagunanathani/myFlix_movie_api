// Import the Express module and assign it to a constant called 'express'
// This allows us to use Express functions and features
// Require express and other needed modules
const express = require('express');
const morgan = require('morgan'); // Step 6: Require Morgan middleware
const app = express();

const PORT = 8080; // Define the port server will listen on

// Middleware: Log all requests using Morgan
app.use(morgan('common')); // also use 'dev', 'tiny', etc.

// Middleware: Serve static files from the "public" folder
app.use(express.static('public'));

// Data: top 10 movies 
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
];

// Route: Default home message
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Route: Return list of top movie
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Middleware: Error-handling (logs all errors to terminal)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack trace
  res.status(500).send('Something went wrong!');
});

// Start the server and listen on port 8080
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

