import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import CodeEditor from '../components/CodeEditor';
import { Code2, Zap, BookOpen, Lightbulb, Target, Users } from 'lucide-react';

const codeSnippets = {
  'Array Methods': {
    javascript: `// JavaScript Array Methods
const numbers = [1, 2, 3, 4, 5];

// Map: Transform each element
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Filter: Get elements that match condition
const evens = numbers.filter(n => n % 2 === 0);
console.log("Even numbers:", evens);

// Reduce: Reduce array to single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// Chain methods together
const result = numbers
  .filter(n => n > 2)
  .map(n => n * 3)
  .reduce((acc, n) => acc + n, 0);
console.log("Chained result:", result);`,

    python: `# Python List Methods
numbers = [1, 2, 3, 4, 5]

# List comprehension: Transform each element
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# Filter: Get elements that match condition
evens = [n for n in numbers if n % 2 == 0]
print("Even numbers:", evens)

# Reduce function
from functools import reduce
sum_result = reduce(lambda acc, n: acc + n, numbers, 0)
print("Sum:", sum_result)

# Chain methods together
result = sum(n * 3 for n in numbers if n > 2)
print("Chained result:", result)`
  },

  'Async/Await': {
    javascript: `// Async/Await Example
async function fetchUserData(userId) {
  try {
    console.log("Fetching user data...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
      id: userId,
      name: "John Doe",
      email: "john@example.com"
    };
    
    console.log("User fetched:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}

// Usage
async function main() {
  const user = await fetchUserData(123);
  console.log("Done!");
}

main();`,

    python: `# Async/Await Example
import asyncio

async def fetch_user_data(user_id):
    try:
        print("Fetching user data...")
        
        # Simulate API call
        await asyncio.sleep(1)
        
        user = {
            "id": user_id,
            "name": "John Doe", 
            "email": "john@example.com"
        }
        
        print("User fetched:", user)
        return user
    except Exception as error:
        print("Error fetching user:", error)

# Usage
async def main():
    user = await fetch_user_data(123)
    print("Done!")

asyncio.run(main())`
  },

  'Data Structures': {
    javascript: `// JavaScript Data Structures
// Stack implementation
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}

// Usage
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);

console.log("Peek:", stack.peek()); // 3
console.log("Pop:", stack.pop());  // 3
console.log("Is empty:", stack.isEmpty()); // false`,

    python: `# Python Data Structures
# Stack implementation using list
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop()
    
    def peek(self):
        return self.items[-1]
    
    def is_empty(self):
        return len(self.items) == 0

# Usage
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)

print("Peek:", stack.peek())  # 3
print("Pop:", stack.pop())   # 3
print("Is empty:", stack.is_empty())  # False`
  }
};

export default function CodePlayground() {
  const theme = useThemeStore((s) => s.theme);
  const [selectedSnippet, setSelectedSnippet] = useState<keyof typeof codeSnippets>('Array Methods');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  const features = [
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Run your code instantly with our optimized execution engine'
    },
    {
      icon: BookOpen,
      title: 'Learn by Examples',
      description: 'Explore pre-built code snippets and examples'
    },
    {
      icon: Lightbulb,
      title: 'Smart Autocomplete',
      description: 'Get intelligent code suggestions as you type'
    },
    {
      icon: Target,
      title: 'Test Your Logic',
      description: 'Perfect for testing algorithms and problem-solving'
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Share your code with teammates and get feedback'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Code2 className="w-8 h-8 text-blue-500" />
            Code Playground
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Write, test, and share code in multiple programming languages
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'javascript' | 'python')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <Icon className="w-6 h-6 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Code Snippets */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Quick Examples
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(codeSnippets).map((snippet) => (
              <button
                key={snippet}
                onClick={() => setSelectedSnippet(snippet as keyof typeof codeSnippets)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSnippet === snippet
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {snippet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editor
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try the example above or write your own code
          </p>
        </div>
        
        <CodeEditor
          height="500px"
          language={language}
          theme={theme}
        />
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Pro Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> - Run code</li>
              <li>• <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+S</kbd> - Save code</li>
              <li>• <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+/</kbd> - Toggle comment</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Best Practices</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Write clean, readable code with proper indentation</li>
              <li>• Use meaningful variable names</li>
              <li>• Test your code with different inputs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
