"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/70 border-b border-neutral-200/60"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
          E
        </div>
        <span className="font-[family-name:var(--font-parkinsans)] font-bold text-lg text-neutral-900">
          Elixpo Chat
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
        <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
        <a href="#daily" className="hover:text-neutral-900 transition-colors">Daily</a>
        <a href="#podcast" className="hover:text-neutral-900 transition-colors">Podcast</a>
        <a href="#discover" className="hover:text-neutral-900 transition-colors">Discover</a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/daily"
          className="px-5 py-2 rounded-full text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          Open App
        </Link>
      </div>
    </motion.nav>
  );
}
