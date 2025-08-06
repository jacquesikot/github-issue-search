import React, { useState } from 'react';
import { Search, Github, Loader2, X, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { useSearch } from '../contexts/SearchContext';
import { toast } from 'sonner';

export function SearchInterface() {
  const { state, dispatch, searchIssues } = useSearch();
  const [repoUrl, setRepoUrl] = useState('');

  const validateAndSetRepository = (url: string) => {
    const githubRepoRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = url.match(githubRepoRegex);

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
      if (!isValid && url.includes('github.com')) {
        toast.error('Please provide a valid GitHub repository URL');
      }
    }
  };

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

  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Repository URL Input */}
          <div className="space-y-2">
            <label htmlFor="repo-url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub Repository URL
            </label>
            <Input
              id="repo-url"
              type="url"
              placeholder="https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => handleRepoUrlChange(e.target.value)}
              className="text-base h-12"
            />
            {state.repository && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  {state.repository}
                </Badge>
              </div>
            )}
          </div>

          {/* Search Query Input */}
          <div className="space-y-2">
            <label htmlFor="search-query" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Query
            </label>
            <Input
              id="search-query"
              placeholder="e.g., authentication bug in login API, memory leak in v2.0 release"
              value={state.query}
              onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
              className="text-base h-12"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select
                value={state.filters.type}
                onValueChange={(value: 'all' | 'issues' | 'prs') =>
                  dispatch({ type: 'SET_FILTERS', payload: { type: value } })
                }
              >
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={state.loading || !state.repository || !state.query.trim()}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {state.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(state.filters.state !== 'all' || state.filters.type !== 'all' || state.filters.labels.length > 0) && (
            <div className="flex justify-end">
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

          {/* Label Filters */}
          {state.availableLabels.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Filter by Labels
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
                        className="w-3 h-3 cursor-pointer hover:text-blue-600"
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
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                    <Tag className="w-4 h-4 mr-2" />
                    {state.filters.labels.length === 0
                      ? 'Select labels to filter by...'
                      : `${state.filters.labels.length} label${state.filters.labels.length === 1 ? '' : 's'} selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">Available Labels</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {state.availableLabels.map((label) => {
                        const isSelected = state.filters.labels.includes(label);
                        return (
                          <div
                            key={label}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => {
                              const newLabels = isSelected
                                ? state.filters.labels.filter((l) => l !== label)
                                : [...state.filters.labels, label];
                              dispatch({ type: 'SET_FILTERS', payload: { labels: newLabels } });
                            }}
                          >
                            <Checkbox checked={isSelected} />
                            <span className="text-sm flex-1">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </form>

        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
