import React, { useState } from 'react';
import { ArrowLeftRight, Play, Pause, Loader2, Volume2, Sparkles, Sliders, User } from 'lucide-react';
import { EMOTIONS_DATA, EmotionItem } from '../data/emotionsData';
import {
  BANGLADESHI_VOICE_PERSONAS,
  BangladeshiVoicePersona,
} from '../data/bangladeshiVoices';
import { studioAudioEngine } from '../utils/audioEngine';

interface EmotionCompareProps {
  initialEmotionA?: EmotionItem;
  initialEmotionB?: EmotionItem;
}

export const EmotionCompare: React.FC<EmotionCompareProps> = ({
  initialEmotionA,
  initialEmotionB,
}) => {
  const [emotionAId, setEmotionAId] = useState<string>(
    initialEmotionA?.id || 'awe-struck' // স্তম্ভিত
  );
  const [emotionBId, setEmotionBId] = useState<string>(
    initialEmotionB?.id || 'sarcastic-ironic' // ব্যঙ্গাত্মক
  );

  const [personaAId, setPersonaAId] = useState<string>('bd-adrito-3'); // ৩ বছর ছেলে
  const [personaBId, setPersonaBId] = useState<string>('bd-motiur-72'); // ৭২ বছর দাদু

  const [compareText, setCompareText] = useState<string>(
    'আমরা কি এতদিন তবে ভুল জেনে এসেছি?!'
  );

  // Audio states for A and B
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [audioUrlA, setAudioUrlA] = useState<string | null>(null);
  const [audioUrlB, setAudioUrlB] = useState<string | null>(null);
  const [playingSide, setPlayingSide] = useState<'A' | 'B' | null>(null);

  const emotionA = EMOTIONS_DATA.find((e) => e.id === emotionAId) || EMOTIONS_DATA[5];
  const emotionB = EMOTIONS_DATA.find((e) => e.id === emotionBId) || EMOTIONS_DATA[17];

  const personaA = BANGLADESHI_VOICE_PERSONAS.find((p) => p.id === personaAId) || BANGLADESHI_VOICE_PERSONAS[1];
  const personaB = BANGLADESHI_VOICE_PERSONAS.find((p) => p.id === personaBId) || BANGLADESHI_VOICE_PERSONAS[47];

  const handleGenerateSide = async (side: 'A' | 'B') => {
    const emotion = side === 'A' ? emotionA : emotionB;
    const persona = side === 'A' ? personaA : personaB;
    const setLoading = side === 'A' ? setLoadingA : setLoadingB;
    const setAudio = side === 'A' ? setAudioUrlA : setAudioUrlB;

    setLoading(true);
    try {
      const combinedStylePrompt = `${persona.speechPrompt}. Emotional Tone: ${emotion.speechStyleInstruction}. Age: ${persona.age} years old ${persona.genderBn}. Native Bangladeshi Bengali delivery.`;

      const res = await studioAudioEngine.generateVoice({
        text: compareText,
        emotionId: emotion.id,
        voiceName: persona.baseGeminiVoice,
        pitch: persona.pitchDefault,
        speed: persona.speedDefault,
        energy: emotion.energy,
        tremolo: persona.tremoloDefault,
        reverb: emotion.reverb,
        stylePrompt: combinedStylePrompt,
      });

      setAudio(res.audioUrl);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePlaySide = async (side: 'A' | 'B') => {
    const url = side === 'A' ? audioUrlA : audioUrlB;
    if (playingSide === side) {
      studioAudioEngine.stop();
      setPlayingSide(null);
      return;
    }

    if (!url) {
      await handleGenerateSide(side);
      return;
    }

    setPlayingSide(side);
    studioAudioEngine.playUrl(url, () => {
      setPlayingSide(null);
    });
  };

  const presetComparisonPhrases = [
    'আমরা কি এতদিন তবে ভুল জেনে এসেছি?!',
    'তোমার এই সাহসের প্রশংসা না করে পারছি না!',
    'তুমি ঠিক সময়ে এসে গেছ...',
    'সবকিছু ঠিক হতে সময় লাগবে।',
    'আমি বলেছিলাম না এমনটাই ঘটবে?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
            <ArrowLeftRight size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              আবেগ তুলনা মোড (Side-by-Side Emotion Comparator)
            </h2>
            <p className="text-xs text-slate-400">
              একই সংলাপ দুটি ভিন্ন আবেগে শুনুন এবং অনুভব করুন কীভাবে কণ্ঠের স্বর ও ভঙ্গি বাক্যের সম্পূর্ণ অর্থ বদলে দেয়।
            </p>
          </div>
        </div>

        {/* Input script for comparison */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            তুলনা করার সংলাপ (Test Sentence):
          </label>
          <input
            type="text"
            value={compareText}
            onChange={(e) => {
              setCompareText(e.target.value);
              setAudioUrlA(null);
              setAudioUrlB(null);
            }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition"
          />

          {/* Preset comparison phrases */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500">উদাহরণ বাক্য:</span>
            {presetComparisonPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCompareText(phrase);
                  setAudioUrlA(null);
                  setAudioUrlB(null);
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SIDE A */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                আবেগ ক (Emotion A)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {emotionA.categoryNameBn.split('.')[1]?.trim()}
              </span>
            </div>

            <select
              value={emotionAId}
              onChange={(e) => {
                setEmotionAId(e.target.value);
                setAudioUrlA(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white outline-none mb-3"
            >
              {EMOTIONS_DATA.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nameBn} ({em.nameEn})
                </option>
              ))}
            </select>

            {/* Persona A Dropdown */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                কণ্ঠশিল্পী (বাংলাদেশী ৫০ জন):
              </label>
              <select
                value={personaAId}
                onChange={(e) => {
                  setPersonaAId(e.target.value);
                  setAudioUrlA(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-xs text-sky-300 outline-none mb-1 cursor-pointer"
              >
                {BANGLADESHI_VOICE_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameBn} ({p.age} বছর • {p.genderBn})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-amber-200/80">
                {personaA.typeBn}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 mb-3 text-xs">
              <div className="text-[11px] font-semibold text-sky-300 mb-1">কণ্ঠের রূপরেখা:</div>
              <p className="text-slate-300 leading-relaxed">{emotionA.voiceTypeBn}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400 mb-4">
              <span className="px-2 py-0.5 rounded bg-slate-800">
                বয়স: {personaA.age} বছর
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800">
                পিচ: {personaA.pitchDefault > 0 ? `+${personaA.pitchDefault}%` : `${personaA.pitchDefault}%`}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800">গতি: {personaA.speedDefault}x</span>
              <span className="px-2 py-0.5 rounded bg-slate-800">{personaA.genderBn}</span>
            </div>
          </div>

          <button
            onClick={() => handlePlaySide('A')}
            disabled={loadingA}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-md ${
              playingSide === 'A'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            }`}
          >
            {loadingA ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>জেনারেট হচ্ছে...</span>
              </>
            ) : playingSide === 'A' ? (
              <>
                <Pause size={14} />
                <span>বিরতি দিন</span>
              </>
            ) : (
              <>
                <Play size={14} className="translate-x-0.5" />
                <span>{audioUrlA ? 'আবেগ ক শুনুন (Play A)' : 'আবেগ ক তৈরি ও শুনুন'}</span>
              </>
            )}
          </button>
        </div>

        {/* SIDE B */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                আবেগ খ (Emotion B)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {emotionB.categoryNameBn.split('.')[1]?.trim()}
              </span>
            </div>

            <select
              value={emotionBId}
              onChange={(e) => {
                setEmotionBId(e.target.value);
                setAudioUrlB(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none mb-3"
            >
              {EMOTIONS_DATA.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nameBn} ({em.nameEn})
                </option>
              ))}
            </select>

            {/* Persona B Dropdown */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                কণ্ঠশিল্পী (বাংলাদেশী ৫০ জন):
              </label>
              <select
                value={personaBId}
                onChange={(e) => {
                  setPersonaBId(e.target.value);
                  setAudioUrlB(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-2.5 py-1.5 text-xs text-rose-300 outline-none mb-1 cursor-pointer"
              >
                {BANGLADESHI_VOICE_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameBn} ({p.age} বছর • {p.genderBn})
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-amber-200/80">
                {personaB.typeBn}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 mb-3 text-xs">
              <div className="text-[11px] font-semibold text-rose-300 mb-1">কণ্ঠের রূপরেখা:</div>
              <p className="text-slate-300 leading-relaxed">{emotionB.voiceTypeBn}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400 mb-4">
              <span className="px-2 py-0.5 rounded bg-slate-800">
                বয়স: {personaB.age} বছর
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800">
                পিচ: {personaB.pitchDefault > 0 ? `+${personaB.pitchDefault}%` : `${personaB.pitchDefault}%`}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800">গতি: {personaB.speedDefault}x</span>
              <span className="px-2 py-0.5 rounded bg-slate-800">{personaB.genderBn}</span>
            </div>
          </div>

          <button
            onClick={() => handlePlaySide('B')}
            disabled={loadingB}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-md ${
              playingSide === 'B'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-500 text-slate-950 hover:bg-rose-400'
            }`}
          >
            {loadingB ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>জেনারেট হচ্ছে...</span>
              </>
            ) : playingSide === 'B' ? (
              <>
                <Pause size={14} />
                <span>বিরতি দিন</span>
              </>
            ) : (
              <>
                <Play size={14} className="translate-x-0.5" />
                <span>{audioUrlB ? 'আবেগ খ শুনুন (Play B)' : 'আবেগ খ তৈরি ও শুনুন'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
