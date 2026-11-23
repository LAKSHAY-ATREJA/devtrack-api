# ADR 0001: Idempotent job creation

## Status

Accepted — 23 November 2026.

## Context

Clients can retry `POST /api/jobs` after a timeout without knowing whether the
first request committed. A naive retry can create duplicate applications. The
same failure occurs when a UI submits twice or two workers process one command.

## Decision

`POST /api/jobs` accepts an optional `Idempotency-Key` header. The API stores the
key and a SHA-256 hash of a canonical JSON request beside the created job. A
partial compound unique index on `(createdBy, idempotencyKey)` is the concurrency
boundary, so keys are isolated per authenticated user and requests racing across
processes cannot both commit.

An identical replay returns the original job with HTTP 200 and
`Idempotency-Replayed: true`. Reusing the key for a different payload returns
HTTP 409. The key and hash are excluded from API representations.

## Trade-offs

- The implementation avoids a separate idempotency collection and transaction;
  the created resource itself is the durable replay record.
- Keys live as long as jobs. Deleting a job permits its key to be reused. A
  future API requiring permanent command history should use a TTL-controlled
  idempotency ledger instead.
- Canonicalization removes object-key ordering differences but deliberately does
  not treat semantically equivalent values such as `100` and `"100"` as equal.
- Requests without the header retain the existing at-least-once behavior.
