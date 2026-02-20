# Database Schema – Intelligent PR & Code Review Management System

## ER Overview

- **users** – accounts, linked to **roles** (many-to-one).
- **pull_requests** – PR metadata and status; optional **deployment_status** (one-to-one).
- **reviewers** – assignment of users to PRs (many-to-many via join table).
- **reviews** – one approval/request-changes/reject per reviewer per PR; **comments** belong to PR or review.
- **audit_logs** – append-only event log.
- **notifications** – per-user notification records (read/unread).

## Indexing Strategy

- **users**: `email` UNIQUE; `roleId`; `createdAt` for listing.
- **pull_requests**: `status`, `authorId`, `createdAt`, `updatedAt`; composite `(authorId, status)` for “my PRs”.
- **reviewers**: UNIQUE `(pullRequestId, userId)`; index `userId` for “PRs I review”.
- **reviews**: UNIQUE `(pullRequestId, userId)`; `pullRequestId`, `createdAt`.
- **comments**: `pullRequestId`, `reviewId`, `createdAt`.
- **audit_logs**: `entityType`, `entityId`, `userId`, `action`, `createdAt`; composite for time-range queries.
- **notifications**: `userId`, `read`, `createdAt`.
- **deployment_status**: `pullRequestId` UNIQUE.

---

## Table Definitions (Prisma-style)

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique  // ADMIN, DEVELOPER, REVIEWER, RELEASE_MANAGER
  permissions String[]          // e.g. ["submit_pr", "assign_reviewers", "approve_pr", ...]
  users       User[]
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String?
  roleId        String    @map("role_id")
  role          Role      @relation(fields: [roleId], references: [id])
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  authoredPRs       PullRequest[]  @relation("Author")
  reviewerAssignments Reviewer[]
  reviews            Review[]
  comments           Comment[]
  auditLogs          AuditLog[]
  notifications      Notification[]
  deploymentActions  DeploymentStatus[] @relation("DeployedBy")
  repositoryTokens  RepositoryToken[]

  @@index([roleId])
  @@index([createdAt])
}

model RepositoryToken {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider       String   // GITHUB | GITLAB
  encryptedToken String   @map("encrypted_token")
  scopeHint      String?  @map("scope_hint") @db.Text
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@unique([userId, provider])
  @@index([userId])
}

model PullRequest {
  id              String    @id @default(cuid())
  title           String
  description     String?   @db.Text
  repositoryLink  String    @map("repository_link")
  sourceBranch    String    @map("source_branch")
  targetBranch    String    @map("target_branch")
  status         PrStatus  @default(OPEN)  // OPEN, IN_REVIEW, CHANGES_REQUESTED, APPROVED, READY_FOR_DEPLOYMENT, DEPLOYED
  checklist      Json?     // [{ "label": "...", "done": boolean }]
  authorId       String    @map("author_id")
  author         User      @relation("Author", fields: [authorId], references: [id])
  version        Int       @default(1)   // optimistic lock
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  reviewers   Reviewer[]
  reviews     Review[]
  comments    Comment[]
  deploymentStatus DeploymentStatus?
  auditLogs   AuditLog[]

  @@index([status])
  @@index([authorId])
  @@index([authorId, status])
  @@index([createdAt])
  @@index([updatedAt])
}

model Reviewer {
  id              String       @id @default(cuid())
  pullRequestId   String       @map("pull_request_id")
  userId          String       @map("user_id")
  assignedAt      DateTime     @default(now()) @map("assigned_at")
  pullRequest     PullRequest  @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([pullRequestId, userId])
  @@index([userId])
}

model Review {
  id              String     @id @default(cuid())
  pullRequestId   String     @map("pull_request_id")
  userId          String     @map("user_id")
  decision        ReviewDecision  // APPROVED, CHANGES_REQUESTED, REJECTED
  body            String?    @db.Text
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")
  pullRequest     PullRequest @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments        Comment[]

  @@unique([pullRequestId, userId])
  @@index([pullRequestId])
  @@index([createdAt])
}

model Comment {
  id              String    @id @default(cuid())
  pullRequestId   String    @map("pull_request_id")
  reviewId        String?   @map("review_id")
  userId          String    @map("user_id")
  body            String    @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  pullRequest     PullRequest @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)
  review          Review?     @relation(fields: [reviewId], references: [id], onDelete: SetNull)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([pullRequestId])
  @@index([reviewId])
  @@index([createdAt])
}

model AuditLog {
  id          String   @id @default(cuid())
  entityType  String   @map("entity_type")  // pull_request, review, deployment, etc.
  entityId    String   @map("entity_id")
  action      String   // status_change, approved, rejected, reviewer_assigned, deployed, etc.
  userId      String?  @map("user_id")
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  metadata    Json?    // old/new status, reviewer id, etc.
  createdAt   DateTime @default(now()) @map("created_at")
  pullRequestId String? @map("pull_request_id")
  pullRequest   PullRequest? @relation(fields: [pullRequestId], references: [id], onDelete: SetNull)

  @@index([entityType, entityId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([pullRequestId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  type      String   // reviewer_assigned, pr_approved, comment_added, deployment_ready, etc.
  title     String
  body      String?  @db.Text
  link      String?  // e.g. /pr/123
  read      Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, read])
  @@index([createdAt])
}

model DeploymentStatus {
  id              String    @id @default(cuid())
  pullRequestId   String    @unique @map("pull_request_id")
  ready           Boolean   @default(false)
  ciPassed        Boolean?  @map("ci_passed")
  blockers        Json?     // ["reason1", "reason2"]
  warnings        Json?
  deployedAt      DateTime? @map("deployed_at")
  deployedById    String?   @map("deployed_by_id")
  deployedBy      User?     @relation("DeployedBy", fields: [deployedById], references: [id], onDelete: SetNull)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  pullRequest     PullRequest @relation(fields: [pullRequestId], references: [id], onDelete: Cascade)

  @@index([ready])
}
```

## Enums

- **PrStatus**: OPEN, IN_REVIEW, CHANGES_REQUESTED, APPROVED, READY_FOR_DEPLOYMENT, DEPLOYED
- **ReviewDecision**: APPROVED, CHANGES_REQUESTED, REJECTED
