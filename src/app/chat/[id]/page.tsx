"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-6">
        <img src="/images/logo.png" alt="Elixpo" width={64} height={64} className="rounded-2xl mb-6 opacity-60" />
        <h2 className="font-[family-name:var(--font-parkinsans)] text-2xl font-bold text-neutral-900 mb-2">
          Sign in to chat
        </h2>
        <p className="text-neutral-500 text-sm leading-relaxed text-center max-w-sm mb-6">
          Connect with your Elixpo account to start conversations with AI.
        </p>
        <button
          onClick={login}
          className="px-8 py-3 rounded-full text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          Sign in with Elixpo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Elixpo" width={32} height={32} className="rounded-md" />
          <span className="font-[family-name:var(--font-parkinsans)] font-bold text-neutral-900">Elixpo Chat</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">{user.displayName}</span>
          <span className="text-xs text-neutral-300 font-mono">{id === "new" ? "New session" : id.slice(0, 8)}</span>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <img src="/images/logo.png" alt="Elixpo" width={48} height={48} className="rounded-xl mx-auto mb-4 opacity-40" />
          <h2 className="font-[family-name:var(--font-parkinsans)] text-xl font-bold text-neutral-900 mb-2">
            Hey {user.displayName}!
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Chat is coming soon. AI conversations with artifacts, multiple models, and rich formatting.
          </p>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
          <input
            type="text"
            placeholder="Message Elixpo..."
            className="flex-1 bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
            disabled
          />
          <div className="w-8 h-8 rounded-lg bg-neutral-300 flex items-center justify-center cursor-not-allowed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
