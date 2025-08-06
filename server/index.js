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

app.use(cors());
app.use(express.json());

// Helper function to calculate cosine similarity
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

// Fetch issues/PRs from GitHub API
async function fetchGitHubIssues(owner, repo, type = 'all', state = 'all', perPage = 100) {
  const baseUrl = 'https://api.github.com';
  let items = [];

  try {
    // Fetch issues (which includes PRs in GitHub API)
    if (type === 'all' || type === 'issues') {
      const issuesUrl = `${baseUrl}/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&sort=updated`;
      const response = await fetch(issuesUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Issue-Searcher',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues = await response.json();

      if (type === 'issues') {
        // Filter out pull requests (they have pull_request property)
        items = issues.filter((item) => !item.pull_request);
      } else if (type === 'prs') {
        // Only pull requests
        items = issues.filter((item) => item.pull_request);
      } else {
        items = issues;
      }
    }

    return items;
  } catch (error) {
    throw new Error(`Failed to fetch from GitHub: ${error.message}`);
  }
}

// Get embeddings for text using OpenAI
async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit text length
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate embeddings');
  }
}

// Search endpoint
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

    // Fetch issues/PRs from GitHub
    console.log(`Fetching ${type} from ${owner}/${repo}...`);
    let items = await fetchGitHubIssues(owner, repo, type, state);

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
        availableLabels: [],
      });
    }

    // Get unique labels from all items
    const allLabels = new Set();
    items.forEach((item) => {
      item.labels.forEach((label) => allLabels.add(label.name));
    });
    const availableLabels = Array.from(allLabels).sort();

    // If OpenAI API key is available, use semantic search
    if (openai) {
      console.log('Using semantic search with OpenAI embeddings...');

      try {
        // Get query embedding
        const queryEmbedding = await getEmbedding(query);

        // Calculate similarities and score items
        const scoredItems = await Promise.all(
          items.map(async (item) => {
            const itemText = `${item.title} ${item.body || ''}`;
            try {
              const itemEmbedding = await getEmbedding(itemText);
              const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
              return { ...item, similarity };
            } catch (error) {
              console.error('Error calculating similarity for item:', item.number, error);
              // Fallback to keyword matching
              const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
              const bodyMatch = (item.body || '').toLowerCase().includes(query.toLowerCase());
              return { ...item, similarity: titleMatch ? 0.8 : bodyMatch ? 0.6 : 0.1 };
            }
          })
        );

        // Sort by similarity and take top results
        const sortedResults = scoredItems.sort((a, b) => b.similarity - a.similarity).slice(0, 50); // Limit results

        return res.json({
          results: sortedResults,
          totalCount: sortedResults.length,
          availableLabels,
        });
      } catch (error) {
        console.error('Semantic search failed, falling back to keyword search:', error);
      }
    }

    // Fallback to keyword-based search
    console.log('Using keyword-based search...');
    const queryLower = query.toLowerCase();
    const keywordResults = items
      .map((item) => {
        const titleMatch = item.title.toLowerCase().includes(queryLower);
        const bodyMatch = (item.body || '').toLowerCase().includes(queryLower);
        const labelMatch = item.labels.some((label) => label.name.toLowerCase().includes(queryLower));

        let score = 0;
        if (titleMatch) score += 3;
        if (bodyMatch) score += 2;
        if (labelMatch) score += 1;

        return { ...item, similarity: score / 6 }; // Normalize to 0-1
      })
      .filter((item) => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50);

    res.json({
      results: keywordResults,
      totalCount: keywordResults.length,
      availableLabels,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // console.log(
  //   `OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured (will use keyword search)'}`
  // );
});
