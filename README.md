# movie_api

🎬 flix-fusion-api-movies — Portfolio Entry

🧾 Project Description & Reflection
The flix-fusion-api-movies Movie API powers the back end of a web application designed for vintage film lovers. It provides access to classic movie data, including information on directors, genres, and actors, while also enabling personalized user experiences through profile management and custom movie lists

Project Goals or Purpose
    - The goal of this project was to create a robust and scalable movie API tailored for vintage cinema lovers, allowing users to personalize their experience and explore lesser-known classics.

Testing Strategy
    - Used Postman for testing endpoints during development. Validated edge cases and input data integrity across movie and user routes.

🔍 Reflection Summary
- My Role: Full-stack developer focused on architecting and implementing the back-end.
- Tasks Tackled:
    - Designed RESTful endpoints for movie and user management.
    - Implemented JWT-based authentication with Passport.js.
    - Validated input and secured sensitive data using hashing and schemas.
- Key Decisions & Consequences:
    - Used MongoDB for flexible, scalable data storage.
    - Selected Heroku for rapid deployment and MongoDB Atlas for managed database hosting.
    - Implemented Joi schema validation to prevent malformed data, improving reliability.
- What I'd Do Differently:
    - Introduce role-based access control (RBAC) and logging for better security and monitoring.
    - Add unit and integration tests to improve test coverage.
- Lessons Learned:
    - Handling user authentication securely.
    - Designing maintainable, modular route structures.
    - Importance of thoughtful error handling and documentation for API usability.

🔗 Links
- [GitHub Repository](https://github.com/sagunanathani/movie_api)
- [Live App](https://flix-fusion-api-movies-51cd1c6d37f8.herokuapp.com/)

⚙️ Tech Stack
- Backend: Node.js, Express
- Database: MongoDB (with Mongoose ODM)
- Authentication: JWT, Passport.js
- Hosting: Heroku
- Cloud Database: MongoDB Atlas
- Validation: Joi
- Documentation & Testing: HTML, JavaScript

## 🔧 API Highlights

### 🎥 Movie-related Endpoints

| Endpoint                  | Method | Description                          |
|---------------------------|--------|--------------------------------------|
| `/movies`                 | GET    | Retrieve all vintage movies          |
| `/movies/:title`          | GET    | Retrieve movie details by title      |
| `/genres/:name`           | GET    | Retrieve details for a specific genre|
| `/directors/:name`        | GET    | Retrieve details for a director      |
| `/actors/:name`           | GET    | Retrieve details for an actor        |

### 👤 User-related Endpoints

| Endpoint                                      | Method  | Description                               |
|-----------------------------------------------|---------|-------------------------------------------|
| `/users`                                      | POST    | Register a new user                        |
| `/users/:username`                            | PUT     | Update user profile                        |
| `/users/:username`                            | DELETE  | Delete user account                        |
| `/users/:username/favorites/:movie`           | POST    | Add a movie to favorites                   |
| `/users/:username/favorites/:movie`           | DELETE  | Remove a movie from favorites              |
| `/users/:username/towatch/:movie`             | POST    | Add a movie to "To Watch" list             |
| `/users/:username/towatch/:movie`             | DELETE  | Remove a movie from "To Watch" list        |

🧩 Supporting Materials
- User Flows: Mapped typical user journey to guide feature planning.
- User Stories: Prioritized from the perspective of both new and returning users.
- Kanban Board: Used Trello to manage backlog, in-progress, and completed tasks.

📚 Bonus — Challenges Faced & Problem-Solving
- 🌐 Challenge: Unauthorized access to protected routes
✅ Solution: Integrated JWT tokens and implemented middleware to guard endpoints
- 📊 Challenge: Organizing database relationships for users and movies
✅ Solution: Used Mongoose population methods and separate schemas to maintain modularity
- 🔄 Challenge: Updating user favorites and watchlists
✅ Solution: Created dynamic routing and conditional logic for seamless updates and removals

### 🧠 Final Reflection
This project significantly strengthened my backend development skills and taught me how to balance functionality, security, and maintainability in an API-driven application.





