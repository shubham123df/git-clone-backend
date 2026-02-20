export type PrStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'READY_FOR_DEPLOYMENT'
  | 'DEPLOYED';

export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface ChecklistItem {
  label: string;
  done?: boolean;
}

export interface PullRequest {
  id: string;
  title: string;
  description: string | null;
  repositoryLink: string;
  sourceBranch: string;
  targetBranch: string;
  status: PrStatus;
  checklist: ChecklistItem[] | null;
  authorId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; email: string; name: string | null };
  reviewers?: { id: string; user: { id: string; email: string; name: string | null } }[];
  reviews?: Review[];
  comments?: Comment[];
  deploymentStatus?: DeploymentStatus | null;
  _count?: { reviews: number };
}

export interface Reviewer {
  id: string;
  user: { id: string; email: string; name: string | null };
}

export interface Review {
  id: string;
  pullRequestId: string;
  userId: string;
  decision: ReviewDecision;
  body: string | null;
  createdAt: string;
  user?: { id: string; email: string; name: string | null };
}

export interface Comment {
  id: string;
  pullRequestId: string;
  reviewId: string | null;
  userId: string;
  body: string;
  createdAt: string;
  user?: { id: string; email: string; name: string | null };
}

export interface DeploymentStatus {
  id: string;
  pullRequestId: string;
  ready: boolean;
  ciPassed: boolean | null;
  blockers: string[] | null;
  warnings: string[] | null;
  deployedAt: string | null;
  deployedById: string | null;
}

export interface DeploymentReadiness {
  pullRequestId: string;
  status: PrStatus;
  approvalStatus: 'approved' | 'rejected' | 'pending';
  pendingReviewers: { id: string; email: string; name: string | null }[];
  reviews: { userId: string; decision: ReviewDecision }[];
  checklistComplete: boolean;
  checklistTotal: number;
  ciPassed: boolean | null;
  blockers: string[];
  warnings: string[];
  ready: boolean;
  deployedAt: string | null;
  deployedBy: { id: string; name: string | null } | null;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
}
