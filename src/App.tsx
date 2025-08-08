import { SearchProvider } from './contexts/SearchContext';
import { SearchInterface } from './components/SearchInterface';
import { ResultsList } from './components/ResultsList';
import { Toaster } from './components/ui/sonner';
import { Github, Search, Sparkles } from 'lucide-react';

function App() {
  return (
    <SearchProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute top-80 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '2s' }}
            ></div>
            <div
              className="absolute -bottom-40 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '4s' }}
            ></div>
          </div>

          <div className="relative">
            <div className="px-4 py-8 max-w-7xl">
              {/* Main Header */}
              <header className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                    <Github className="w-8 h-8 text-white" />
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    GitHub Issue
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Searcher Pro
                  </span>
                </h1>

                <div className="max-w-3xl mx-auto space-y-4">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Search issues and pull requests in any public GitHub repository using
                    <span className="font-semibold text-blue-600"> AI-powered analysis</span> and
                    <span className="font-semibold text-purple-600"> natural language queries</span>
                  </p>

                  <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>AI-Enhanced Search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: '1s' }}
                      ></div>
                      <span>Comprehensive Results</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                        style={{ animationDelay: '2s' }}
                      ></div>
                      <span>Real-time Analysis</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Search Interface */}
              <div className="mb-8">
                <SearchInterface />
              </div>

              {/* Results */}
              <ResultsList />

              {/* Footer */}
              <footer className="mt-20 pt-12 border-t border-gray-200/50">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Github className="w-5 h-5" />
                    <span className="text-sm">
                      Built with React, TypeScript, and AI •
                      <span className="font-medium text-gray-700 ml-1">Enhanced with OpenAI GPT-4</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>Supports GitHub API v3</span>
                    <span>•</span>
                    <span>Real-time repository analysis</span>
                    <span>•</span>
                    <span>Natural language processing</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </div>
      </div>
    </SearchProvider>
  );
}

export default App;
