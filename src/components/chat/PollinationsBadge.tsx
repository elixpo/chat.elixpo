import React from 'react';

export default function PollinationsBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <span className="whitespace-nowrap">Pollinations AI · CPU-hosted</span>
    </div>
  );
}
