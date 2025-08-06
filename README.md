# GitHub Issue Searcher Pro 🚀

A next-generation web application that revolutionizes how you search GitHub issues and pull requests. Built with cutting-edge AI technology and modern web frameworks to deliver contextually relevant results through natural language queries.

![GitHub Issue Searcher Pro](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![AI-Powered](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🧠 AI-Powered Search Engine
- **LLM-Enhanced Analysis**: Uses OpenAI GPT-4 for contextual understanding of queries
- **Semantic Matching**: Goes beyond keyword matching to understand intent and meaning  
- **Intelligent Ranking**: AI analyzes relevance across multiple dimensions (content, labels, context, temporal relevance)
- **Natural Language Queries**: Search using plain English like *"authentication bug in login API"* or *"memory leak in v2.0 release"*
- **Structured Analysis**: AI provides reasoning for why each result matches your query

### 🔍 Advanced Repository Integration
- **Comprehensive Data Fetching**: Retrieves complete repository metadata, labels, milestones, and releases
- **GitHub Token Support**: Enhanced API access with higher rate limits and private repo support
- **Real-time Repository Info**: Live repository statistics, languages, and metadata display
- **Pagination Support**: Fetches up to 300+ issues/PRs with intelligent pagination
- **Label Auto-completion**: Dynamic filtering with all available repository labels

### 🎨 Modern User Experience  
- **Professional UI/UX**: Clean, modern interface with glassmorphism effects and animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Results**: Clickable labels, hover effects, and intuitive navigation
- **Loading States**: Beautiful animated loading screens and skeleton components
- **Error Handling**: Comprehensive error messages with suggested solutions
- **Toast Notifications**: Real-time feedback for all user actions

### 🚀 Performance & Reliability
- **Intelligent Fallback**: Graceful degradation from AI to keyword-based search
- **Caching Strategy**: Efficient data caching for improved performance
- **Rate Limit Handling**: Smart API usage to prevent rate limiting
- **Error Recovery**: Robust error handling with automatic retries

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety and modern development
- **Vite** for lightning-fast development and building  
- **Tailwind CSS** with custom animations and glassmorphism effects
- **shadcn/ui** for consistent, accessible component library
- **Lucide React** for beautiful, consistent icons

### Backend  
- **Node.js** with Express for robust server-side processing
- **GitHub REST API v3** for comprehensive repository data
- **OpenAI API** with GPT-4 for intelligent search analysis
- **Advanced Pagination** for handling large result sets

### AI & Intelligence
- **OpenAI GPT-4o-mini** for fast, cost-effective analysis
- **Structured JSON Output** for consistent AI responses
- **Context-Aware Prompting** for better search understanding
- **Multi-factor Analysis** considering content, labels, temporal, and semantic relevance

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** installed on your system
- **Git** for cloning the repository
- **OpenAI API Key** (optional, for AI-enhanced search)
- **GitHub Token** (optional, for enhanced API access)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/github-issue-search-pro.git
   cd github-issue-search-pro
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies  
   npm run install-server
   ```

3. **Configure Environment** (Optional but Recommended)
   ```bash
   # Create environment file in server directory
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   # OpenAI API Key for AI-powered search (highly recommended)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # GitHub Token for enhanced API access (optional)
   GITHUB_TOKEN=your_github_token_here
   
   # Server Port (optional, defaults to 3001)
   PORT=3001
   ```

4. **Start the Application**
   ```bash
   # Terminal 1: Start the backend server
   npm run server
   
   # Terminal 2: Start the frontend development server  
   npm run dev
   ```

5. **Open Your Browser**
   ```
   http://localhost:5173
   ```

### Production Deployment

```bash
# Build the frontend
npm run build

# Start production server
cd server && npm start
```

## 🎯 Usage Guide

### Basic Search
1. **Enter Repository**: Paste a GitHub repository URL or use the format `owner/repo`
   - ✅ `https://github.com/facebook/react`
   - ✅ `facebook/react`
   
2. **Write Your Query**: Use natural language to describe what you're looking for
   - *"Authentication bugs in the login system"*
   - *"Memory leaks related to React hooks"*  
   - *"Performance issues in version 2.x"*
   - *"TypeScript errors in components"*

3. **Apply Filters**: Refine your search with advanced filters
   - **Type**: Issues only, PRs only, or both
   - **State**: Open, closed, or all
   - **Labels**: Select from repository-specific labels

### Advanced Features

**AI Analysis**: When OpenAI API key is configured, you'll see:
- 🧠 **AI Analysis** sections explaining why results match
- 📊 **Relevance Scores** with visual indicators
- 🎯 **Match Types** showing what aspects matched (title, content, labels, context)
- 🌟 **Top Results** highlighting the most relevant matches

**Repository Intelligence**: 
- 📋 **Live Repository Stats** (stars, forks, open issues)
- 🏷️ **Comprehensive Labels** with color-coding
- 📅 **Recent Activity** and update information
- 🔗 **Direct Links** to GitHub repository

**Enhanced Results**:
- 👤 **Author Information** with avatars
- 📅 **Creation & Update Dates**
- 🏷️ **Interactive Labels** (click to filter)
- 📝 **Smart Descriptions** with truncation
- 🔗 **Direct GitHub Links**

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI-powered search | Keyword search fallback |
| `GITHUB_TOKEN` | No | GitHub personal access token | Public API only |
| `PORT` | No | Server port number | 3001 |

### GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. Select scopes: `public_repo` (for public repositories) or `repo` (for private access)
4. Add to your `.env` file

### OpenAI API Key Setup

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to your `.env` file
4. Ensure you have sufficient credits for API usage

## 📊 API Endpoints

### Search API
```http
POST /api/search
Content-Type: application/json

{
  "repository": "facebook/react",
  "query": "authentication bug",
  "filters": {
    "state": "open",
    "type": "issues",
    "labels": ["bug", "security"]
  }
}
```

### Repository Info API
```http
GET /api/repository/:owner/:repo/info
```

### Health Check
```http
GET /api/health
```

## 🧪 Development

### Scripts
```bash
npm run dev          # Start frontend development server
npm run server       # Start backend development server  
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
github-issue-search-pro/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components  
│   │   ├── SearchInterface.tsx
│   │   └── ResultsList.tsx
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utility functions
├── server/                # Backend source code  
│   ├── index.js           # Express server
│   └── package.json       # Backend dependencies
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 API that powers our intelligent search
- **GitHub** for their comprehensive REST API
- **shadcn/ui** for the beautiful, accessible component library
- **Tailwind CSS** for the utility-first CSS framework
- **React** and **TypeScript** teams for the amazing development experience

## 📞 Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/yourusername/github-issue-search-pro/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/github-issue-search-pro/discussions)
- 📧 **Contact**: support@yourproject.com

---

<div align="center">
  <p>Built with ❤️ by developers, for developers</p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> • 
    <a href="#-usage-guide">Usage</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>