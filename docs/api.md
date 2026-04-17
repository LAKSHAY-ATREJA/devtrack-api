DevTrack API Reference

Base URL: http://localhost:5000/api

All authenticated endpoints require the header:

    Authorization: Bearer <token>

---

Auth

POST /auth/register

Register a new user account.

Request body:
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "password123"
    }

Response 201:
    {
      "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" },
      "token": "eyJhbGciOi..."
    }

Response 400: missing or invalid fields
Response 409: email already registered


POST /auth/login

Log in and receive a JWT token.

Request body:
    {
      "email": "jane@example.com",
      "password": "password123"
    }

Response 200: same shape as register
Response 400: missing or invalid fields
Response 401: wrong credentials


GET /auth/me

Get the profile of the currently authenticated user.

Requires authentication.

Response 200:
    {
      "user": {
        "id": "...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2024-01-15T08:00:00.000Z"
      }
    }

---

Jobs

All job endpoints require authentication. Each user can only access their own jobs.


GET /jobs

List all jobs for the authenticated user with optional filtering, sorting, and pagination.

Query parameters:
    status    One of: applied, interview, offer, rejected, accepted
    sort      Field to sort by; prefix with - for descending. Default: -createdAt
    page      Page number. Default: 1
    limit     Results per page. Default: 10, max: 100

Response 200:
    {
      "jobs": [
        {
          "_id": "...",
          "company": "Atlassian",
          "position": "Graduate Software Engineer",
          "status": "applied",
          "location": "Brisbane, QLD",
          "salary": 110000,
          "notes": "Referred by mentor",
          "appliedDate": "2024-01-15T00:00:00.000Z",
          "createdBy": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ],
      "total": 25,
      "page": 1,
      "pages": 3
    }


GET /jobs/stats

Return counts of jobs grouped by status for the authenticated user.

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


POST /jobs

Create a new job application.

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

Required: company, position
Optional: status, location, salary, notes, appliedDate

Response 201:
    { "job": { ... } }


GET /jobs/:id

Get a single job by its ID. Returns 404 if the job belongs to another user.

Response 200:
    { "job": { ... } }

Response 400: invalid ID format
Response 404: not found


PATCH /jobs/:id

Update one or more fields of a job. Send only the fields you want to change.

Request body example:
    {
      "status": "interview",
      "notes": "Phone screen on Friday at 2pm"
    }

Response 200:
    { "job": { ... } }

Response 400: validation error
Response 404: not found


DELETE /jobs/:id

Delete a job permanently.

Response 200:
    { "message": "Job deleted" }

Response 404: not found

---

Errors

All error responses use this shape:

    { "error": "Description of what went wrong" }

Status code reference:
    400  Validation error or bad input (missing field, invalid format)
    401  Missing, invalid, or expired token
    404  Resource not found or belongs to another user
    409  Duplicate resource (email already in use)
    429  Too many requests — rate limit exceeded
    500  Internal server error
