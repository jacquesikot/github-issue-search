import { 
  ExternalLink, 
  Calendar, 
  GitPullRequest, 
  AlertCircle, 
  CheckCircle2, 
  GitMerge, 
  User, 
  MessageSquare,
  Brain,
  Hash,
  Sparkles,
  TrendingUp
} from 'lucide-react';
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

function getRelevanceColor(similarity: number): string {
  if (similarity >= 0.8) return 'from-emerald-400 to-emerald-500';
  if (similarity >= 0.6) return 'from-blue-400 to-blue-500';
  if (similarity >= 0.4) return 'from-yellow-400 to-yellow-500';
  return 'from-gray-400 to-gray-500';
}

function getRelevanceLabel(similarity: number): string {
  if (similarity >= 0.8) return 'Highly Relevant';
  if (similarity >= 0.6) return 'Very Relevant';
  if (similarity >= 0.4) return 'Relevant';
  return 'Somewhat Relevant';
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
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded ml-4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-14"></div>
                </div>
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
      <Card className="text-center py-16 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent>
          <div className="text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xl font-semibold mb-2">No results found</p>
            <p className="text-gray-600">
              Try adjusting your search query or filters. Consider using different keywords or removing some filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Search Results
          </h2>
          <p className="text-gray-600 mt-1">
            Found {state.totalCount} {state.totalCount === 1 ? 'result' : 'results'}
            {state.searchMethod === 'llm-powered' && (
              <span className="ml-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Enhanced
                </Badge>
              </span>
            )}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="text-lg px-4 py-2 bg-blue-100 text-blue-700 border-blue-200"
        >
          {state.totalCount}
        </Badge>
      </div>

      {/* Results Grid */}
      <div className="grid gap-6">
        {state.results.map((issue, index) => (
          <Card
            key={issue.id}
            className="hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] border-0 shadow-lg bg-white"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Top Row: Status, Number, Relevance */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`${getStateColor(issue)} shadow-sm`}>
                      {getStateIcon(issue)}
                      <span className="ml-1 font-medium">{getStateLabel(issue)}</span>
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      <Hash className="w-3 h-3 mr-1" />
                      {issue.number}
                    </Badge>
                    {issue.similarity !== undefined && (
                      <Badge
                        className={`bg-gradient-to-r ${getRelevanceColor(issue.similarity)} text-white shadow-sm`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {getRelevanceLabel(issue.similarity)}
                        <span className="ml-1">({Math.round(issue.similarity * 100)}%)</span>
                      </Badge>
                    )}
                    {index < 3 && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Top Result
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {issue.title}
                  </h3>

                  {/* AI Reasoning (if available) */}
                  {issue.reasoning && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">AI Analysis</span>
                        {issue.matchTypes && (
                          <div className="flex gap-1">
                            {issue.matchTypes.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {issue.reasoning}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="ml-4 shrink-0 hover:bg-gray-50 transition-colors"
                >
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {issue.body && (
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Description</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {issue.body.length > 300 ? `${issue.body.substring(0, 300)}...` : issue.body}
                  </p>
                </div>
              )}

              {/* Metadata Row */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <img
                      src={issue.user.avatar_url}
                      alt={issue.user.login}
                      className="w-6 h-6 rounded-full border border-gray-200"
                    />
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{issue.user.login}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(issue.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {formatDate(issue.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Labels:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.slice(0, 8).map((label) => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: `#${label.color}15`,
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
                    {issue.labels.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{issue.labels.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / Pagination could go here */}
      {state.results.length >= 50 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Showing top {state.results.length} results. Refine your search for more specific results.
          </p>
        </div>
      )}
    </div>
  );
}
