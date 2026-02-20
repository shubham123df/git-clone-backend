# API Route Definitions (REST v1)

Base path: `/api/v1`

## Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /auth/register | Register (email, password, name) | - |
| POST | /auth/login | Login → access token + refresh token | - |
| POST | /auth/refresh | Refresh access token | Refresh |
| POST | /auth/logout | Invalidate refresh token | JWT |
| GET  | /auth/me | Current user + role | JWT |

## Users (RBAC: Admin for write)

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| GET    | /users | List users (paginated, filter by role) | Admin |
| GET    | /users/:id | Get user by id | Admin, self |
| PATCH  | /users/me | Update current user profile (name only) | JWT (self) |
| PATCH  | /users/:id | Update user (including role) | Admin |
| DELETE | /users/:id | Soft delete or hard delete | Admin |

## Roles

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| GET    | /roles | List roles (id, name, permissions) | JWT |

## Pull Requests

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| POST   | /pull-requests | Create PR | Developer+ |
| GET    | /pull-requests | List PRs (filter: status, author, reviewer; sort; paginate) | JWT |
| GET    | /pull-requests/:id | Get PR with reviewers, reviews, deployment status | JWT |
| PATCH  | /pull-requests/:id | Update PR (title, description, checklist, etc.); version for optimistic lock | Author, Admin |
| PATCH  | /pull-requests/:id/status | Transition status (with validation) | Author, Reviewer, Release Manager, Admin |
| DELETE | /pull-requests/:id | Delete PR (if allowed by policy) | Admin, Author (if open) |

## Reviewers

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| POST   | /pull-requests/:id/reviewers | Assign reviewers (body: userIds[]); no duplicates | Developer+, Release Manager, Admin |
| DELETE | /pull-requests/:id/reviewers/:userId | Remove reviewer | Same as assign |

## Reviews

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| POST   | /pull-requests/:id/reviews | Submit review (decision, body) | Assigned reviewer |
| GET    | /pull-requests/:id/reviews | List reviews for PR | JWT |
| PATCH  | /pull-requests/:id/reviews/:reviewId | Update review (e.g. change decision) | Review author |

## Comments

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| POST   | /pull-requests/:id/comments | Add comment (optional reviewId for thread) | JWT |
| GET    | /pull-requests/:id/comments | List comments (paginated) | JWT |
| PATCH  | /comments/:id | Edit own comment | Author |
| DELETE | /comments/:id | Delete own comment | Author, Admin |

## Deployment

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| GET    | /pull-requests/:id/deployment | Get deployment readiness (approvals, pending, CI, blockers, ready) | JWT |
| POST   | /pull-requests/:id/deployment/ready | Mark ready for deployment (or auto-computed) | Release Manager, Admin |
| POST   | /pull-requests/:id/deployment/deploy | Mark as deployed | Release Manager, Admin |
| PATCH  | /pull-requests/:id/deployment | Update CI/blockers/warnings (or via webhook) | System, Release Manager |

## Notifications

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| GET    | /notifications | List my notifications (paginated, unread first) | JWT |
| PATCH  | /notifications/:id/read | Mark as read | Owner |
| PATCH  | /notifications/read-all | Mark all as read | Owner |

## Audit Logs

| Method | Path | Description | Roles |
|--------|------|-------------|--------|
| GET    | /audit-logs | Query logs (filters: entityType, entityId, userId, action, dateFrom, dateTo; paginate) | Admin, Release Manager (scoped) |

## Repository Tokens (private repo access)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST   | /repository-tokens | Store token (body: provider, token); encrypted at rest; response never includes token | JWT (self) |
| GET    | /repository-tokens | List configured providers (id, provider, scopeHint, timestamps, hasToken: true) | JWT (self) |
| DELETE | /repository-tokens/:provider | Revoke token for provider (GITHUB \| GITLAB) | JWT (self) |

See [TOKEN_STORAGE_STRATEGY.md](TOKEN_STORAGE_STRATEGY.md) for encryption and key management.

## Webhooks

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST   | /webhooks/github | GitHub webhook (signature verification) | Secret |
| POST   | /webhooks/gitlab | GitLab webhook (token verification) | Secret |

## Real-time (WebSocket)

- **Namespace**: `/ws` or `/api/v1/ws`
- **Events (server → client)**: `pr:updated`, `review:added`, `comment:added`, `deployment:updated`, `notification`
- **Rooms**: per PR (`pr:{id}`), per user (`user:{id}`) for notifications
