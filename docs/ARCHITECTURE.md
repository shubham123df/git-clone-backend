# Intelligent PR & Code Review Management System – Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Web App    │  │  Webhooks    │  │  CI/CD       │  │  External    │   │
│  │  (React)     │  │  (GitHub/    │  │  Pipelines   │  │  (Slack etc)  │   │
│  │              │  │   GitLab)    │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                          │
│                    REST API v1  │  WebSockets  │  Webhooks                    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Auth      │ │   PR        │ │   Review    │ │  Deployment │            │
│  │   Module    │ │   Module    │ │   Module    │ │  Module     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Notifications│ │ Audit Log  │ │  Webhook    │ │   Users     │            │
│  │   Module    │ │   Module    │ │   Module    │ │   Module    │            │
│  └──────┬──────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Redis Queue → Notification Worker (Bull) → Send notifications       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL (Primary)     │     Redis (Cache + Queue + Sessions)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer        | Technology |
|-------------|------------|
| Backend     | Node.js, NestJS, TypeScript |
| ORM         | Prisma |
| Database    | PostgreSQL 15+ |
| Cache/Queue | Redis 7 (Bull for job queue) |
| Auth        | JWT (access + refresh), bcrypt |
| Frontend    | React 18, TypeScript, Vite |
| State       | Zustand |
| UI          | TailwindCSS, Radix UI / Headless UI |
| Real-time   | Socket.IO (WebSockets) |
| Validation  | class-validator, class-transformer |

## Module Design

- **AuthModule**: Register, login, JWT issue/refresh, password hashing, RBAC guards.
- **UsersModule**: User CRUD, role assignment (Admin only).
- **PullRequestsModule**: Create/update PR, status lifecycle, checklist, branch/repo.
- **ReviewersModule**: Assign reviewers, prevent duplicates, link to notifications.
- **ReviewsModule**: Approve / request changes / reject, comments, timeline.
- **DeploymentModule**: Readiness panel, CI checklist, blockers, final indicator.
- **NotificationsModule**: Queue jobs via Redis (Bull), worker sends in-app + (optional) Slack/email.
- **AuditLogModule**: Append-only log for PR/review/deployment events, queryable with filters.
- **WebhookModule**: GitHub/GitLab webhook endpoint, signature verification, sync PR/CI.
- **RepositoryTokensModule**: Store GitHub/GitLab PATs per user; encrypt at rest (AES-256-GCM), never expose in API; used server-side for private repo access (see [TOKEN_STORAGE_STRATEGY.md](TOKEN_STORAGE_STRATEGY.md)).
- **Landing page**: Public route `/` with product overview, features, workflow, CTAs (Sign up / Sign in); authenticated users redirect to `/pull-requests`.
- **Assigned Reviews**: Page listing PRs where the current user is a reviewer; filters (Pending, Changes requested, Approved).
- **Settings**: Profile (name via `PATCH /users/me`) and repository token management (add/update/revoke).

## Middleware & Pipeline

1. **CORS**: Configurable origins.
2. **Helmet**: Security headers.
3. **Rate limiting**: Per IP / per user (Redis-backed optional).
4. **Request logging**: Request ID, method, path, status, duration.
5. **Auth guard**: JWT validation, attach user to request.
6. **Roles guard**: Check user role for protected routes.
7. **Validation pipe**: DTO validation (whitelist, transform).

## Error Handling Strategy

- **Global exception filter**: Map exceptions to consistent JSON (statusCode, message, error).
- **HTTP exceptions**: 400, 401, 403, 404, 409, 422, 500.
- **Prisma errors**: Unique constraint → 409; not found → 404.
- **Validation errors**: 400 with field-level messages.
- **Logging**: Structured logs (request ID, user, error stack) for 5xx.

## Concurrency Handling

- **PR status / reviews**: Optimistic locking via `version` or `updatedAt` on PR; reject stale updates with 409.
- **Reviewer assignment**: Unique constraint (prId, userId) for reviewers table; DB-level prevention of duplicates.
- **Audit logs**: Append-only; no update/delete; high write throughput via batch insert if needed.
- **Notifications**: Single consumer per queue; idempotent job handlers; retry with backoff.

## Data Synchronization

- **Webhooks**: GitHub/GitLab push PR/CI events → validate signature → update PR status / deployment status in DB.
- **Real-time**: Socket.IO rooms per PR or per user; server emits on PR/review/comment/deployment events.
- **Cache**: Optional Redis cache for deployment readiness summary (invalidate on PR/review/CI update).

## Security

- Passwords hashed with bcrypt (rounds ≥ 10).
- JWT: short-lived access token, refresh token in httpOnly cookie or separate store.
- Input validation on all DTOs; sanitize for XSS.
- RBAC enforced at controller + service layer.
- Webhook endpoints verify provider signature (e.g. X-Hub-Signature-256).

## Scalability

- Stateless API; horizontal scaling behind load balancer.
- DB connection pooling (Prisma).
- Redis for queue and optional caching.
- Async notification processing to keep API response time &lt; 2s.
