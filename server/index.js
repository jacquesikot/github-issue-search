import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI client only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// GitHub token for enhanced API access
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.use(cors());
app.use(express.json());

// Helper function to calculate cosine similarity (kept for backward compatibility)
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Parse GitHub repository URL
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// Enhanced GitHub API headers with optional token
function getGitHubHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Issue-Searcher-Pro',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return headers;
}

// Fetch comprehensive repository metadata
async function fetchRepositoryMetadata(owner, repo) {
  const baseUrl = 'https://api.github.com';
  const headers = getGitHubHeaders();
  
  try {
    // Fetch repository details
    const repoResponse = await fetch(`${baseUrl}/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) {
      throw new Error(`Repository not found: ${repoResponse.status} ${repoResponse.statusText}`);
    }
    const repoData = await repoResponse.json();

    // Fetch repository labels
    const labelsResponse = await fetch(`${baseUrl}/repos/${owner}/${repo}/labels?per_page=100`, { headers });
    const labels = labelsResponse.ok ? await labelsResponse.json() : [];

    // Fetch milestones
    const milestonesResponse = await fetch(`${baseUrl}/repos/${owner}/${repo}/milestones?state=all&per_page=100`, { headers });
    const milestones = milestonesResponse.ok ? await milestonesResponse.json() : [];

    // Fetch releases/tags
    const releasesResponse = await fetch(`${baseUrl}/repos/${owner}/${repo}/releases?per_page=50`, { headers });
    const releases = releasesResponse.ok ? await releasesResponse.json() : [];

    return {
      repository: repoData,
      labels: labels,
      milestones: milestones,
      releases: releases
    };
  } catch (error) {
    throw new Error(`Failed to fetch repository metadata: ${error.message}`);
  }
}

// Enhanced function to fetch all issues/PRs with pagination
async function fetchAllGitHubIssues(owner, repo, type = 'all', state = 'all', maxPages = 5) {
  const baseUrl = 'https://api.github.com';
  const headers = getGitHubHeaders();
  let allItems = [];
  let page = 1;
  const perPage = 100;

  try {
    while (page <= maxPages) {
      const issuesUrl = `${baseUrl}/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
      const response = await fetch(issuesUrl, { headers });

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        break; // Stop if we hit an error on subsequent pages
      }

      const issues = await response.json();
      if (issues.length === 0) break; // No more issues

      let filteredIssues;
      if (type === 'issues') {
        filteredIssues = issues.filter((item) => !item.pull_request);
      } else if (type === 'prs') {
        filteredIssues = issues.filter((item) => item.pull_request);
      } else {
        filteredIssues = issues;
      }

      allItems = allItems.concat(filteredIssues);
      
      if (issues.length < perPage) break; // Last page
      page++;
    }

    return allItems;
  } catch (error) {
    throw new Error(`Failed to fetch from GitHub: ${error.message}`);
  }
}

// LLM-powered search analysis
async function analyzeSearchWithLLM(query, issues, repositoryContext) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Prepare context for LLM
    const issuesSummary = issues.slice(0, 50).map((issue, index) => ({
      index,
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body ? issue.body.substring(0, 500) : '',
      state: issue.state,
      labels: issue.labels.map(l => l.name),
      isPR: !!issue.pull_request,
      created_at: issue.created_at,
      user: issue.user.login
    }));

    const prompt = `You are an expert at analyzing GitHub issues and pull requests to find the most relevant matches for user queries.

REPOSITORY CONTEXT:
- Repository: ${repositoryContext.repository.full_name}
- Description: ${repositoryContext.repository.description || 'No description'}
- Language: ${repositoryContext.repository.language || 'Unknown'}
- Available Labels: ${repositoryContext.labels.map(l => l.name).join(', ')}

USER QUERY: "${query}"

ISSUES/PRs TO ANALYZE:
${JSON.stringify(issuesSummary, null, 2)}

Please analyze which issues/PRs are most relevant to the user's query. Consider:
1. Direct keyword matches in title and body
2. Semantic similarity and context
3. Label relevance
4. Issue type relevance (bug reports vs feature requests vs PRs)
5. Temporal relevance (recent issues might be more relevant for current problems)

Return a JSON object with this structure:
{
  "matches": [
    {
      "index": number,
      "relevanceScore": number (0-1),
      "reasoning": "brief explanation of why this matches",
      "matchTypes": ["title", "content", "labels", "context"]
    }
  ],
  "summary": "brief summary of search results quality"
}

Only include matches with relevanceScore > 0.1. Order by relevance score descending.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Apply the LLM analysis to rank issues
    const rankedIssues = analysis.matches.map(match => ({
      ...issues[match.index],
      similarity: match.relevanceScore,
      reasoning: match.reasoning,
      matchTypes: match.matchTypes
    }));

    return {
      results: rankedIssues,
      summary: analysis.summary
    };
  } catch (error) {
    console.error('LLM analysis error:', error);
    throw new Error(`LLM analysis failed: ${error.message}`);
  }
}

// Enhanced repository info endpoint
app.get('/api/repository/:owner/:repo/info', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const metadata = await fetchRepositoryMetadata(owner, repo);
    res.json(metadata);
  } catch (error) {
    console.error('Repository info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { repository, query, filters = {} } = req.body;

    if (!repository || !query) {
      return res.status(400).json({ error: 'Repository and query are required' });
    }

    // Parse repository URL
    const repoInfo = parseGitHubUrl(
      repository.includes('github.com') ? repository : `https://github.com/${repository}`
    );
    if (!repoInfo) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    const { owner, repo } = repoInfo;
    const { state = 'all', type = 'all', labels = [] } = filters;

    console.log(`Enhanced search in ${owner}/${repo} for: "${query}"`);

    // Fetch comprehensive repository metadata
    const repositoryContext = await fetchRepositoryMetadata(owner, repo);

    // Fetch all issues/PRs with enhanced pagination
    let items = await fetchAllGitHubIssues(owner, repo, type, state, 3); // Fetch up to 3 pages (300 items)

    // Filter by labels if specified
    if (labels.length > 0) {
      items = items.filter((item) => {
        const itemLabels = item.labels.map((label) => label.name);
        return labels.every((filterLabel) => itemLabels.includes(filterLabel));
      });
    }

    if (items.length === 0) {
      return res.json({
        results: [],
        totalCount: 0,
        availableLabels: repositoryContext.labels.map(l => l.name),
        repositoryInfo: repositoryContext.repository,
        searchSummary: 'No items found matching the criteria'
      });
    }

    const availableLabels = repositoryContext.labels.map(l => l.name).sort();

    // Use LLM-powered search if OpenAI is available
    if (openai) {
      console.log('Using LLM-powered contextual search analysis...');

      try {
        const llmAnalysis = await analyzeSearchWithLLM(query, items, repositoryContext);

        return res.json({
          results: llmAnalysis.results,
          totalCount: llmAnalysis.results.length,
          availableLabels,
          repositoryInfo: repositoryContext.repository,
          searchSummary: llmAnalysis.summary,
          searchMethod: 'llm-powered'
        });
      } catch (error) {
        console.error('LLM search failed, falling back to keyword search:', error);
      }
    }

    // Fallback to enhanced keyword-based search
    console.log('Using enhanced keyword-based search...');
    const queryLower = query.toLowerCase();
    const keywordResults = items
      .map((item) => {
        const titleMatch = item.title.toLowerCase().includes(queryLower);
        const bodyMatch = (item.body || '').toLowerCase().includes(queryLower);
        const labelMatch = item.labels.some((label) => label.name.toLowerCase().includes(queryLower));
        const userMatch = item.user.login.toLowerCase().includes(queryLower);

        let score = 0;
        if (titleMatch) score += 5;
        if (bodyMatch) score += 3;
        if (labelMatch) score += 2;
        if (userMatch) score += 1;

        return { ...item, similarity: score / 11 }; // Normalize to 0-1
      })
      .filter((item) => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50);

    res.json({
      results: keywordResults,
      totalCount: keywordResults.length,
      availableLabels,
      repositoryInfo: repositoryContext.repository,
      searchSummary: `Found ${keywordResults.length} matches using keyword search`,
      searchMethod: 'keyword-based'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      github_token: !!GITHUB_TOKEN,
      openai_api: !!openai
    }
  });
});

app.listen(port, () => {
  console.log(`GitHub Issue Searcher Pro Server running on port ${port}`);
  console.log(`GitHub Token: ${GITHUB_TOKEN ? 'Configured' : 'Not configured'}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});
