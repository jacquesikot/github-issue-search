import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
  pull_request?: {
    url: string;
    merged_at: string | null;
  };
}

export interface SearchFilters {
  state: 'all' | 'open' | 'closed';
  type: 'all' | 'issues' | 'prs';
  labels: string[];
}

interface SearchState {
  repository: string;
  query: string;
  filters: SearchFilters;
  results: GitHubIssue[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  availableLabels: string[];
}

type SearchAction =
  | { type: 'SET_REPOSITORY'; payload: string }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULTS'; payload: { results: GitHubIssue[]; totalCount: number; availableLabels: string[] } }
  | { type: 'CLEAR_RESULTS' };

const initialState: SearchState = {
  repository: '',
  query: '',
  filters: {
    state: 'all',
    type: 'all',
    labels: []
  },
  results: [],
  loading: false,
  error: null,
  totalCount: 0,
  availableLabels: []
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_REPOSITORY':
      return { ...state, repository: action.payload, results: [], error: null };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_RESULTS':
      return { 
        ...state, 
        results: action.payload.results,
        totalCount: action.payload.totalCount,
        availableLabels: action.payload.availableLabels,
        loading: false,
        error: null 
      };
    case 'CLEAR_RESULTS':
      return { ...state, results: [], totalCount: 0, availableLabels: [] };
    default:
      return state;
  }
}

const SearchContext = createContext<{
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  searchIssues: () => Promise<void>;
} | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const searchIssues = async () => {
    if (!state.repository.trim() || !state.query.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please provide both repository URL and search query' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repository: state.repository,
          query: state.query,
          filters: state.filters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search issues');
      }

      const data = await response.json();
      dispatch({ 
        type: 'SET_RESULTS', 
        payload: {
          results: data.results,
          totalCount: data.totalCount,
          availableLabels: data.availableLabels
        }
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    }
  };

  return (
    <SearchContext.Provider value={{ state, dispatch, searchIssues }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}