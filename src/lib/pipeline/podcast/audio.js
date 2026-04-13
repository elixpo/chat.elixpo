import fs from "fs";
import path from "path";
import { generateAudio, transcribeAudio } from "../pollinations.js";
import { compressAudio } from "../compress.js";
import { PODCAST_TTS_PROMPT, PODCAST_VOICE } from "../config.js";

const TMP = path.resolve("tmp/podcast");

export async function generatePodcastSpeech(script, voice = PODCAST_VOICE) {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

  console.log("🎙️ Generating podcast speech...");
  const base64 = await generateAudio({ script, voice, developerPrompt: PODCAST_TTS_PROMPT });
  const rawBuffer = Buffer.from(base64, "base64");

  const buffer = compressAudio(rawBuffer, path.join(TMP, "speech"));
  fs.writeFileSync(path.join(TMP, "audio.mp3"), buffer);
  console.log(`✅ Podcast speech saved (${buffer.length} bytes)`);

  console.log("📝 Transcribing podcast audio...");
  const transcript = await transcribeAudio(buffer, "podcast.mp3");
  console.log(`✅ Transcript: ${transcript.segments?.length || 0} segments`);

  return { buffer, transcript };
}
