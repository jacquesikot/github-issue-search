# GitHub Issue Searcher

A modern web application that allows users to search issues and pull requests in any public GitHub repository using natural language queries. Built with React, TypeScript, and powered by AI-driven semantic search.

## Features

### Core Functionality
- **Natural Language Search**: Search using plain English queries like "authentication bug in login API" or "memory leak in v2.0 release"
- **Repository-Specific Search**: Search within any public GitHub repository
- **Smart Filtering**: Filter by issue type (Issues/PRs/Both), state (Open/Closed/All), and labels
- **Semantic Search**: Uses OpenAI embeddings for intelligent result ranking (with keyword fallback)

### User Experience
- **Clean, Modern Interface**: Responsive design optimized for all devices
- **Real-time Search**: Fast search results with loading states and error handling
- **Rich Result Display**: Shows issue metadata, labels, creation dates, and direct GitHub links
- **Visual State Indicators**: Clear badges and icons for issue states and types

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **GitHub REST API** for fetching repository data
- **OpenAI API** for semantic search capabilities
- **Keyword-based fallback** when AI is unavailable

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Optional: OpenAI API key for enhanced semantic search

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   npm run install-server
   ```

3. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key for semantic search
   ```

### Development

1. **Start the backend server:**
   ```bash
   npm run server
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## Usage

1. **Enter Repository URL**: Paste any public GitHub repository URL (e.g., `https://github.com/facebook/react`)

2. **Enter Search Query**: Describe what you're looking for in natural language:
   - "authentication issues"
   - "memory leak in rendering"
   - "performance improvements"
   - "bug fixes for API endpoints"

3. **Apply Filters** (optional):
   - **Type**: Issues only, PRs only, or both
   - **State**: Open, closed, or all states

4. **Search**: Click the search button to get results

5. **View Results**: Click on any result to open it directly on GitHub

## API Endpoints

### POST `/api/search`
Search for issues and pull requests in a GitHub repository.

**Request Body:**
```json
{
  "repository": "owner/repo or full GitHub URL",
  "query": "natural language search query",
  "filters": {
    "type": "all|issues|prs",
    "state": "all|open|closed"
  }
}
```

**Response:**
```json
{
  "results": [...],
  "totalCount": 42,
  "availableLabels": [...]
}
```

### GET `/api/health`
Health check endpoint for monitoring.

## Features in Detail

### Natural Language Processing
- **Semantic Search**: When OpenAI API key is configured, the app uses text embeddings to understand query intent and context
- **Keyword Fallback**: Robust keyword-based search when AI features are unavailable
- **Smart Ranking**: Results are ranked by relevance to your query

### GitHub Integration
- **Public Repository Support**: Works with any publicly accessible GitHub repository
- **Real-time Data**: Fetches the latest issues and pull requests directly from GitHub
- **Rich Metadata**: Displays labels, assignees, creation dates, and states

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Loading States**: Clear visual feedback during searches
- **Error Handling**: Helpful error messages for invalid repositories or network issues
- **Direct Links**: Every result links directly to the original GitHub issue or PR

## Configuration

### Environment Variables
- `OPENAI_API_KEY` (optional): Enable semantic search with OpenAI embeddings
- `PORT` (optional): Backend server port (default: 3001)

### Search Behavior
- Without OpenAI API key: Uses keyword-based search with title, body, and label matching
- With OpenAI API key: Uses semantic embeddings for more intelligent result ranking
- Results are limited to 50 items per search for optimal performance

## Limitations

- **Public repositories only**: No support for private repositories (no authentication required)
- **GitHub API rate limits**: 60 requests/hour for unauthenticated requests
- **Result limit**: Maximum 50 results per search
- **Text length**: Issue/PR content is truncated for embedding generation

## Contributing

This is an MVP implementation focusing on core functionality and user experience. Potential improvements:

- Authentication for private repository access
- Advanced filtering options
- Search history and saved searches
- Batch operations and export features
- Enhanced analytics and insights

## License

MIT License - see LICENSE file for details.