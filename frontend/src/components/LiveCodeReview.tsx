import { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Bot,
  Zap,
  FileText,
  ThumbsUp,
  Reply,
  Pin,
  Flag
} from 'lucide-react';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: 'developer' | 'reviewer' | 'admin' | 'ai' | string;
  };
  content: string;
  timestamp: Date;
  line?: number;
  type: 'suggestion' | 'issue' | 'praise' | 'question' | 'general';
  resolved?: boolean;
  replies?: Comment[];
  isPinned?: boolean;
  aiGenerated?: boolean;
}

interface LiveCodeReviewProps {
  fileName: string;
  code: string;
  language: string;
  onCommentAdd?: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onCommentResolve?: (commentId: string) => void;
  currentUser?: {
    name: string;
    avatar?: string;
    role: 'developer' | 'reviewer' | 'admin' | 'ai' | string;
  };
  enableAI?: boolean;
  enableCollaboration?: boolean;
}

export default function LiveCodeReview({
  fileName,
  code,
  language,
  onCommentAdd,
  onCommentResolve,
  currentUser = { name: 'Current User', role: 'developer' },
  enableAI = true,
  enableCollaboration = true
}: LiveCodeReviewProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: { name: 'Sarah Chen', role: 'reviewer' },
      content: 'Consider using a more descriptive variable name here for better readability.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      line: 15,
      type: 'suggestion',
      replies: [
        {
          id: '1-1',
          author: { name: 'Mike Johnson', role: 'developer' },
          content: 'Good point! I\'ll update this to `userAuthenticationToken`.',
          timestamp: new Date(Date.now() - 1000 * 60 * 2),
          type: 'general'
        }
      ]
    },
    {
      id: '2',
      author: { name: 'AI Assistant', role: 'ai' },
      content: 'This function could benefit from input validation to prevent potential security vulnerabilities.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      line: 42,
      type: 'issue',
      aiGenerated: true,
      isPinned: true
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [commentType, setCommentType] = useState<Comment['type']>('general');
  const [activeUsers] = useState([
    { name: 'Sarah Chen', status: 'active', lastSeen: new Date() },
    { name: 'Mike Johnson', status: 'active', lastSeen: new Date() },
    { name: 'AI Assistant', status: 'online', lastSeen: new Date(), role: 'ai' }
  ]);

  const codeLines = code.split('\n');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: currentUser,
      content: newComment,
      timestamp: new Date(),
      line: selectedLine || undefined,
      type: commentType,
      aiGenerated: currentUser.role === 'ai' || false
    };

    setComments(prev => [...prev, comment]);
    onCommentAdd?.(comment);
    setNewComment('');
    setSelectedLine(null);
    setCommentType('general');
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => 
        c.id === commentId ? { ...c, resolved: !c.resolved } : c
      )
    );
    onCommentResolve?.(commentId);
  };

  const getCommentIcon = (type: Comment['type']) => {
    switch (type) {
      case 'suggestion':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'issue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'praise':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'question':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      reviewer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      developer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      ai: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || colors.developer}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const generateAIComment = () => {
    if (!enableAI) return;
    
    const aiSuggestions = [
      'Consider adding error handling for this function.',
      'This variable could be declared with const instead of let.',
      'Adding JSDoc comments would improve code documentation.',
      'This logic could be extracted into a separate utility function.',
      'Consider using async/await for better readability.'
    ];
    
    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    
    const aiComment: Comment = {
      id: `ai-${Date.now()}`,
      author: { name: 'AI Assistant', role: 'ai' },
      content: randomSuggestion,
      timestamp: new Date(),
      line: selectedLine || Math.floor(Math.random() * codeLines.length) + 1,
      type: 'suggestion',
      aiGenerated: true
    };
    
    setComments(prev => [...prev, aiComment]);
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#161b22]">
      {/* Code Panel */}
      <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {fileName}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ({language})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {enableAI && (
                <button
                  onClick={generateAIComment}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                >
                  <Bot className="w-3 h-3" />
                  AI Review
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="font-mono text-sm">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1;
              const lineComments = comments.filter(c => c.line === lineNumber && !c.resolved);
              
              return (
                <div
                  key={lineNumber}
                  className={`group flex hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 py-1 cursor-pointer ${
                    selectedLine === lineNumber ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedLine(lineNumber)}
                >
                  <span className="text-slate-400 dark:text-slate-500 select-none w-8 text-right pr-4">
                    {lineNumber}
                  </span>
                  <span className="flex-1 text-slate-800 dark:text-slate-200">{line}</span>
                  {lineComments.length > 0 && (
                    <div className="ml-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                        {lineComments.length}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      <div className="w-96 flex flex-col border-l border-slate-200 dark:border-slate-700">
        {/* Active Users */}
        {enableCollaboration && (
          <div className="border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active Reviewers
              </span>
            </div>
            <div className="space-y-2">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {user.name}
                  </span>
                  {user.role === 'ai' && <Bot className="w-3 h-3 text-purple-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-lg p-3 ${
                comment.resolved 
                  ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50' 
                  : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
              }`}
            >
              {comment.isPinned && (
                <div className="flex items-center gap-1 mb-2">
                  <Pin className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Pinned
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.author.name.charAt(0)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {comment.author.name}
                    </span>
                    {getRoleBadge(comment.author.role)}
                    {comment.aiGenerated && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-600 dark:text-purple-400">AI</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {getCommentIcon(comment.type)}
                    {comment.line && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Line {comment.line}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    {comment.content}
                  </p>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                            {reply.author.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {reply.author.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatTime(reply.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {comment.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>
                    <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                      <Flag className="w-3 h-3" />
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          {selectedLine && (
            <div className="mb-2 text-xs text-blue-600 dark:text-blue-400">
              Commenting on line {selectedLine}
            </div>
          )}
          
          <div className="flex gap-2 mb-2">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as Comment['type'])}
              className="text-xs px-2 py-1 border border-slate-300 rounded dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="general">General</option>
              <option value="suggestion">Suggestion</option>
              <option value="issue">Issue</option>
              <option value="praise">Praise</option>
              <option value="question">Question</option>
            </select>
            
            {selectedLine && (
              <button
                onClick={() => setSelectedLine(null)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear line selection
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              rows={3}
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
