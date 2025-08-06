import React from 'react';
import { ExternalLink, Calendar, GitPullRequest, AlertCircle, CheckCircle2, GitMerge } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useSearch } from '../contexts/SearchContext';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStateColor(issue: any) {
  if (issue.pull_request) {
    if (issue.pull_request.merged_at) return 'bg-purple-100 text-purple-800 border-purple-200';
    return issue.state === 'open'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }
  return issue.state === 'open'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
}

function getStateIcon(issue: any) {
  if (issue.pull_request) {
    if (issue.pull_request.merged_at) return <GitMerge className="w-4 h-4" />;
    return issue.state === 'open' ? <GitPullRequest className="w-4 h-4" /> : <GitPullRequest className="w-4 h-4" />;
  }
  return issue.state === 'open' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />;
}

function getStateLabel(issue: any) {
  if (issue.pull_request) {
    if (issue.pull_request.merged_at) return 'Merged';
    return issue.state === 'open' ? 'Open PR' : 'Closed PR';
  }
  return issue.state === 'open' ? 'Open Issue' : 'Closed Issue';
}

export function ResultsList() {
  const { state, dispatch } = useSearch();

  const handleLabelClick = (labelName: string) => {
    if (!state.filters.labels.includes(labelName)) {
      const newLabels = [...state.filters.labels, labelName];
      dispatch({ type: 'SET_FILTERS', payload: { labels: newLabels } });
    }
  };

  if (state.loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (state.results.length === 0 && !state.loading && !state.error) {
    return null;
  }

  if (state.results.length === 0 && !state.loading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No results found</p>
            <p>Try adjusting your search query or filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
        <Badge variant="secondary" className="text-sm">
          {state.totalCount} {state.totalCount === 1 ? 'result' : 'results'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {state.results.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Badge className={getStateColor(issue)}>
                      {getStateIcon(issue)}
                      <span className="ml-1">{getStateLabel(issue)}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">#{issue.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">{issue.title}</h3>
                </div>
                <Button variant="outline" size="sm" asChild className="ml-4 shrink-0">
                  <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </a>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {issue.body && (
                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                  {issue.body.length > 200 ? `${issue.body.substring(0, 200)}...` : issue.body}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <img src={issue.user.avatar_url} alt={issue.user.login} className="w-5 h-5 rounded-full" />
                    <span>@{issue.user.login}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(issue.created_at)}</span>
                  </div>
                </div>
              </div>

              {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {issue.labels.slice(0, 5).map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                      style={{
                        backgroundColor: `#${label.color}20`,
                        borderColor: `#${label.color}40`,
                        color: `#${label.color}`,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLabelClick(label.name);
                      }}
                      title={`Click to filter by "${label.name}"`}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {issue.labels.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{issue.labels.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
