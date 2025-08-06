import React, { useState, useEffect } from 'react';
import { Search, Github, Loader2, X, Tag, Star, GitFork, Calendar, Eye, Sparkles, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { useSearch } from '../contexts/SearchContext';
import { toast } from 'sonner';

export function SearchInterface() {
  const { state, dispatch, searchIssues, fetchRepositoryInfo } = useSearch();
  const [repoUrl, setRepoUrl] = useState('');

  const validateAndSetRepository = (url: string) => {
    const githubRepoRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/;
    const shortFormRegex = /^([^/]+)\/([^/]+)$/;
    
    let match = url.match(githubRepoRegex);
    if (match) {
      const repoPath = `${match[1]}/${match[2]}`;
      dispatch({ type: 'SET_REPOSITORY', payload: repoPath });
      return true;
    }
    
    match = url.match(shortFormRegex);
    if (match) {
      const repoPath = `${match[1]}/${match[2]}`;
      dispatch({ type: 'SET_REPOSITORY', payload: repoPath });
      return true;
    }
    
    return false;
  };

  const handleRepoUrlChange = (url: string) => {
    setRepoUrl(url);
    if (url.trim()) {
      const isValid = validateAndSetRepository(url);
      if (!isValid) {
        toast.error('Please provide a valid GitHub repository URL or owner/repo format');
      }
    }
  };

  // Fetch repository info when repository changes
  useEffect(() => {
    if (state.repository) {
      fetchRepositoryInfo();
    }
  }, [state.repository]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.repository) {
      toast.error('Please provide a valid GitHub repository URL');
      return;
    }

    if (!state.query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    await searchIssues();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Repository Info Card */}
      {state.repositoryInfo && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Github className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {state.repositoryInfo.full_name}
                  </h2>
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {state.repositoryInfo.language || 'N/A'}
                  </Badge>
                </div>
                {state.repositoryInfo.description && (
                  <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                    {state.repositoryInfo.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{formatNumber(state.repositoryInfo.stargazers_count)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{formatNumber(state.repositoryInfo.forks_count)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(state.repositoryInfo.open_issues_count)} open issues</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {new Date(state.repositoryInfo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 ml-4"
                asChild
              >
                <a 
                  href={`https://github.com/${state.repositoryInfo.full_name}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  View Repo
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Interface Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced GitHub Search
            </h1>
          </div>
          <p className="text-center text-gray-600 mt-2">
            Powered by AI for contextually relevant results
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Repository URL Input */}
            <div className="space-y-3">
              <label htmlFor="repo-url" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Github className="w-4 h-4" />
                Repository
                <span className="text-xs text-gray-500 font-normal">
                  (URL or owner/repo format)
                </span>
              </label>
              <div className="relative">
                <Input
                  id="repo-url"
                  placeholder="https://github.com/facebook/react or facebook/react"
                  value={repoUrl}
                  onChange={(e) => handleRepoUrlChange(e.target.value)}
                  className="text-base h-12 pl-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {state.repository && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <Database className="w-3 h-3 mr-1" />
                    {state.repository}
                  </Badge>
                </div>
              )}
            </div>

            {/* Search Query Input */}
            <div className="space-y-3">
              <label htmlFor="search-query" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Search Query
                <span className="text-xs text-gray-500 font-normal">
                  (Natural language supported)
                </span>
              </label>
              <div className="relative">
                <Input
                  id="search-query"
                  placeholder="authentication bug in login API, memory leak in v2.0, React hooks error..."
                  value={state.query}
                  onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
                  className="text-base h-12 pl-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select
                  value={state.filters.type}
                  onValueChange={(value: 'all' | 'issues' | 'prs') =>
                    dispatch({ type: 'SET_FILTERS', payload: { type: value } })
                  }
                >
                  <SelectTrigger className="bg-gray-50/50 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Issues & PRs</SelectItem>
                    <SelectItem value="issues">Issues Only</SelectItem>
                    <SelectItem value="prs">Pull Requests Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Select
                  value={state.filters.state}
                  onValueChange={(value: 'all' | 'open' | 'closed') =>
                    dispatch({ type: 'SET_FILTERS', payload: { state: value } })
                  }
                >
                  <SelectTrigger className="bg-gray-50/50 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2 flex items-end">
                <Button
                  type="submit"
                  disabled={state.loading || !state.repository || !state.query.trim()}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search with AI
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Label Filters */}
            {state.availableLabels.length > 0 && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Filter by Labels
                    <Badge variant="outline" className="ml-1">
                      {state.availableLabels.length} available
                    </Badge>
                  </label>
                  {state.filters.labels.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_FILTERS', payload: { labels: [] } })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Selected Labels */}
                {state.filters.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {state.filters.labels.map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
                      >
                        {label}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            const newLabels = state.filters.labels.filter((l) => l !== label);
                            dispatch({ type: 'SET_FILTERS', payload: { labels: newLabels } });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Label Selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal bg-white hover:bg-gray-50"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      {state.filters.labels.length === 0
                        ? 'Select labels to filter by...'
                        : `${state.filters.labels.length} label${state.filters.labels.length === 1 ? '' : 's'} selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="max-h-60 overflow-y-auto">
                      <div className="p-3 border-b bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">Available Labels</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to add/remove labels from your search
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        {state.availableLabels.map((label) => {
                          const isSelected = state.filters.labels.includes(label);
                          return (
                            <div
                              key={label}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                              onClick={() => {
                                const newLabels = isSelected
                                  ? state.filters.labels.filter((l) => l !== label)
                                  : [...state.filters.labels, label];
                                dispatch({ type: 'SET_FILTERS', payload: { labels: newLabels } });
                              }}
                            >
                              <Checkbox checked={isSelected} />
                              <span className="text-sm flex-1 font-medium">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Clear Filters Button */}
            {(state.filters.state !== 'all' || state.filters.type !== 'all' || state.filters.labels.length > 0) && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: 'SET_FILTERS',
                      payload: { state: 'all', type: 'all', labels: [] },
                    })
                  }
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </form>

          {/* Search Summary */}
          {state.searchSummary && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Search Analysis
                  {state.searchMethod && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {state.searchMethod === 'llm-powered' ? 'AI-Powered' : 'Keyword-Based'}
                    </Badge>
                  )}
                </span>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">
                {state.searchSummary}
              </p>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{state.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
