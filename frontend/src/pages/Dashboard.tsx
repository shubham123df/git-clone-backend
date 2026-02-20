import { useState, useEffect } from "react";
import { GitPullRequest, CheckCircle, AlertTriangle, TrendingUp, Activity, MessageSquare, Bug, Shield, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState({
    totalFiles: 47,
    errorsFound: 3,
    warningsFound: 8,
    suggestions: 12,
    lastAnalyzed: new Date()
  });

  // Mock data for charts
  const weeklyActivity = [
    { day: 'Mon', commits: 12, prs: 5, reviews: 8 },
    { day: 'Tue', commits: 19, prs: 7, reviews: 12 },
    { day: 'Wed', commits: 15, prs: 9, reviews: 10 },
    { day: 'Thu', commits: 25, prs: 12, reviews: 15 },
    { day: 'Fri', commits: 22, prs: 8, reviews: 18 },
    { day: 'Sat', commits: 8, prs: 3, reviews: 5 },
    { day: 'Sun', commits: 5, prs: 2, reviews: 3 }
  ];

  const prStatusData = [
    { name: 'Open', value: 12, color: '#10b981' },
    { name: 'In Review', value: 8, color: '#f59e0b' },
    { name: 'Approved', value: 15, color: '#3b82f6' },
    { name: 'Merged', value: 24, color: '#8b5cf6' },
    { name: 'Closed', value: 5, color: '#ef4444' }
  ];

  const codeQualityMetrics = [
    { month: 'Jan', quality: 85, errors: 12, warnings: 28 },
    { month: 'Feb', quality: 88, errors: 8, warnings: 22 },
    { month: 'Mar', quality: 92, errors: 5, warnings: 18 },
    { month: 'Apr', quality: 90, errors: 7, warnings: 20 },
    { month: 'May', quality: 94, errors: 3, warnings: 15 },
    { month: 'Jun', quality: 96, errors: 2, warnings: 12 }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'pr_merged',
      title: 'PR #142: Add user authentication system',
      author: 'Sarah Chen',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'code_review',
      title: 'Review requested on PR #141',
      author: 'Mike Johnson',
      time: '15 minutes ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'error_detected',
      title: 'Code error found in auth.service.ts',
      author: 'System',
      time: '1 hour ago',
      status: 'error'
    },
    {
      id: 4,
      type: 'pr_opened',
      title: 'PR #143: Fix navigation bug',
      author: 'Emily Davis',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Code quality warning in dashboard.tsx',
      author: 'System',
      time: '3 hours ago',
      status: 'warning'
    }
  ];

  const codeIssues = [
    {
      id: 1,
      file: 'src/services/auth.service.ts',
      line: 45,
      type: 'error',
      message: 'Potential null reference exception',
      severity: 'high',
      suggestion: 'Add null check before accessing user property'
    },
    {
      id: 2,
      file: 'src/components/Dashboard.tsx',
      line: 128,
      type: 'warning',
      message: 'Unused variable "tempData"',
      severity: 'medium',
      suggestion: 'Remove unused variable or utilize it'
    },
    {
      id: 3,
      file: 'src/utils/api.ts',
      line: 23,
      type: 'error',
      message: 'Missing error handling in API call',
      severity: 'high',
      suggestion: 'Add try-catch block or error handling'
    },
    {
      id: 4,
      file: 'src/hooks/useAuth.ts',
      line: 67,
      type: 'suggestion',
      message: 'Consider using useMemo for expensive computation',
      severity: 'low',
      suggestion: 'Wrap computation in useMemo hook'
    }
  ];

  const runCodeAnalysis = async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCodeAnalysis({
      totalFiles: Math.floor(Math.random() * 20) + 40,
      errorsFound: Math.floor(Math.random() * 5) + 1,
      warningsFound: Math.floor(Math.random() * 10) + 5,
      suggestions: Math.floor(Math.random() * 15) + 8,
      lastAnalyzed: new Date()
    });
    setIsLoading(false);
  };

  useEffect(() => {
    // Simulate code analysis on mount
    runCodeAnalysis();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pr_merged': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'code_review': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'error_detected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pr_opened': return <GitPullRequest className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <Bug className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'suggestion': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed top-0 right-0 p-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Analyzing code...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your development overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Pull Requests</p>
              <p className="text-3xl font-bold mt-1">64</p>
              <p className="text-blue-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% from last week
              </p>
            </div>
            <GitPullRequest className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Code Reviews</p>
              <p className="text-3xl font-bold mt-1">42</p>
              <p className="text-green-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8% from last week
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Active Issues</p>
              <p className="text-3xl font-bold mt-1">{codeAnalysis.errorsFound + codeAnalysis.warningsFound}</p>
              <p className="text-amber-100 text-sm mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {codeAnalysis.errorsFound} errors, {codeAnalysis.warningsFound} warnings
              </p>
            </div>
            <Bug className="w-12 h-12 text-amber-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Code Quality Score</p>
              <p className="text-3xl font-bold mt-1">94%</p>
              <p className="text-purple-100 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +2% improvement
              </p>
            </div>
            <Shield className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Summary */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly Activity</h2>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Active</span>
            </div>
          </div>
          <div className="space-y-3">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{day.day}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{day.commits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{day.prs}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">{day.reviews}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PR Status Distribution */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">PR Status Distribution</h2>
          <div className="space-y-3">
            {prStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Quality & Issues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Quality Trend */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Code Quality Trend</h2>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Improving</span>
            </div>
          </div>
          <div className="space-y-3">
            {codeQualityMetrics.map((metric) => (
              <div key={metric.month} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{metric.month}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{metric.quality}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">{metric.errors}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">{metric.warnings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Analysis Summary */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Code Analysis</h2>
            <button 
              onClick={runCodeAnalysis}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Files Analyzed</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{codeAnalysis.totalFiles}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Errors Found</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{codeAnalysis.errorsFound}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Warnings</span>
              </div>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{codeAnalysis.warningsFound}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Suggestions</span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{codeAnalysis.suggestions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Issues Section */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" />
            Code Issues & Suggestions
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Last analyzed: {codeAnalysis.lastAnalyzed?.toLocaleTimeString()}
            </span>
            <button 
              onClick={runCodeAnalysis}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Code'}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {codeIssues.map((issue) => (
            <div key={issue.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{issue.message}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {issue.file}:{issue.line}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      💡 {issue.suggestion}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activity.author} • {activity.time}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'error' ? 'bg-red-500' :
                activity.status === 'warning' ? 'bg-amber-500' :
                'bg-blue-500'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
