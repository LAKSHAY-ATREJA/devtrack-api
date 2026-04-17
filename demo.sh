#!/usr/bin/env bash
# DevTrack API demo script
# Prerequisites: the API must be running on http://localhost:5000
# Start with: npm run dev   (requires MongoDB)
#         or: docker-compose up --build

set -euo pipefail

BASE="http://localhost:5000"
BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'

step() {
  echo ""
  echo -e "${BOLD}${CYAN}==> $1${RESET}"
}

ok() {
  echo -e "${GREEN}$1${RESET}"
}

command -v curl  >/dev/null 2>&1 || { echo "curl is required but not installed."; exit 1; }
command -v jq    >/dev/null 2>&1 || { echo "jq is required but not installed."; exit 1; }

# Wait for server
step "Checking server health"
for i in $(seq 1 10); do
  if curl -sf "$BASE/health" > /dev/null; then
    ok "Server is up"
    break
  fi
  echo "Waiting for server... ($i/10)"
  sleep 2
  if [ "$i" -eq 10 ]; then
    echo "Server did not start in time. Is it running?"
    exit 1
  fi
done

# Register
step "Registering a new user"
REGISTER=$(curl -sf -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"demo1234"}')
echo "$REGISTER" | jq .
TOKEN=$(echo "$REGISTER" | jq -r '.token')
ok "Registered. Token acquired."

# Login
step "Logging in"
LOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo1234"}')
echo "$LOGIN" | jq .
ok "Login successful."

# Get current user profile
step "Fetching current user profile (GET /api/auth/me)"
curl -sf "$BASE/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Create job 1
step "Creating job application #1 — Google SWE"
JOB1=$(curl -sf -X POST "$BASE/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company":"Google","position":"Software Engineer II","status":"applied","location":"Mountain View, CA","salary":180000,"notes":"Applied via referral from college friend"}')
echo "$JOB1" | jq .
JOB1_ID=$(echo "$JOB1" | jq -r '.job._id')
ok "Job 1 created: $JOB1_ID"

# Create job 2
step "Creating job application #2 — Stripe Backend Engineer"
JOB2=$(curl -sf -X POST "$BASE/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company":"Stripe","position":"Backend Engineer","status":"interview","location":"Remote","salary":165000}')
echo "$JOB2" | jq .
JOB2_ID=$(echo "$JOB2" | jq -r '.job._id')
ok "Job 2 created: $JOB2_ID"

# Create job 3
step "Creating job application #3 — Atlassian"
JOB3=$(curl -sf -X POST "$BASE/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company":"Atlassian","position":"Graduate Software Engineer","status":"offer","location":"Sydney, NSW","salary":110000}')
echo "$JOB3" | jq .
ok "Job 3 created."

# List all jobs
step "Listing all jobs (GET /api/jobs)"
curl -sf "$BASE/api/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Filter by status
step "Filtering jobs by status=interview"
curl -sf "$BASE/api/jobs?status=interview" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Get a single job
step "Getting single job (GET /api/jobs/:id)"
curl -sf "$BASE/api/jobs/$JOB1_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Update a job
step "Updating job #1 status to 'interview' (PATCH /api/jobs/:id)"
curl -sf -X PATCH "$BASE/api/jobs/$JOB1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"interview","notes":"Phone screen scheduled for next week"}' | jq .
ok "Job status updated."

# Stats
step "Getting application stats (GET /api/jobs/stats)"
curl -sf "$BASE/api/jobs/stats" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Delete a job
step "Deleting job #2 (DELETE /api/jobs/:id)"
curl -sf -X DELETE "$BASE/api/jobs/$JOB2_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
ok "Job deleted."

# Final list
step "Final job list after deletion"
curl -sf "$BASE/api/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
ok "Demo complete."
