import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code2, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  height?: string;
  language?: string;
  theme?: 'light' | 'dark';
}

const languageTemplates = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log("Fibonacci of 10:", fibonacci(10));`,
  
  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test the function
print("Fibonacci of 10:", fibonacci(10))`,

  cpp: `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Fibonacci of 10: " << fibonacci(10) << endl;
    return 0;
}`,

  java: `// Java Example
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci of 10: " + fibonacci(10));
    }
}`
};

export default function CodeEditor({ height = '400px', language = 'javascript', theme = 'dark' }: CodeEditorProps) {
  const [code, setCode] = useState(languageTemplates[language as keyof typeof languageTemplates] || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Simulate code execution (in a real app, this would call a backend service)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (language === 'javascript') {
        // Simple JavaScript execution simulation
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
        };
        
        try {
          // Execute the code (this is a simplified simulation)
          const result = eval(code);
          if (result !== undefined) {
            logs.push(String(result));
          }
          setOutput(logs.join('\n'));
        } catch (err: any) {
          setError(err.message);
        } finally {
          console.log = originalLog;
        }
      } else {
        // For other languages, simulate output
        setOutput(`[${language.toUpperCase()} Output]\nFibonacci of 10: 55\n\nCode executed successfully!`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code');
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates] || '');
    setOutput('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117]">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-blue-500" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
        {/* Code Editor */}
        <div className="min-h-[400px]">
          <Editor
            height={height}
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-gray-50 dark:bg-[#0d1117]">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Output
            </h3>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm">
            {isRunning && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Running code...
              </div>
            )}
            
            {error && (
              <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="whitespace-pre-wrap">{error}</div>
              </div>
            )}
            
            {output && !error && (
              <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {output}
              </div>
            )}
            
            {!isRunning && !output && !error && (
              <div className="text-gray-500 dark:text-gray-400">
                Click "Run Code" to see the output
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117]">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            Language: <span className="font-medium text-gray-700 dark:text-gray-300">{language.toUpperCase()}</span>
          </div>
          <div>
            Press Ctrl+Enter to run code
          </div>
        </div>
      </div>
    </div>
  );
}
