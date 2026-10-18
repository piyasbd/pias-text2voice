import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check API status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    engine: 'Gemini 3.8 Flash TTS + Web Audio Engine',
  });
});

// Server-side Gemini TTS Endpoint
app.post('/api/tts/generate', async (req, res) => {
  const {
    text,
    stylePrompt = 'Natural human emotion',
    voiceName = 'Kore', // Options: 'Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'
    modelChoice = 'gemini-3.8-flash-lite-tts',
  } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required.' });
  }

  if (!ai || !apiKey) {
    return res.status(200).json({
      fallback: true,
      message: 'GEMINI_API_KEY is not configured. Switching to browser Web Audio DSP engine.',
    });
  }

  try {
    const selectedModel = modelChoice === 'gemini-3.8-flash-tts'
      ? 'gemini-3.8-flash-tts'
      : 'gemini-3.8-flash-lite-tts';

    // Call Gemini TTS
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(200).json({
        fallback: true,
        message: 'No audio data returned from Gemini TTS. Using Web Audio engine.',
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      modelUsed: selectedModel,
      voiceUsed: voiceName,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error?.message || error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'TTS generation failed',
      message: 'Server TTS unavailable. Seamlessly using Web Audio engine.',
    });
  }
});

// AI Script Emotion Director Analysis
app.post('/api/director/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required.' });
  }

  if (!ai || !apiKey) {
    return res.status(200).json({
      fallback: true,
      analysis: {
        dominantEmotion: 'আশাবাদী ও অনুপ্রেরণামূলক (Optimistic)',
        suggestedVoice: 'Puck',
        pitchAdjustment: '+10%',
        tempoPacing: 'Medium-Fast',
        directorNote: 'উচ্চারণে স্পষ্টতা রাখুন এবং মূল বক্তব্যে জোর দিন।',
      },
    });
  }

  try {
    const prompt = `You are an expert Bengali and Multilingual Voice Acting Director.
Analyze the following dialogue text and determine the best voice acting delivery, emotional tone, and vocal tips according to the standard Voice Emotion Master Guide.

Dialogue: "${text}"

Respond in JSON format with the following keys:
- dominantEmotion: Emotion name in Bengali & English (e.g., "আনন্দিত বা উচ্ছ্বসিত (Happy / Excited)", "শ্বাসরুদ্ধকর বা টানটান উত্তেজনা (Suspenseful / Thrilled)", etc.)
- category: One of "১. ইতিবাচক, প্রাণবন্ত ও উষ্ণ টোন", "২. গল্পবলা, রোমাঞ্চ ও নাটকীয় টোন", "৩. সহানুভূতি, রোমান্স ও আত্মিক টোন", "৪. নেতিবাচক, তীব্র ও মানসিক চরমাবস্থার টোন", "৫. সামাজিক, মনস্তাত্ত্বিক ও মনোভাবগত টোন", "৬. নিরপেক্ষ, শান্ত ও পেশাদার টোন"
- vocalStyle: Bengali description of voice delivery (কণ্ঠের ধরন ও অভিব্যক্তি)
- suggestedVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'
- pitchScale: string (e.g. "High Pitch", "Mid Pitch", "Deep/Low Pitch")
- tempoSpeed: string (e.g. "Fast / দ্রুত", "Moderate / স্বাভাবিক", "Slow / ধীর", "Staccato")
- directorNotes: Detailed voice artist coaching tips in Bengali (শ্বাসের নিয়ন্ত্রণ, স্বরের ওঠা-নামা, আবেগ প্রকাশ ইত্যাদি)
- enhancedScriptWithTags: The original text enhanced with natural acting breath/pause tags like <breath>, <gasp>, [pause], [whisper] where appropriate.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.error('Director analysis error:', err);
    return res.status(200).json({
      fallback: true,
      analysis: {
        dominantEmotion: 'আবেগপূর্ণ কণ্ঠ (Expressive Voice)',
        suggestedVoice: 'Kore',
        directorNotes: 'কথার মাঝে উপযুক্ত বিরতি এবং আবেগের গভীরতা বজায় রাখুন।',
      },
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
