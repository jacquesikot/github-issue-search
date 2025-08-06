import React from 'react';
import { SearchProvider } from './contexts/SearchContext';
import { SearchInterface } from './components/SearchInterface';
import { ResultsList } from './components/ResultsList';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              GitHub Issue Searcher
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search issues and pull requests in any public GitHub repository using natural language queries
            </p>
          </header>
          
          <SearchInterface />
          <ResultsList />
        </div>
        <Toaster />
      </div>
    </SearchProvider>
  );
}

export default App;