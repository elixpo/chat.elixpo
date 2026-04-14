"use client";

import { useState } from "react";

interface SearchResult {
  title: string;
  url: string;
  domain: string;
}

function parseTaskContent(raw: string): { label: string; query: string; results: SearchResult[]; isDone: boolean } {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let label = "Processing";
  let query = "";
  const results: SearchResult[] = [];
  let isDone = false;

  for (const line of lines) {
    if (line.toLowerCase().includes("searching") || line.toLowerCase().includes("searched")) {
      label = "Searched the web";
    }
    if (line.toLowerCase().includes("reading") || line.toLowerCase().includes("fetching")) {
      label = "Reading sources";
    }
    if (line.toLowerCase().includes("done") || line.toLowerCase().includes("complete")) {
      isDone = true;
    }
    // Extract query — first quoted string or line after "for:"
    const queryMatch = line.match(/"([^"]+)"|query:\s*(.+)|searching\s+(?:for\s+)?(.+)/i);
    if (queryMatch && !query) {
      query = (queryMatch[1] || queryMatch[2] || queryMatch[3] || "").trim();
    }
    // Extract URLs
    const urlMatch = line.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      try {
        const url = new URL(urlMatch[0]);
        const title = line.replace(urlMatch[0], "").replace(/[-–—|]/g, "").trim() || url.pathname.slice(1, 60);
        results.push({ title: title.slice(0, 80), url: urlMatch[0], domain: url.hostname.replace(/^www\./, "") });
      } catch { /* */ }
    }
  }

  return { label, query, results, isDone };
}

export default function TaskBlock({ content, isLast }: { content: string; isLast?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { label, query, results, isDone } = parseTaskContent(content);

  return (
    <div className="my-2">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-left cursor-pointer group"
      >
        {isDone ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
        ) : isLast ? (
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        )}
        <span className="text-sm text-neutral-500">{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-2 ml-6 rounded-xl border border-neutral-200 bg-white overflow-hidden">
          {/* Query */}
          {query && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              <span className="text-sm text-neutral-700 font-medium">{query}</span>
              {results.length > 0 && <span className="ml-auto text-xs text-neutral-400">{results.length} results</span>}
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {results.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    className="rounded-sm opacity-60 flex-shrink-0"
                  />
                  <span className="text-sm text-neutral-700 truncate flex-1">{r.title}</span>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{r.domain}</span>
                </a>
              ))}
            </div>
          )}

          {/* Raw content fallback if no results parsed */}
          {results.length === 0 && (
            <div className="px-4 py-3">
              <pre className="text-xs text-neutral-500 whitespace-pre-wrap font-mono">{content}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
