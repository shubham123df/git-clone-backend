import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import {
  GitPullRequest,
  Users,
  CheckCircle2,
  Bell,
  FileText,
  Ship,
  GitBranch,
  ArrowRight,
  Moon,
  Sun,
  Shield,
  Zap,
} from 'lucide-react';

export default function Landing() {
  const { theme, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-[#161b22]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <GitPullRequest className="h-8 w-8 text-[#238636] dark:text-[#3fb950]" />
            <span>PR Review</span>
          </Link>
          <nav className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043] dark:bg-[#3fb950] dark:hover:bg-[#56d364]"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Intelligent Pull Request & Code Review
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            A unified platform for PR submission, reviewer workflows, approvals, audit trails, and deployment readiness—familiar workflow, team-scale control.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#238636] px-6 py-3 text-base font-medium text-white hover:bg-[#2ea043] dark:bg-[#3fb950] dark:hover:bg-[#56d364]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Built for team workflows</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Submit PRs, assign reviewers, enforce approval rules, and track release readiness in one place.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: GitPullRequest, title: 'PR lifecycle', desc: 'Open → In review → Approved → Ready → Deployed with clear status and history.' },
            { icon: Users, title: 'Reviewer assignment', desc: 'Assign reviewers with safeguards: no self-assign, no duplicates, optional private repo tokens.' },
            { icon: CheckCircle2, title: 'Approve / request changes', desc: 'Authors cannot approve their own PRs. Threaded comments and full timeline.' },
            { icon: Ship, title: 'Deployment readiness', desc: 'Approval count, CI status, checklist, blockers, and a single readiness indicator.' },
            { icon: Bell, title: 'Notifications', desc: 'In-app alerts for assignments, comments, approvals, and deployment events.' },
            { icon: FileText, title: 'Audit logs', desc: 'Filterable log of assignments, approvals, deployments, and permission changes.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#161b22]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#238636]/10 dark:bg-[#3fb950]/20">
                <Icon className="h-5 w-5 text-[#238636] dark:text-[#3fb950]" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-[#0d1117]/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Simple workflow</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600 dark:text-slate-400">
            From open to deployed with clear steps and visibility.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            {['Open', 'In review', 'Changes requested', 'Approved', 'Ready', 'Deployed'].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 shadow dark:bg-[#161b22]">{step}</span>
                {i < 5 && <ArrowRight className="h-4 w-4 text-slate-400" />}
              </span>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#161b22]">
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#238636]" /> Create PR and set branch / checklist</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[#238636]" /> Assign reviewers (they get notified)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#238636]" /> Reviewers approve or request changes</li>
              <li className="flex items-center gap-2"><Ship className="h-4 w-4 text-[#238636]" /> Release manager marks ready and deploys</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security & Integrations */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-[#161b22]">
            <Shield className="h-10 w-10 text-[#238636] dark:text-[#3fb950]" />
            <h3 className="mt-4 text-xl font-semibold">Security & RBAC</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Roles (Admin, Developer, Reviewer, Release Manager) with permission safeguards. Tokens for private repos are encrypted at rest and never exposed in API responses.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-[#161b22]">
            <Zap className="h-10 w-10 text-[#238636] dark:text-[#3fb950]" />
            <h3 className="mt-4 text-xl font-semibold">Webhooks & integrations</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              GitHub and GitLab webhooks for PR and CI sync. Optional PAT storage for private repository access with scope guidance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to streamline your reviews?</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Sign up and create your first PR in minutes.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#238636] px-6 py-3 font-medium text-white hover:bg-[#2ea043] dark:bg-[#3fb950] dark:hover:bg-[#56d364]"
            >
              Sign up free
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-medium dark:border-slate-600">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          PR Review — Intelligent Pull Request & Code Review Management
        </div>
      </footer>
    </div>
  );
}
