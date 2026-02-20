import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = [
  {
    name: 'ADMIN',
    permissions: ['submit_pr', 'assign_reviewers', 'approve_pr', 'view_audit_logs', 'mark_deployment_ready', 'manage_users'],
  },
  {
    name: 'DEVELOPER',
    permissions: ['submit_pr', 'assign_reviewers'],
  },
  {
    name: 'REVIEWER',
    permissions: ['submit_pr', 'assign_reviewers', 'approve_pr'],
  },
  {
    name: 'RELEASE_MANAGER',
    permissions: ['submit_pr', 'assign_reviewers', 'approve_pr', 'view_audit_logs', 'mark_deployment_ready'],
  },
];

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: role,
      update: { permissions: role.permissions },
    });
  }
  console.log('Seeded roles:', ROLES.map((r) => r.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
