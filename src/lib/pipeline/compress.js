import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const TMP = path.resolve("tmp");

/**
 * Compress WAV audio to MP3 using ffmpeg (lossy, good quality).
 * Falls back to returning original buffer if ffmpeg is not available.
 * @param {Buffer} wavBuffer - Raw WAV audio
 * @param {string} name - Identifier for tmp files
 * @returns {Buffer} Compressed MP3 buffer
 */
export function compressAudio(wavBuffer, name = "audio") {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

  const wavPath = path.join(TMP, `${name}_raw.wav`);
  const mp3Path = path.join(TMP, `${name}.mp3`);

  fs.writeFileSync(wavPath, wavBuffer);

  try {
    // 128kbps MP3, mono for speech — good quality, ~10x smaller than WAV
    execSync(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 128k -ac 1 "${mp3Path}" 2>/dev/null`);
    const compressed = fs.readFileSync(mp3Path);
    const ratio = ((1 - compressed.length / wavBuffer.length) * 100).toFixed(1);
    console.log(`  🗜️ Audio: ${(wavBuffer.length / 1024 / 1024).toFixed(1)}MB → ${(compressed.length / 1024 / 1024).toFixed(1)}MB (${ratio}% smaller)`);

    // Clean raw wav, keep compressed mp3
    fs.unlinkSync(wavPath);
    return compressed;
  } catch {
    console.warn(`  ⚠️ ffmpeg not available, using raw WAV`);
    // Clean up failed attempt
    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
    fs.unlinkSync(wavPath);
    return wavBuffer;
  }
}

/**
 * Compress image using ffmpeg (lossy JPEG, quality 80).
 * Falls back to returning original buffer if ffmpeg is not available.
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} name - Identifier for tmp files
 * @returns {Buffer} Compressed JPEG buffer
 */
export function compressImage(imageBuffer, name = "image") {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

  const inputPath = path.join(TMP, `${name}_raw.jpg`);
  const outputPath = path.join(TMP, `${name}.jpg`);

  fs.writeFileSync(inputPath, imageBuffer);

  try {
    // JPEG quality 80, strip metadata
    execSync(`ffmpeg -y -i "${inputPath}" -q:v 4 "${outputPath}" 2>/dev/null`);
    const compressed = fs.readFileSync(outputPath);
    const ratio = ((1 - compressed.length / imageBuffer.length) * 100).toFixed(1);
    console.log(`  🗜️ Image: ${(imageBuffer.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB (${ratio}% smaller)`);

    fs.unlinkSync(inputPath);
    return compressed;
  } catch {
    console.warn(`  ⚠️ ffmpeg not available, using raw image`);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    fs.unlinkSync(inputPath);
    return imageBuffer;
  }
}
