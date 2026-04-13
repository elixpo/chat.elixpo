import dotenv from "dotenv";
dotenv.config();

// ── API ──
export const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || "";
export const POLLINATIONS_BASE = "https://gen.pollinations.ai";

// ── Cloudinary ──
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// ── Models ──
export const MODELS = {
  research: "perplexity-fast",
  scriptWriter: "openai",
  promptWriter: "openai-fast",
  audioSpeech: "openai-audio",
  imageGen: "zimage",
  transcription: "whisper",
};

// ── Voices ──
export const NEWS_VOICES = ["shimmer", "ash", "shimmer", "ash", "shimmer", "ash", "shimmer"];
export const PODCAST_VOICE = "shimmer";

// ── Limits ──
export const MAX_NEWS_ITEMS = 7;

// ── Cloudinary paths ──
export const CLOUDINARY_NEWS_ROOT = "elixpochat/news";
export const CLOUDINARY_PODCAST_ROOT = "elixpochat/podcast";

// ── TTS developer prompts ──
export const PODCAST_TTS_PROMPT = "Narrate the full script word for word as an energetic, fast-paced podcast host with natural breathing, real emotion, pauses before reveals and after big moments — never say words like 'pause' or 'sigh' or any paralinguistic cues out loud, just perform them naturally through your voice, pacing, and breath.";

export const NEWS_TTS_PROMPT = "Narrate the full script word for word as a sharp, energetic news host — fast-paced and confident with natural breaths between thoughts, genuine emotion matching the content, brief pauses after surprising facts — never say words like 'pause' or 'sigh' out loud, just let them come through naturally in your delivery.";

// ── Filenames (tmp + cloudinary) ──
export const FILES = {
  news: {
    backup: "_backup.json",
    thumbnail: "thumbnail",
    metadata: "metadata.json",
    item: {
      script: "script.txt",
      banner: "banner",
      audio: "audio",
      transcript: "transcript",
      metadata: "metadata.json",
    },
  },
  podcast: {
    backup: "_backup.json",
    script: "script.txt",
    thumbnail: "thumbnail",
    banner: "banner",
    audio: "audio",
    transcript: "transcript",
    metadata: "metadata.json",
  },
};
