/**
 * ElixSearch API client for chat.elixpo.com
 * Handles SSE streaming, sessions, and image uploads.
 */

const SEARCH_BASE = "https://search.elixpo.com";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
}

export interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface ChatRequest {
  messages: ChatMessage[];
  session_id?: string;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: { index: number; message: { role: string; content: string }; finish_reason: string }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/**
 * Send a chat request (non-streaming). Returns full response.
 */
export async function chatCompletion(apiKey: string, request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${SEARCH_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...request, stream: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Search API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Send a chat request with SSE streaming.
 * Calls onChunk for each text delta, onTask for <TASK> blocks,
 * and onDone when the stream ends.
 */
export async function chatStream(
  apiKey: string,
  request: ChatRequest,
  callbacks: {
    onChunk: (text: string) => void;
    onDone: (fullText: string) => void;
    onError: (error: Error) => void;
  }
): Promise<AbortController> {
  const controller = new AbortController();

  try {
    const res = await fetch(`${SEARCH_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Search API error: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    const processLine = (line: string) => {
      if (!line.startsWith("data: ")) return;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          callbacks.onChunk(delta);
        }
      } catch {
        // Non-JSON SSE line, skip
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        processLine(line);
      }
    }

    // Process any remaining buffer
    if (buffer) processLine(buffer);

    callbacks.onDone(fullText);
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      callbacks.onError(err as Error);
    }
  }

  return controller;
}

/**
 * Create a new session.
 */
export async function createSession(apiKey: string): Promise<string> {
  const res = await fetch(`${SEARCH_BASE}/api/session/create`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Session create failed: ${res.status}`);
  const data = await res.json();
  return data.session_id;
}

/**
 * Get session history.
 */
export async function getSession(apiKey: string, sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${SEARCH_BASE}/api/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}

/**
 * Delete a session.
 */
export async function deleteSession(apiKey: string, sessionId: string): Promise<void> {
  await fetch(`${SEARCH_BASE}/api/session/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
