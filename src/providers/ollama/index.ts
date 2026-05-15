import { SearchConfig, SearchHit, StructuredSearchResponse } from "../../types.js";
import { buildStructuredResponse, EMPTY_LENGTH } from "../shared/search.js";
import { formatUnhandledSearchError } from "../shared/errors.js";

// ── Types ──────────────────────────────────────────────────────────────

interface OllamaWebSearchResult {
  content: string;
  title: string;
  url: string;
}

interface OllamaWebSearchResponse {
  results: OllamaWebSearchResult[];
}

// ── Constants ──────────────────────────────────────────────────────────

const OLLAMA_WEB_SEARCH_ENDPOINT = "https://ollama.com/api/web_search";
const OK_STATUS = 200;

// ── Helpers ────────────────────────────────────────────────────────────

const buildSearchHit = (result: OllamaWebSearchResult): SearchHit => ({
  title: result.title,
  url: result.url,
});

const formatSearchText = (results: OllamaWebSearchResult[]): string => {
  const parts: string[] = [];
  for (const result of results) {
    parts.push(`${result.title}\n${result.content}`);
  }

  return parts.join("\n\n");
};

const buildStructuredSearchResponse = (
  query: string,
  results: OllamaWebSearchResult[],
): StructuredSearchResponse => {
  const hits: SearchHit[] = [];
  for (const result of results) {
    hits.push(buildSearchHit(result));
  }

  const outputText = formatSearchText(results);

  return buildStructuredResponse(query, outputText, hits);
};

// ── Error formatting ───────────────────────────────────────────────────

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return `Ollama web search error: ${error.message}`;
  }

  return formatUnhandledSearchError(error);
};

// ── Client and execution ───────────────────────────────────────────────

const resolveApiKey = (config: SearchConfig): string => {
  const envKey = process.env.OLLAMA_API_KEY;
  return config.apiKey || envKey || "";
};

const executeSearch = async (config: SearchConfig, query: string): Promise<string> => {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    throw new Error(
      "Missing Ollama API key. Configure it in your provider options (apiKey) or set the OLLAMA_API_KEY environment variable.",
    );
  }

  const response = await fetch(OLLAMA_WEB_SEARCH_ENDPOINT, {
    body: JSON.stringify({ query }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status !== OK_STATUS) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body}`);
  }

  const data = (await response.json()) as OllamaWebSearchResponse;
  const results = data.results ?? [];

  if (results.length === EMPTY_LENGTH) {
    return JSON.stringify(buildStructuredResponse(query, "", []));
  }

  const structured = buildStructuredSearchResponse(query, results);

  return JSON.stringify(structured);
};

export { executeSearch, formatErrorMessage };
