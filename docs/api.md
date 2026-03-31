# DevTrack API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require the header:

```
Authorization: Bearer <token>
```

---

## Auth

### Register

`POST /auth/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**201 Created**

```json
{
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" },
  "token": "eyJhbGciOi..."
}
```

### Login

`POST /auth/login`

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**200 OK** — same shape as register.

---

## Jobs

### List jobs

`GET /jobs?status=applied&sort=-createdAt&page=1&limit=10`

Query params (all optional):

| Param  | Description                                  |
|--------|----------------------------------------------|
| status | applied, interview, offer, rejected, accepted |
| sort   | any field, prefix with `-` for descending     |
| page   | page number (default 1)                       |
| limit  | results per page (default 10)                 |

**200 OK**

```json
{
  "jobs": [ ... ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

### Create job

`POST /jobs`

```json
{
  "company": "Atlassian",
  "position": "Graduate Software Engineer",
  "status": "applied",
  "location": "Brisbane, QLD",
  "salary": 85000,
  "notes": "Referred by mentor"
}
```

### Get / Update / Delete

- `GET /jobs/:id`
- `PATCH /jobs/:id` — send only the fields to change
- `DELETE /jobs/:id`

All return 404 if the job doesn't exist or belongs to another user.

---

## Errors

All errors follow this shape:

```json
{ "error": "Description of what went wrong" }
```

| Code | Meaning                  |
|------|--------------------------|
| 400  | Validation / bad input   |
| 401  | Missing or invalid token |
| 404  | Resource not found       |
| 409  | Duplicate resource       |
| 429  | Rate limit exceeded      |
| 500  | Server error             |
