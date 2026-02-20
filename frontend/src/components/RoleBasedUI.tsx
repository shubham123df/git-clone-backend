import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, Crown, User, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export type Role = 'admin' | 'maintainer' | 'developer' | 'reviewer' | 'viewer';

interface RoleConfig {
  name: string;
  permissions: Permission[];
  color: string;
  icon: ReactNode;
  description: string;
}

export type Permission = 
  | 'read:code'
  | 'write:code'
  | 'delete:code'
  | 'approve:pr'
  | 'merge:pr'
  | 'manage:users'
  | 'manage:settings'
  | 'view:analytics'
  | 'manage:tokens'
  | 'review:code'
  | 'comment:pr'
  | 'assign:reviewers'
  | 'manage:repository'
  | 'view:secrets'
  | 'manage:webhooks';

interface RoleBasedUIProps {
  children: ReactNode;
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  fallback?: ReactNode;
  mode?: 'any' | 'all';
}

const roleHierarchy: Record<Role, number> = {
  viewer: 1,
  reviewer: 2,
  developer: 3,
  maintainer: 4,
  admin: 5,
};

const roleConfigs: Record<Role, RoleConfig> = {
  admin: {
    name: 'Administrator',
    permissions: [
      'read:code', 'write:code', 'delete:code',
      'approve:pr', 'merge:pr', 'review:code', 'comment:pr',
      'manage:users', 'manage:settings', 'view:analytics',
      'manage:tokens', 'assign:reviewers', 'manage:repository',
      'view:secrets', 'manage:webhooks'
    ],
    color: 'text-purple-600 dark:text-purple-400',
    icon: <Crown className="w-4 h-4" />,
    description: 'Full system access and user management'
  },
  maintainer: {
    name: 'Maintainer',
    permissions: [
      'read:code', 'write:code', 'delete:code',
      'approve:pr', 'merge:pr', 'review:code', 'comment:pr',
      'view:analytics', 'manage:tokens', 'assign:reviewers',
      'manage:repository', 'view:secrets', 'manage:webhooks'
    ],
    color: 'text-blue-600 dark:text-blue-400',
    icon: <Shield className="w-4 h-4" />,
    description: 'Repository management and code merging'
  },
  developer: {
    name: 'Developer',
    permissions: [
      'read:code', 'write:code',
      'review:code', 'comment:pr', 'assign:reviewers'
    ],
    color: 'text-green-600 dark:text-green-400',
    icon: <User className="w-4 h-4" />,
    description: 'Code contribution and review'
  },
  reviewer: {
    name: 'Reviewer',
    permissions: [
      'read:code', 'review:code', 'comment:pr'
    ],
    color: 'text-amber-600 dark:text-amber-400',
    icon: <Eye className="w-4 h-4" />,
    description: 'Code review and commenting'
  },
  viewer: {
    name: 'Viewer',
    permissions: ['read:code'],
    color: 'text-slate-600 dark:text-slate-400',
    icon: <EyeOff className="w-4 h-4" />,
    description: 'Read-only access to repositories'
  }
};

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const userRole = (user?.role?.toLowerCase() as Role) || 'viewer';
  
  const hasPermission = (permission: Permission): boolean => {
    return roleConfigs[userRole]?.permissions.includes(permission) || false;
  };
  
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };
  
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };
  
  const hasRole = (role: Role): boolean => {
    return roleHierarchy[userRole] >= roleHierarchy[role];
  };
  
  const can = {
    readCode: hasPermission('read:code'),
    writeCode: hasPermission('write:code'),
    deleteCode: hasPermission('delete:code'),
    approvePR: hasPermission('approve:pr'),
    mergePR: hasPermission('merge:pr'),
    manageUsers: hasPermission('manage:users'),
    manageSettings: hasPermission('manage:settings'),
    viewAnalytics: hasPermission('view:analytics'),
    manageTokens: hasPermission('manage:tokens'),
    reviewCode: hasPermission('review:code'),
    commentPR: hasPermission('comment:pr'),
    assignReviewers: hasPermission('assign:reviewers'),
    manageRepository: hasPermission('manage:repository'),
    viewSecrets: hasPermission('view:secrets'),
    manageWebhooks: hasPermission('manage:webhooks')
  };
  
  return {
    role: userRole,
    roleConfig: roleConfigs[userRole],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    can
  };
}

export default function RoleBasedUI({ 
  children, 
  requiredRole, 
  requiredPermissions = [], 
  fallback = null,
  mode = 'any' 
}: RoleBasedUIProps) {
  const { hasRole, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let hasAccess = true;
  
  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  }
  
  if (requiredPermissions.length > 0) {
    const hasPermissionAccess = mode === 'all' 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    hasAccess = hasAccess && hasPermissionAccess;
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Permission Gates for specific actions
export function PermissionGate({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: Permission; 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

// Role Badge Component
export function RoleBadge({ role, size = 'sm' }: { role: Role; size?: 'sm' | 'md' | 'lg' }) {
  const config = roleConfigs[role];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${sizeClasses[size]} ${
      role === 'admin' ? 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300' :
      role === 'maintainer' ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' :
      role === 'developer' ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' :
      role === 'reviewer' ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300' :
      'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
    }`}>
      {config.icon}
      <span className="font-medium">{config.name}</span>
    </div>
  );
}

// Permission Matrix Component
export function PermissionMatrix() {
  const { role, roleConfig } = usePermissions();
  
  const allPermissions: Permission[] = [
    'read:code', 'write:code', 'delete:code',
    'approve:pr', 'merge:pr', 'review:code', 'comment:pr',
    'manage:users', 'manage:settings', 'view:analytics',
    'manage:tokens', 'assign:reviewers', 'manage:repository',
    'view:secrets', 'manage:webhooks'
  ];
  
  const permissionLabels: Record<Permission, string> = {
    'read:code': 'Read Code',
    'write:code': 'Write Code',
    'delete:code': 'Delete Code',
    'approve:pr': 'Approve PR',
    'merge:pr': 'Merge PR',
    'review:code': 'Review Code',
    'comment:pr': 'Comment on PR',
    'manage:users': 'Manage Users',
    'manage:settings': 'Manage Settings',
    'view:analytics': 'View Analytics',
    'manage:tokens': 'Manage Tokens',
    'assign:reviewers': 'Assign Reviewers',
    'manage:repository': 'Manage Repository',
    'view:secrets': 'View Secrets',
    'manage:webhooks': 'Manage Webhooks'
  };
  
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Permission Matrix
      </h3>
      
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' :
            role === 'maintainer' ? 'bg-blue-100 dark:bg-blue-900/30' :
            role === 'developer' ? 'bg-green-100 dark:bg-green-900/30' :
            role === 'reviewer' ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-slate-100 dark:bg-slate-800'
          }`}>
            {roleConfig.icon}
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Your Role: {roleConfig.name}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {roleConfig.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {allPermissions.map((permission) => {
          const hasPermission = roleConfig.permissions.includes(permission);
          return (
            <div key={permission} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {permissionLabels[permission]}
              </span>
              {hasPermission ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Unlock className="w-4 h-4" />
                  <span className="text-sm">Granted</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Restricted</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Action Button with Permission Check
export function ActionButton({ 
  permission, 
  children, 
  onClick, 
  disabled, 
  className = '',
  ...props 
}: {
  permission: Permission;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission(permission);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || !hasAccess}
      className={`${
        hasAccess 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
      } px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Role-based Navigation Item
export function RoleBasedNavItem({ 
  permission, 
  children, 
  href, 
  className = '' 
}: { 
  permission: Permission; 
  children: ReactNode; 
  href: string; 
  className?: string;
}) {
  const { hasPermission } = usePermissions();
  const hasAccess = hasPermission(permission);
  
  if (!hasAccess) return null;
  
  return (
    <a 
      href={href}
      className={`block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 ${className}`}
    >
      {children}
    </a>
  );
}
