/**
 * RAG (Retrieval-Augmented Generation) Engine
 *
 * Implements TF-IDF based semantic search over the knowledge base.
 * Returns the most relevant documents for a given query to augment
 * the LLM's context window.
 */

import { knowledgeBase, KBDocument } from "./knowledge-base";

// Common English stop words to exclude from indexing
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "this", "that", "these",
  "those", "it", "its", "from", "as", "not", "they", "we", "you", "he",
  "she", "i", "my", "your", "his", "her", "our", "their", "also", "more",
  "than", "so", "if", "then", "when", "which", "who", "how", "what",
  "all", "each", "both", "few", "other", "into", "through", "about",
]);

/**
 * Tokenize text: lowercase, remove punctuation, filter stop words, remove short tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Compute term frequency for a list of tokens
 */
function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/**
 * Pre-compute IDF scores for the entire corpus
 */
function computeIDF(docs: KBDocument[]): Map<string, number> {
  const N = docs.length;
  const docFreq = new Map<string, number>();

  for (const doc of docs) {
    const tokens = new Set(
      tokenize(doc.content + " " + doc.title + " " + doc.tags.join(" "))
    );
    for (const token of tokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, freq] of docFreq) {
    // Smoothed IDF to avoid division by zero
    idf.set(term, Math.log((N + 1) / (freq + 1)) + 1);
  }
  return idf;
}

// Pre-compute IDF at module load time (cached)
const idfScores = computeIDF(knowledgeBase);

/**
 * Score a document against a query using TF-IDF cosine similarity
 */
function scoreTFIDF(query: string, doc: KBDocument): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const docText = `${doc.title} ${doc.category} ${doc.tags.join(" ")} ${doc.content}`;
  const docTokens = tokenize(docText);

  const docTF = computeTF(docTokens);

  let score = 0;
  let queryMagnitude = 0;
  let docMagnitude = 0;

  const allTerms = new Set([...queryTokens, ...docTF.keys()]);

  for (const term of allTerms) {
    const idf = idfScores.get(term) || 1;
    const queryWeight = queryTokens.includes(term) ? idf : 0;
    const docWeight = (docTF.get(term) || 0) * idf;

    score += queryWeight * docWeight;
    queryMagnitude += queryWeight * queryWeight;
    docMagnitude += docWeight * docWeight;
  }

  // Cosine similarity
  if (queryMagnitude === 0 || docMagnitude === 0) return 0;
  return score / (Math.sqrt(queryMagnitude) * Math.sqrt(docMagnitude));
}

/**
 * Main RAG retrieval function.
 *
 * @param query - The user's question/query
 * @param topK - Number of documents to retrieve (default: 3)
 * @param minScore - Minimum similarity score threshold (default: 0.01)
 * @returns Formatted context string ready to inject into the LLM prompt
 */
export async function retrieveContext(
  query: string,
  topK: number = 3,
  minScore: number = 0.01
): Promise<string> {
  if (!query || query.trim().length < 3) {
    return "No specific knowledge base context retrieved for this query.";
  }

  // Score all documents
  const scored = knowledgeBase.map((doc) => ({
    doc,
    score: scoreTFIDF(query, doc),
  }));

  // Sort by score descending, filter low-relevance docs
  const topDocs = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(({ score }) => score >= minScore);

  if (topDocs.length === 0) {
    return "No closely matching content found in the knowledge base. Answering from general knowledge.";
  }

  // Format the retrieved context
  const contextParts = topDocs.map(
    ({ doc, score }) =>
      `[Source: ${doc.category} — "${doc.title}" | Relevance: ${(score * 100).toFixed(1)}%]\n${doc.content}`
  );

  return contextParts.join("\n\n---\n\n");
}

/**
 * Retrieve raw document objects (useful for showing sources in the UI)
 */
export async function retrieveDocuments(
  query: string,
  topK: number = 3
): Promise<{ doc: KBDocument; score: number }[]> {
  if (!query || query.trim().length < 3) return [];

  return knowledgeBase
    .map((doc) => ({ doc, score: scoreTFIDF(query, doc) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(({ score }) => score >= 0.01);
}
