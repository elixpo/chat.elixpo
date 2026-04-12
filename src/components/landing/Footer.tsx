"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="py-16 px-6 bg-neutral-950 text-neutral-400">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="font-[family-name:var(--font-parkinsans)] font-bold text-white text-lg">
            Elixpo Chat
          </span>
        </div>

        <div className="flex gap-8 text-sm">
          <a href="/daily" className="hover:text-white transition-colors">Daily</a>
          <a href="/podcast" className="hover:text-white transition-colors">Podcast</a>
          <a href="/discover" className="hover:text-white transition-colors">Discover</a>
          <a href="https://github.com/Circuit-Overtime/elixpochat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub
          </a>
        </div>

        <p className="text-xs text-neutral-600">
          Built with Pollinations AI &middot; Hosted on Cloudflare
        </p>
      </motion.div>
    </footer>
  );
}
