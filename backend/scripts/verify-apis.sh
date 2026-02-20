#!/usr/bin/env bash
# Verify all backend APIs - run from repo root or backend/
set -e
BASE="${1:-http://localhost:3010/api/v1}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; }
fail() { echo -e "${RED}FAIL${NC} $1 (HTTP $2)"; }
warn() { echo -e "${YELLOW}SKIP/403${NC} $1 (expected for role)"; }

echo "=== API verification base: $BASE ==="

# 1. Health (no auth)
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health")
[ "$code" = "200" ] && pass "GET /health" || fail "GET /health" "$code"

# 2. Register
reg=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"api-verify-$(date +%s)@test.local\",\"password\":\"TestPass123!\",\"name\":\"API Verify\"}" -w "\n%{http_code}")
code=$(echo "$reg" | tail -1)
body=$(echo "$reg" | sed '$d')
[ "$code" = "201" ] && pass "POST /auth/register" || fail "POST /auth/register" "$code"
token=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
refresh=$(echo "$body" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
[ -z "$token" ] && echo "  (no token - cannot test protected routes)"

# 3. Login (only if we have no token from register)
if [ -z "$token" ]; then
  login=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"api-verify@test.local","password":"TestPass123!"}' -w "\n%{http_code}")
  code=$(echo "$login" | tail -1)
  body=$(echo "$login" | sed '$d')
  [ "$code" = "201" ] || [ "$code" = "200" ] && pass "POST /auth/login" || fail "POST /auth/login" "$code"
  token=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
fi

AUTH="Authorization: Bearer $token"

# 4. Me
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/auth/me")
[ "$code" = "200" ] && pass "GET /auth/me" || fail "GET /auth/me" "$code"

# 5. Roles
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/roles")
[ "$code" = "200" ] && pass "GET /roles" || fail "GET /roles" "$code"

# 6. Users list (may 200 for any JWT now)
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/users")
[ "$code" = "200" ] && pass "GET /users" || warn "GET /users"

# 7. Create PR
pr_body=$(curl -s -X POST "$BASE/pull-requests" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"API Verify PR","description":"Test","repositoryLink":"https://github.com/test/repo","sourceBranch":"feat","targetBranch":"main","checklist":[{"label":"Item1","done":false}]}' -w "\n%{http_code}")
code=$(echo "$pr_body" | tail -1)
body=$(echo "$pr_body" | sed '$d')
[ "$code" = "201" ] && pass "POST /pull-requests" || fail "POST /pull-requests" "$code"
pr_id=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 8. List PRs
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/pull-requests")
[ "$code" = "200" ] && pass "GET /pull-requests" || fail "GET /pull-requests" "$code"

# 9. Get one PR
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/pull-requests/$pr_id") && [ "$code" = "200" ] && pass "GET /pull-requests/:id" || fail "GET /pull-requests/:id" "$code"

# 10. Update PR
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Content-Type: application/json" -H "$AUTH" "$BASE/pull-requests/$pr_id" -d '{"title":"API Verify PR Updated"}') && [ "$code" = "200" ] && pass "PATCH /pull-requests/:id" || fail "PATCH /pull-requests/:id" "$code"

# 11. Update status
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Content-Type: application/json" -H "$AUTH" "$BASE/pull-requests/$pr_id/status" -d '{"status":"IN_REVIEW"}') && [ "$code" = "200" ] && pass "PATCH /pull-requests/:id/status" || fail "PATCH /pull-requests/:id/status" "$code"

# 12. Assign reviewers - need another user id; get from users
user_id=$(curl -s -H "$AUTH" "$BASE/users?limit=5" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$pr_id" ] && [ -n "$user_id" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -H "$AUTH" "$BASE/pull-requests/$pr_id/reviewers" -d "{\"userIds\":[\"$user_id\"]}")
  [ "$code" = "200" ] && pass "POST /pull-requests/:id/reviewers" || warn "POST /pull-requests/:id/reviewers"
fi

# 13. List reviews
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/pull-requests/$pr_id/reviews") && [ "$code" = "200" ] && pass "GET /pull-requests/:id/reviews" || fail "GET /pull-requests/:id/reviews" "$code"

# 14. Post comment
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -H "$AUTH" "$BASE/pull-requests/$pr_id/comments" -d '{"body":"API verify comment"}') && [ "$code" = "201" ] && pass "POST /pull-requests/:id/comments" || fail "POST /pull-requests/:id/comments" "$code"

# 15. List comments
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/pull-requests/$pr_id/comments") && [ "$code" = "200" ] && pass "GET /pull-requests/:id/comments" || fail "GET /pull-requests/:id/comments" "$code"

# 16. Deployment readiness
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/pull-requests/$pr_id/deployment") && [ "$code" = "200" ] && pass "GET /pull-requests/:id/deployment" || fail "GET /pull-requests/:id/deployment" "$code"

# 17. Deployment ready (may 403 for non-Release Manager)
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" "$BASE/pull-requests/$pr_id/deployment/ready") && { [ "$code" = "200" ] && pass "POST /pull-requests/:id/deployment/ready" || warn "POST /pull-requests/:id/deployment/ready"; }

# 18. PATCH deployment
[ -n "$pr_id" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Content-Type: application/json" -H "$AUTH" "$BASE/pull-requests/$pr_id/deployment" -d '{"ciPassed":true}') && { [ "$code" = "200" ] && pass "PATCH /pull-requests/:id/deployment" || warn "PATCH /pull-requests/:id/deployment"; }

# 19. Notifications
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/notifications")
[ "$code" = "200" ] && pass "GET /notifications" || fail "GET /notifications" "$code"

# 20. Mark all notifications read
code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "$AUTH" "$BASE/notifications/read-all")
[ "$code" = "200" ] && pass "PATCH /notifications/read-all" || fail "PATCH /notifications/read-all" "$code"

# 21. Audit logs (may 403 for non-Admin)
code=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE/audit-logs")
[ "$code" = "200" ] && pass "GET /audit-logs" || warn "GET /audit-logs"

# 22. Webhooks (no auth / invalid secret - may return 200 received or 401)
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/webhooks/github" -H "Content-Type: application/json" -d '{"action":"test"}')
[ "$code" = "200" ] || [ "$code" = "201" ] || [ "$code" = "401" ] && pass "POST /webhooks/github" || fail "POST /webhooks/github" "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/webhooks/gitlab" -H "Content-Type: application/json" -d '{}')
[ "$code" = "200" ] || [ "$code" = "201" ] || [ "$code" = "401" ] && pass "POST /webhooks/gitlab" || fail "POST /webhooks/gitlab" "$code"

# 23. Refresh token
[ -n "$refresh" ] && code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/refresh" -H "Content-Type: application/json" -d "{\"refreshToken\":\"$refresh\"}") && [ "$code" = "200" ] || [ "$code" = "201" ] && pass "POST /auth/refresh" || fail "POST /auth/refresh" "$code"

# 24. Logout
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" "$BASE/auth/logout")
[ "$code" = "201" ] || [ "$code" = "200" ] && pass "POST /auth/logout" || fail "POST /auth/logout" "$code"

echo "=== Done ==="
