import { POLLINATIONS_BASE, POLLINATIONS_API_KEY, POLLINATIONS_REFERRER } from "./config.js";

/**
 * Chat completion via Pollinations OpenAI-compatible endpoint.
 */
export async function chatCompletion({ model, messages, json = false, seed, temperature }) {
  const body = { model, messages };
  if (json) body.response_format = { type: "json_object" };
  if (seed !== undefined) body.seed = seed;
  if (temperature !== undefined) body.temperature = temperature;

  const res = await fetch(`${POLLINATIONS_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Pollinations chat error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Audio generation via openai-audio model.
 */
export async function generateAudio({ script, voice = "shimmer", developerPrompt }) {
  const body = {
    model: "openai-audio",
    modalities: ["text", "audio"],
    audio: { voice, format: "wav" },
    messages: [
      { role: "developer", content: developerPrompt },
      { role: "user", content: script },
    ],
  };

  const res = await fetch(`${POLLINATIONS_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Pollinations audio error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const base64Audio = data.choices?.[0]?.message?.audio?.data;
  if (!base64Audio) throw new Error("No audio data returned");
  return base64Audio;
}

/**
 * Image generation via Pollinations image endpoint. Returns image bytes.
 */
export async function generateImage({ prompt, width = 1024, height = 1024, model = "flux", seed = 42 }) {
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    seed: String(seed),
    nologo: "true",
    private: "true",
    referrer: POLLINATIONS_REFERRER,
    key: POLLINATIONS_API_KEY,
  });

  const url = `${POLLINATIONS_BASE}/image/${encodeURIComponent(prompt)}?${params}`;
  const res = await fetch(url, { timeout: 120000 });
  if (!res.ok) throw new Error(`Image gen error ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
