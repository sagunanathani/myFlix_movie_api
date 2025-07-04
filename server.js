const http = require("http");
const fs = require("fs");
const url = require("url");

// Create the server
http
  .createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);

    // Set header to return HTML content
    response.writeHead(200, { "Content-Type": "text/html" });

    // Check if the URL contains the word "documentation"
    if (parsedUrl.pathname.includes("documentation")) {
      fs.createReadStream("./documentation.html").pipe(response);
    } else {
      fs.createReadStream("./index.html").pipe(response);
    }
  })
  .listen(8080); // Listen on port 8080

console.log("Server is running on http://localhost:8080/");
