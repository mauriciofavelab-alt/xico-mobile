import { Router } from "express";

const router = Router();

// Bella — disponible en todos los planes, suena natural en español con multilingual v2
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";

function cleanText(raw: string): string {
  return raw
    .replace(/—/g, ", ")
    .replace(/–/g, ", ")
    .replace(/[""«»\u201C\u201D]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\.\.\./g, ".")
    .replace(/([.!?])\s*\n+/g, "$1 ")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

router.get("/", async (req, res) => {
  const raw = (req.query["text"] as string) ?? "";
  if (!raw.trim()) {
    res.status(400).json({ error: "text param required" });
    return;
  }

  const text = cleanText(raw).slice(0, 2000);
  const apiKey = process.env["ELEVENLABS_API_KEY"];

  if (!apiKey) {
    res.status(503).json({ error: "TTS not configured" });
    return;
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.28,
            similarity_boost: 0.88,
            style: 0.42,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!upstream.ok) {
      const msg = await upstream.text();
      res.status(upstream.status).json({ error: msg });
      return;
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buffer = await upstream.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch {
    res.status(500).json({ error: "TTS upstream error" });
  }
});

export default router;
