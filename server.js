// Import the built-in 'http' module to create the server
const http = require('http');

// Import the built-in 'fs' (file system) module to read and write files
const fs = require('fs');

// Import the built-in 'url' module to parse the incoming request URL
const url = require('url');

// Import the built-in 'path' module to safely join file paths
const path = require('path');

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Parse the request URL to get details like pathname
  const parsedUrl = url.parse(req.url, true);

  // Check if the pathname includes the word "documentation"
  const isDocs = parsedUrl.pathname.includes('documentation');

  // Decide which HTML file to serve based on the URL
  const fileToServe = isDocs ? 'documentation.html' : 'index.html';

  // Create a log entry with timestamp and the requested URL
  const log = `${new Date().toISOString()} - ${req.url}\n`;

  // Append the log entry to 'log.txt' (creates file if it doesn't exist)
  fs.appendFile('log.txt', log, err => {
    if (err) console.error('Log error:', err); // Log error if writing fails
  });

  // Read the selected HTML file and send it to the user
  fs.readFile(path.join(__dirname, fileToServe), (err, data) => {
    if (err) {
      // If file not found or error reading, send 404 error
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 File Not Found');
    } else {
      // If file is found, send it with 200 OK status
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
});

// Start the server and listen on port 8080
server.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});





