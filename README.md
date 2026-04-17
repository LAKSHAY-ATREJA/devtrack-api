DevTrack API

A REST API for tracking job applications, built with Node.js, Express, and MongoDB. It handles user registration and JWT-based authentication, and gives each user a private CRUD interface for managing their own job applications. The project includes input validation, security hardening, pagination, filtering, an aggregation stats endpoint, full test coverage using an in-memory database, Docker support, and a demo script that exercises every endpoint.

---

Features

- User registration and login with bcrypt password hashing and JWT tokens
- Full CRUD for job applications: create, read, update, delete
- Status workflow: applied, interview, offer, rejected, accepted
- Filtering by status and sorting on any field, with page-based pagination
- Aggregated stats endpoint: counts per status and total
- Input validation on all write endpoints via express-validator
- Security hardening: Helmet headers, CORS, and rate limiting (100 req / 15 min per IP)
- Central error handler for validation errors, duplicate keys, invalid IDs, and JWT failures
- Tests with Jest, Supertest, and mongodb-memory-server (no real database required to run tests)
- Docker and docker-compose with a healthcheck-gated startup sequence
- Health check endpoint at /health

---

Tech Stack

Runtime:    Node.js 18+
Framework:  Express 4
Database:   MongoDB 7 + Mongoose 8
Auth:       jsonwebtoken + bcryptjs
Validation: express-validator
Testing:    Jest, Supertest, mongodb-memory-server
DevOps:     Docker, docker-compose

---

Prerequisites

To run locally without Docker:
- Node.js 18 or later
- MongoDB running locally or a MongoDB Atlas connection string

To run with Docker:
- Docker and docker-compose (no separate MongoDB installation required)

---

Local Setup

Clone the repository and install dependencies:

    git clone https://github.com/LAKSHAY-ATREJA/devtrack-api.git
    cd devtrack-api
    npm install

Copy the example environment file and fill in your values:

    cp .env.example .env

Edit .env and set at minimum MONGO_URI and JWT_SECRET. See the Environment Variables section for details.

Start the development server (auto-restarts on file changes):

    npm run dev

The API will be available at http://localhost:5000.

To start in production mode:

    npm start

---

Docker Setup

Build and start both the API and a MongoDB container:

    docker-compose up --build

The API is available at http://localhost:5000. MongoDB data is persisted in a named Docker volume. The API container will not start until the MongoDB healthcheck passes.

To pass a custom JWT secret:

    JWT_SECRET=your_secret docker-compose up --build

To stop and remove containers:

    docker-compose down

To also remove the database volume:

    docker-compose down -v

---

Environment Variables

Copy .env.example to .env and set the following:

    MONGO_URI
        MongoDB connection string.
        Local example:  mongodb://localhost:27017/devtrack
        Atlas example:  mongodb+srv://<user>:<password>@cluster.mongodb.net/devtrack
        Default:        mongodb://localhost:27017/devtrack

    JWT_SECRET
        Secret key used to sign JWT tokens. Use a long random string in production.
        Generate one: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
        Required.

    JWT_EXPIRES_IN
        How long issued tokens remain valid. Accepts any value understood by jsonwebtoken
        (e.g. 7d, 24h, 3600).
        Default: 7d

    PORT
        Port the HTTP server listens on.
        Default: 5000

    NODE_ENV
        Set to development, production, or test.
        Default: development

---

Running Tests

Tests use mongodb-memory-server to spin up an in-memory MongoDB instance, so no real database is needed.

Run all tests:

    npm test

Run with coverage report:

    npm run test:cov

The test suite covers:
- User registration (valid, duplicate email, short password, invalid email, missing name)
- Login (valid, wrong password, missing fields)
- Profile endpoint (authenticated, unauthenticated)
- Job CRUD (create, list with pagination, filter by status, get by ID, update, delete)
- Ownership isolation (user A cannot access user B's jobs)
- Validation errors (missing required fields, invalid status, invalid ID format)
- Stats aggregation (empty state, counts after creating jobs)

---

Demo Script

A shell script is included that registers a user, creates several jobs, exercises the list, filter, get, update, stats, and delete endpoints, then prints the final state. It requires the server to be running and depends on curl and jq.

Start the server, then in a second terminal:

    bash demo.sh

---

API Reference

Base URL: http://localhost:5000

All endpoints that require authentication expect the header:

    Authorization: Bearer <token>

Error responses always use this shape:

    { "error": "Description of what went wrong" }

Error codes:
    400  Validation error or bad input
    401  Missing or invalid token
    404  Resource not found
    409  Duplicate resource (e.g. email already registered)
    429  Rate limit exceeded
    500  Internal server error


Health Check

GET /health

No authentication required.

Response 200:
    {
      "status": "ok",
      "uptime": 42.3,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }


Register

POST /api/auth/register

Request body:
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "password123"
    }

Validation:
- name: required, non-empty string
- email: required, valid email format
- password: required, minimum 8 characters

Response 201:
    {
      "user": {
        "id": "664f1a2b3c4d5e6f7a8b9c0d",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }

Response 400: validation error
Response 409: email already registered


Login

POST /api/auth/login

Request body:
    {
      "email": "jane@example.com",
      "password": "password123"
    }

Response 200: same shape as register
Response 400: missing or invalid fields
Response 401: wrong credentials


Get Current User

GET /api/auth/me

Requires authentication.

Response 200:
    {
      "user": {
        "id": "664f1a2b3c4d5e6f7a8b9c0d",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2024-01-15T08:00:00.000Z"
      }
    }


List Jobs

GET /api/jobs

Requires authentication. Returns only jobs belonging to the authenticated user.

Query parameters (all optional):
    status   Filter by status. One of: applied, interview, offer, rejected, accepted
    sort     Sort field. Prefix with - for descending. Default: -createdAt
             Allowed values: createdAt, updatedAt, company, position, status,
                             appliedDate, salary (any prefixed with -)
    page     Page number. Default: 1
    limit    Results per page. Default: 10, max: 100

Response 200:
    {
      "jobs": [ ... ],
      "total": 25,
      "page": 1,
      "pages": 3
    }

Response 400: invalid status value


Get Job Stats

GET /api/jobs/stats

Requires authentication. Returns counts per status for the current user's jobs.

Response 200:
    {
      "stats": {
        "applied": 10,
        "interview": 5,
        "offer": 2,
        "rejected": 3,
        "accepted": 1
      },
      "total": 21
    }


Create Job

POST /api/jobs

Requires authentication.

Request body:
    {
      "company": "Atlassian",
      "position": "Graduate Software Engineer",
      "status": "applied",
      "location": "Brisbane, QLD",
      "salary": 110000,
      "notes": "Referred by mentor",
      "appliedDate": "2024-01-15"
    }

Required fields: company, position
Optional fields: status (default: applied), location (default: Remote),
                 salary, notes, appliedDate (default: now)

Validation:
- company, position: max 100 characters
- status: must be one of the five valid values
- salary: non-negative number
- notes: max 1000 characters
- appliedDate: valid ISO 8601 date

Response 201:
    {
      "job": {
        "_id": "664f1a2b3c4d5e6f7a8b9c0e",
        "company": "Atlassian",
        "position": "Graduate Software Engineer",
        "status": "applied",
        "location": "Brisbane, QLD",
        "salary": 110000,
        "notes": "Referred by mentor",
        "appliedDate": "2024-01-15T00:00:00.000Z",
        "createdBy": "664f1a2b3c4d5e6f7a8b9c0d",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    }


Get Job

GET /api/jobs/:id

Requires authentication. Returns 404 if the job does not exist or belongs to another user.

Response 200:
    { "job": { ... } }

Response 400: invalid ID format
Response 404: job not found


Update Job

PATCH /api/jobs/:id

Requires authentication. Send only the fields you want to change. Returns 404 if the job does not exist or belongs to another user.

Request body (all fields optional):
    {
      "status": "interview",
      "notes": "Phone screen scheduled for Friday"
    }

Response 200:
    { "job": { ... } }

Response 400: validation error or invalid ID format
Response 404: job not found


Delete Job

DELETE /api/jobs/:id

Requires authentication. Returns 404 if the job does not exist or belongs to another user.

Response 200:
    { "message": "Job deleted" }

Response 404: job not found

---

Project Structure

    devtrack-api/
    |-- src/
    |   |-- app.js              Express application setup and middleware
    |   |-- index.js            Entry point: connects to MongoDB and starts server
    |   |-- config/
    |   |   `-- db.js           Mongoose connection with error event handlers
    |   |-- controllers/
    |   |   |-- auth.controller.js   register, login, getMe
    |   |   `-- jobs.controller.js   getJobs, getJob, createJob, updateJob, deleteJob, getStats
    |   |-- middleware/
    |   |   |-- auth.middleware.js   JWT authentication middleware
    |   |   `-- errorHandler.js      Central error handler
    |   |-- models/
    |   |   |-- user.model.js        User schema (name, email, hashed password)
    |   |   `-- job.model.js         Job schema (company, position, status, ...)
    |   |-- routes/
    |   |   |-- auth.routes.js       POST /register, POST /login, GET /me
    |   |   `-- jobs.routes.js       CRUD routes + GET /stats
    |   `-- utils/
    |       `-- logger.js            Simple timestamped console logger
    |-- tests/
    |   |-- auth.test.js        Authentication endpoint tests
    |   |-- jobs.test.js        Job CRUD and stats endpoint tests
    |   `-- setup.js            Shared test setup (in-memory MongoDB)
    |-- docs/
    |   `-- api.md              Supplementary API reference
    |-- demo.sh                 Interactive demo using curl
    |-- Dockerfile              Production image (node:18-alpine, non-root user)
    |-- docker-compose.yml      API + MongoDB with healthcheck dependency
    |-- jest.config.js          Jest configuration
    |-- .env.example            Template for required environment variables
    `-- package.json

---

Deployment

The application can be deployed to any platform that can run a Node.js process or a Docker container.

Environment requirements:
- Node.js 18 or later (or use the provided Docker image)
- A MongoDB instance (self-hosted or MongoDB Atlas)
- The environment variables listed above, with a strong JWT_SECRET

Using Docker on a server:

Copy docker-compose.yml and .env.example to the server. Create a .env file with production values. Then run:

    docker-compose up -d

Using a managed platform (Render, Railway, Fly.io):

1. Connect the repository to the platform.
2. Set environment variables in the platform dashboard: MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV=production.
3. Set the start command to: node src/index.js
4. The platform will build and deploy automatically.

The /health endpoint can be used as the health check URL for load balancers and deployment platforms.

---

License

MIT. See LICENSE.

Built by Lakshay Atreja.
