# DevTrack API

A production-ready REST API for tracking job applications, built with Node.js, Express, and MongoDB. Includes JWT authentication, full CRUD operations, filtering and pagination, security hardening, unit and integration tests, Docker support, and a GitHub Actions CI/CD pipeline.

## Features

- JWT-based authentication (register and login)
- Full CRUD for job applications with status tracking (applied, interview, offer, rejected, accepted)
- Filtering and pagination on job listings
- Security hardening via Helmet, CORS, and rate limiting (100 req / 15 min per IP)
- Input validation with express-validator
- Unit and integration tests with Jest, Supertest, and mongodb-memory-server (no real database needed to run tests)
- Docker and docker-compose for local and production deployment
- GitHub Actions CI/CD pipeline
- Detailed API documentation in docs/api.md

## Tech stack

| Layer    | Technology             |
|----------|------------------------|
| Runtime  | Node.js 18+            |
| Framework| Express 4              |
| Database | MongoDB + Mongoose     |
| Auth     | JWT + bcrypt           |
| Testing  | Jest, Supertest        |
| DevOps   | Docker, GitHub Actions |

## Prerequisites

- Node.js 18 or later
- MongoDB (local installation or MongoDB Atlas) — or use Docker to skip this

## Local setup

```bash
git clone https://github.com/LAKSHAY-ATREJA/devtrack-api.git
cd devtrack-api

npm install

cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev
```

The API will be available at http://localhost:5000.

## Docker setup

```bash
docker-compose up --build
```

This starts both the API server and a MongoDB instance. No local MongoDB installation required.

## Environment variables

See `.env.example` for all required variables.

| Variable       | Description                              |
|----------------|------------------------------------------|
| MONGO_URI      | MongoDB connection string                |
| JWT_SECRET     | Secret key for signing JWTs             |
| JWT_EXPIRES_IN | Token expiry (default: 7d)               |
| PORT           | Server port (default: 5000)              |
| NODE_ENV       | Environment (development/production/test)|

## API endpoints

| Method | Endpoint           | Description        | Auth required |
|--------|--------------------|--------------------|---------------|
| POST   | /api/auth/register | Register new user  | No            |
| POST   | /api/auth/login    | Login, returns JWT | No            |
| GET    | /api/jobs          | List all jobs      | Yes           |
| POST   | /api/jobs          | Create a job entry | Yes           |
| GET    | /api/jobs/:id      | Get single job     | Yes           |
| PATCH  | /api/jobs/:id      | Update a job       | Yes           |
| DELETE | /api/jobs/:id      | Delete a job       | Yes           |
| GET    | /health            | Health check       | No            |

Authenticated requests require the header: `Authorization: Bearer <token>`

Full request and response examples are in [docs/api.md](docs/api.md).

## Testing

Tests use an in-memory MongoDB instance so no database setup is required.

```bash
npm test              # run all tests
npm run test:cov      # with coverage report
```

## Project structure

```
src/
    config/       database connection
    controllers/  request handlers (auth, jobs)
    middleware/   JWT auth, error handler
    models/       Mongoose schemas (User, Job)
    routes/       route definitions
    utils/        logger
tests/
    auth.test.js  authentication endpoint tests
    jobs.test.js  job CRUD endpoint tests
    setup.js      shared test setup (in-memory DB)
docs/
    api.md        full API reference with examples
```

## License

MIT. See LICENSE. Built by Lakshay Atreja.
