# DevTrack API 🚀

A production-ready REST API for tracking job applications — built with Node.js, Express, and MongoDB. Features JWT authentication, full test coverage, Docker support, and CI/CD via GitHub Actions.

![CI](https://github.com/YOUR_USERNAME/devtrack-api/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)

## ✨ Features

- 🔐 JWT-based authentication (register / login)
- 📋 Full CRUD for job applications (create, read, update, delete)
- 🔍 Filtering, sorting & pagination on job listings
- 🛡️ Security hardening — helmet, rate limiting, input validation
- 🧪 Unit & integration tests with Jest + Supertest
- 🐳 Dockerized with docker-compose
- ⚙️ CI/CD pipeline with GitHub Actions
- 📖 API documentation in [docs/api.md](docs/api.md)

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Runtime     | Node.js 18+             |
| Framework   | Express 4               |
| Database    | MongoDB + Mongoose      |
| Auth        | JWT + bcrypt            |
| Testing     | Jest, Supertest         |
| DevOps      | Docker, GitHub Actions  |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas) — or just use Docker

### Local setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/devtrack-api.git
cd devtrack-api

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# edit .env with your values

# 4. Run in dev mode
npm run dev
```

### Run with Docker

```bash
docker-compose up --build
```

API will be available at `http://localhost:5000`.

## 📡 API Endpoints

| Method | Endpoint             | Description           | Auth |
|--------|----------------------|-----------------------|------|
| POST   | /api/auth/register   | Register new user     | ❌   |
| POST   | /api/auth/login      | Login, returns JWT    | ❌   |
| GET    | /api/jobs            | List all jobs         | ✅   |
| POST   | /api/jobs            | Create a job entry    | ✅   |
| GET    | /api/jobs/:id        | Get single job        | ✅   |
| PATCH  | /api/jobs/:id        | Update a job          | ✅   |
| DELETE | /api/jobs/:id        | Delete a job          | ✅   |

See [docs/api.md](docs/api.md) for request/response examples.

## 🧪 Testing

```bash
npm test            # run all tests
npm run test:cov    # with coverage report
```

## 📁 Project Structure

```
src/
├── config/        # database connection
├── routes/        # route definitions
├── controllers/   # request handlers
├── models/        # mongoose schemas
├── middleware/    # auth, error handling
└── utils/         # logger, helpers
```

## 📄 License

MIT — see [LICENSE](LICENSE)

---

Built by **YOUR NAME** · Final Year Software Engineering · [LinkedIn](https://linkedin.com/in/YOUR_PROFILE)
