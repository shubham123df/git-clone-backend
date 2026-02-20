import { Link } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import {
  GitPullRequest,
  Users,
  Bell,
  ArrowRight,
  Moon,
  Sun,
  Shield,
  Code2,
  BarChart3,
  Sparkles,
  Star,
  Play,
} from 'lucide-react';

export default function Landing() {
  const { theme, toggle } = useThemeStore();

  const features = [
    {
      icon: GitPullRequest,
      title: 'Smart PR Management',
      description: 'Create, review, and manage pull requests with an intuitive interface designed for modern development teams.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Code2,
      title: 'Code Playground',
      description: 'Write, test, and share code in multiple programming languages with our integrated code editor.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your development workflow with comprehensive dashboards and reports.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications about PR activities, reviews, and team collaborations.',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encrypted tokens, role-based access, and comprehensive audit logs.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team through integrated comments, reviews, and discussion threads.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Engineering Manager',
      company: 'TechCorp',
      content: 'PR Review has transformed how our team handles code reviews. The intuitive interface and powerful features have increased our productivity by 40%.',
      avatar: 'SC',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Senior Developer',
      company: 'StartupXYZ',
      content: 'The code playground feature is incredible. It\'s like having a mini IDE right in the browser. Perfect for quick prototyping and testing.',
      avatar: 'MR',
      rating: 5,
    },
    {
      name: 'Emily Watson',
      role: 'DevOps Lead',
      company: 'CloudScale',
      content: 'The analytics and reporting features give us unprecedented visibility into our development process. Essential for any growing team.',
      avatar: 'EW',
      rating: 5,
    },
  ];

  const stats = [
    { label: 'Active Teams', value: '10,000+', icon: Users },
    { label: 'PRs Reviewed', value: '1M+', icon: GitPullRequest },
    { label: 'Code Lines Analyzed', value: '100M+', icon: Code2 },
    { label: 'Satisfaction Rate', value: '99.9%', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1117] dark:to-[#161b22] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-[#161b22]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="relative">
              <GitPullRequest className="h-8 w-8 text-[#238636] dark:text-[#3fb950]" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
            </div>
            <span className="text-xl">PR Review Pro</span>
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
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] px-4 py-2 text-sm font-medium text-white hover:from-[#2ea043] hover:to-[#3fb950] dark:from-[#3fb950] dark:to-[#56d364] dark:hover:from-[#56d364] dark:hover:to-[#6ee7b7] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10"></div>
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            Now with AI-powered code analysis
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl lg:text-7xl">
            Code Review,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              {' '}Simplified
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            The modern platform for pull request management, code collaboration, and team productivity. 
            Built for developers who value efficiency and quality.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 hover:scale-105"
            >
              🚀 Quick Demo (No Login)
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="#features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-lg hover:bg-slate-50 dark:border-slate-600 dark:bg-[#161b22] dark:text-slate-300 dark:hover:bg-[#0d1117] transition-all duration-200"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#0d1117]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Everything You Need for Code Excellence
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Powerful features designed to streamline your development workflow and enhance code quality.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-slate-700 dark:bg-[#161b22]"
                >
                  <div className={`inline-flex rounded-xl p-3 ${feature.bgColor} ${feature.color} mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/0 to-purple-600/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#0d1117]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what our users have to say about their experience
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#161b22]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Code Review Process?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of teams already using PR Review Pro to ship better code, faster.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#0d1117]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GitPullRequest className="h-6 w-6 text-[#238636] dark:text-[#3fb950]" />
                <span className="font-semibold">PR Review Pro</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The modern platform for code review and team collaboration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-blue-600 dark:hover:text-blue-400">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About</Link></li>
                <li><Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-blue-600 dark:hover:text-blue-400">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/docs" className="hover:text-blue-600 dark:hover:text-blue-400">Documentation</Link></li>
                <li><Link to="/help" className="hover:text-blue-600 dark:hover:text-blue-400">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2024 PR Review Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
