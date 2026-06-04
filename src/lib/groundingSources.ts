import type { GroundingMetadata } from "@google/genai";

export type WebSearchSource = {
  title: string;
  uri: string;
};

export function extractWebSearchSources(
  metadata: GroundingMetadata | undefined
): WebSearchSource[] {
  if (!metadata?.groundingChunks?.length) return [];

  const seen = new Set<string>();
  const sources: WebSearchSource[] = [];

  for (const chunk of metadata.groundingChunks) {
    const uri = chunk.web?.uri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({
      uri,
      title: chunk.web?.title?.trim() || chunk.web?.domain?.trim() || uri,
    });
  }

  return sources;
}
