import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  Mic,
  MessageSquare,
  HelpCircle,
  Clock,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { EMOTIONS_DATA, EmotionItem, CATEGORIES } from '../data/emotionsData';
import {
  BANGLADESHI_VOICE_PERSONAS,
  BangladeshiVoicePersona,
} from '../data/bangladeshiVoices';
import { studioAudioEngine, SynthesizeOptions } from '../utils/audioEngine';
import { WaveformVisualizer } from './WaveformVisualizer';
import { VoicePersonaSelector } from './VoicePersonaSelector';

interface GenerationHistoryItem {
  id: string;
  text: string;
  emotionNameBn: string;
  voiceName: string;
  personaNameBn?: string;
  personaAge?: number;
  sourceType: 'gemini' | 'dsp-synthesizer' | 'web-speech';
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  timestamp: string;
}

interface VoiceStudioProps {
  initialEmotion?: EmotionItem | null;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ initialEmotion }) => {
  const defaultEmotion = initialEmotion || EMOTIONS_DATA[0];
  const defaultPersona = BANGLADESHI_VOICE_PERSONAS[21]; // নুসরাত (২২ বছর) or default

  // Studio form states
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>(defaultEmotion.id);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(defaultPersona.id);
  const [scriptText, setScriptText] = useState<string>(defaultEmotion.exampleBn);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'>(
    defaultPersona.baseGeminiVoice
  );
  const [pitch, setPitch] = useState<number>(defaultPersona.pitchDefault);
  const [speed, setSpeed] = useState<number>(defaultPersona.speedDefault);
  const [energy, setEnergy] = useState<number>(defaultEmotion.energy);
  const [tremolo, setTremolo] = useState<number>(defaultPersona.tremoloDefault);
  const [reverb, setReverb] = useState<
    'dry' | 'warm_room' | 'whisper_booth' | 'dramatic_hall' | 'spacious_cathedral'
  >(defaultEmotion.reverb);

  // Audio Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [sourceType, setSourceType] = useState<'gemini' | 'dsp-synthesizer' | 'web-speech'>('gemini');

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [directorAnalysis, setDirectorAnalysis] = useState<any | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  const activeEmotion = EMOTIONS_DATA.find((e) => e.id === selectedEmotionId) || defaultEmotion;
  const activePersona =
    BANGLADESHI_VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) ||
    BANGLADESHI_VOICE_PERSONAS[0];

  // Sync when initialEmotion changes from catalog selection
  useEffect(() => {
    if (initialEmotion) {
      applyEmotionPreset(initialEmotion);
    }
  }, [initialEmotion]);

  // Audio engine state subscription
  useEffect(() => {
    const unsubscribe = studioAudioEngine.subscribe((state) => {
      if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
      if (state.duration !== undefined) setDuration(state.duration);
      if (state.currentTime !== undefined) setCurrentTime(state.currentTime);
      if (state.audioUrl !== undefined) setCurrentAudioUrl(state.audioUrl);
      if (state.audioBlob !== undefined) setCurrentAudioBlob(state.audioBlob);
    });

    return () => {
      unsubscribe();
      studioAudioEngine.stop();
    };
  }, []);

  const handleSelectPersona = (persona: BangladeshiVoicePersona) => {
    setSelectedPersonaId(persona.id);
    setSelectedVoice(persona.baseGeminiVoice);
    setPitch(persona.pitchDefault);
    setSpeed(persona.speedDefault);
    setTremolo(persona.tremoloDefault);
  };

  const applyEmotionPreset = (item: EmotionItem) => {
    setSelectedEmotionId(item.id);
    setEnergy(item.energy);
    setReverb(item.reverb);
    if (!scriptText || scriptText === activeEmotion.exampleBn) {
      setScriptText(item.exampleBn);
    }
  };

  const handleEmotionSelect = (id: string) => {
    const found = EMOTIONS_DATA.find((e) => e.id === id);
    if (found) {
      applyEmotionPreset(found);
    }
  };

  const insertTag = (tag: string) => {
    setScriptText((prev) => `${prev} ${tag} `);
  };

  // Generate Audio
  const handleGenerateVoice = async () => {
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    setStatusMessage('ভয়েস তৈরি হচ্ছে...');

    try {
      const combinedStylePrompt = `${activePersona.speechPrompt}. Emotional Tone: ${activeEmotion.speechStyleInstruction}. Age: ${activePersona.age} years old ${activePersona.genderBn}. Language: Native Bangladeshi Bengali. Expression: ${activeEmotion.voiceTypeBn}`;

      const options: SynthesizeOptions = {
        text: scriptText.trim(),
        emotionId: activeEmotion.id,
        voiceName: selectedVoice,
        personaId: activePersona.id,
        personaName: activePersona.nameBn,
        pitch,
        speed,
        energy,
        tremolo,
        reverb,
        stylePrompt: combinedStylePrompt,
      };

      const result = await studioAudioEngine.generateVoice(options);

      setCurrentAudioBlob(result.audioBlob);
      setCurrentAudioUrl(result.audioUrl);
      setDuration(result.duration);
      setSourceType(result.sourceType);
      setStatusMessage(result.notice || 'অডিও সফলভাবে তৈরি হয়েছে!');

      // Add to session history
      const historyEntry: GenerationHistoryItem = {
        id: Date.now().toString(),
        text: scriptText.trim(),
        emotionNameBn: activeEmotion.nameBn,
        voiceName: selectedVoice,
        personaNameBn: activePersona.nameBn,
        personaAge: activePersona.age,
        sourceType: result.sourceType,
        audioBlob: result.audioBlob,
        audioUrl: result.audioUrl,
        duration: result.duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setHistory((prev) => [historyEntry, ...prev.slice(0, 7)]);

      // Auto play
      if (result.sourceType === 'gemini') {
        studioAudioEngine.playUrl(result.audioUrl);
      } else {
        await studioAudioEngine.playBuffer();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('ভয়েস তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Play / Pause
  const handlePlayToggle = () => {
    if (isPlaying) {
      studioAudioEngine.pause();
    } else {
      if (currentAudioUrl && sourceType === 'gemini') {
        studioAudioEngine.resume();
      } else {
        studioAudioEngine.resume();
      }
    }
  };

  const handleSeek = (time: number) => {
    studioAudioEngine.seek(time);
  };

  // Download WAV
  const handleDownload = (blob?: Blob | null, name?: string) => {
    const targetBlob = blob || currentAudioBlob;
    if (!targetBlob) return;
    const url = URL.createObjectURL(targetBlob);
    const a = document.createElement('a');
    a.href = url;
    const cleanEmotion = (name || activeEmotion.nameBn).replace(/[\/\s]/g, '_');
    a.download = `voice_emotion_${cleanEmotion}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // AI Director Script Analysis
  const handleAnalyzeWithAI = async () => {
    if (!scriptText.trim()) return;
    setIsAnalyzing(true);
    setDirectorAnalysis(null);

    try {
      const res = await fetch('/api/director/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setDirectorAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Columns: Script Editor & Visualizer Workstation */}
      <div className="lg:col-span-7 space-y-5">
        {/* Waveform Visualizer Screen */}
        <WaveformVisualizer
          isPlaying={isPlaying}
          duration={duration}
          currentTime={currentTime}
          audioBlob={currentAudioBlob}
          audioUrl={currentAudioUrl}
          emotionTitle={`${activeEmotion.nameBn} • ${activePersona.nameBn} (${activePersona.age} বছর)`}
          sourceType={sourceType}
          onPlayToggle={handlePlayToggle}
          onSeek={handleSeek}
          onDownload={() => handleDownload()}
        />

        {/* Script Editor Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                সংলাপ ও স্ক্রিপ্ট এডিটর (Dialogue Script)
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {scriptText.trim().length} অক্ষর • {scriptText.trim().split(/\s+/).filter(Boolean).length} শব্দ
            </div>
          </div>

          {/* Quick acting SSML tags pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 p-2 rounded-xl bg-slate-950/70 border border-slate-850">
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles size={11} className="text-amber-400" />
              ট্যাগ যুক্ত করুন:
            </span>
            <button
              onClick={() => insertTag('<breath>')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono transition"
              title="দীর্ঘশ্বাস বা নিঃশ্বাসের বিরতি"
            >
              &lt;breath&gt;
            </button>
            <button
              onClick={() => insertTag('<gasp>')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-mono transition"
              title="চমকে ওঠার আকস্মিক শ্বাস"
            >
              &lt;gasp&gt;
            </button>
            <button
              onClick={() => insertTag('<laugh>')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono transition"
              title="হাসির অভিব্যক্তি"
            >
              &lt;laugh&gt;
            </button>
            <button
              onClick={() => insertTag('|mhm|')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono transition"
              title="অনুমোদনসূচক হুঁ ধ্বনি"
            >
              |mhm|
            </button>
            <button
              onClick={() => insertTag('[whisper]')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-mono transition"
              title="ফিসফিস স্বর"
            >
              [whisper]
            </button>
            <button
              onClick={() => insertTag('[pause]')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono transition"
              title="নাটকীয় বিরতি"
            >
              [pause]
            </button>
          </div>

          {/* Main Script Text Area */}
          <textarea
            rows={4}
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="আপনার বাংলা অথবা ইংরেজি সংলাপ এখানে লিখুন..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none leading-relaxed resize-none transition"
          />

          {/* Quick preset buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setScriptText(activeEmotion.exampleBn)}
              className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>ডিফল্ট উদাহরণে ফেরত যান</span>
            </button>

            <button
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !scriptText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition disabled:opacity-50"
            >
              <Wand2 size={13} className={isAnalyzing ? 'animate-spin' : ''} />
              <span>{isAnalyzing ? 'বিশ্লেষণ চলছে...' : 'AI ডিরেক্টর অ্যানালাইসিস'}</span>
            </button>
          </div>

          {/* AI Director Analysis Drawer */}
          {directorAnalysis && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  AI ভয়েস ডিরেক্টরের পর্যবেক্ষণ
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 text-[10px]">
                  প্রস্তাবিত ভয়েস: {directorAnalysis.suggestedVoice}
                </span>
              </div>
              <p className="text-slate-300">
                <strong className="text-slate-200">মূল অনুভূতি:</strong> {directorAnalysis.dominantEmotion}
              </p>
              {directorAnalysis.directorNotes && (
                <p className="text-amber-200/90 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-indigo-900/50">
                  🎙️ {directorAnalysis.directorNotes}
                </p>
              )}
              {directorAnalysis.enhancedScriptWithTags && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">ট্যাগসহ স্ক্রিপ্ট প্রয়োগ করুন?</span>
                  <button
                    onClick={() => setScriptText(directorAnalysis.enhancedScriptWithTags)}
                    className="text-[11px] font-semibold text-sky-400 hover:underline"
                  >
                    স্ক্রিপ্টে বসান
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Action Bar */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleGenerateVoice}
              disabled={isGenerating || !scriptText.trim()}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Mic size={17} />
              <span>{isGenerating ? 'কণ্ঠ জেনারেট হচ্ছে...' : 'কণ্ঠ তৈরি করুন (Generate Voice)'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="mt-3 text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Session Generation History Reel */}
        {history.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <History size={14} className="text-sky-400" />
                <span>সাম্প্রতিক সৃষ্টি (Session History Reel)</span>
              </div>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
              >
                <Trash2 size={11} />
                <span>ক্লিয়ার করুন</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-700/80 transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <button
                      onClick={() => studioAudioEngine.playUrl(item.audioUrl)}
                      className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500 hover:text-slate-950 flex items-center justify-center transition flex-shrink-0"
                    >
                      <Play size={13} className="translate-x-0.5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-200 truncate font-medium max-w-[220px] sm:max-w-xs">
                        "{item.text}"
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{item.emotionNameBn}</span>
                        <span>•</span>
                        <span>{item.voiceName}</span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(item.audioBlob, item.emotionNameBn)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="ডাউনলোড"
                  >
                    <Download size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right 5 Columns: Emotion Preset & Acoustic Soundboard Sliders */}
      <div className="lg:col-span-5 space-y-5">
        {/* Emotion Preset Selector Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                আবেগ ও কণ্ঠশিল্পী নির্বাচন
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              মাস্টার প্রিসেট
            </span>
          </div>

          {/* Emotion Dropdown */}
          <div className="space-y-1.5 mb-4">
            <label className="text-xs font-semibold text-slate-300">
              নির্ধারিত আবেগ (Master Emotion):
            </label>
            <select
              value={selectedEmotionId}
              onChange={(e) => handleEmotionSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={cat.nameBn}>
                  {cat.emotions.map((em) => (
                    <option key={em.id} value={em.id}>
                      {em.nameBn} — {em.nameEn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Active Emotion Characteristics Summary */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-amber-300 mb-1">
              আবেগের সুর ও রূপরেখা:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeEmotion.voiceTypeBn}
            </p>
          </div>
        </div>

        {/* 50 Bangladeshi Voice Personas (২-৯০ বছর) */}
        <VoicePersonaSelector
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={handleSelectPersona}
        />


        {/* Acoustic Controls & Soundboard Dials */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                সাউন্ডবোর্ড ও অ্যাকোস্টিক কন্ট্রোল
              </h3>
            </div>
            <button
              onClick={() => {
                setPitch(activeEmotion.pitch);
                setSpeed(activeEmotion.speed);
                setEnergy(activeEmotion.energy);
                setTremolo(activeEmotion.tremolo);
                setReverb(activeEmotion.reverb);
              }}
              className="text-[10px] text-slate-400 hover:text-sky-400 transition"
            >
              প্রিসেটে রিসেট
            </button>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">পিচ স্কেল (Pitch Frequency):</span>
              <span className="font-mono text-sky-400">
                {pitch > 0 ? `+${pitch}%` : `${pitch}%`}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>গম্ভীর / নিচু (-50%)</span>
              <span>স্বাভাবিক (0)</span>
              <span>উঁচু স্কেল (+50%)</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">কথার গতি (Speed Rate):</span>
              <span className="font-mono text-sky-400">{speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>ধীর (0.5x)</span>
              <span>স্বাভাবিক (1.0x)</span>
              <span>দ্রুত (2.0x)</span>
            </div>
          </div>

          {/* Energy / Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">তীব্রতা ও শক্তি (Energy / Volume):</span>
              <span className="font-mono text-sky-400">{Math.round(energy * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.05}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Tremolo / Laryngeal Quiver */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">স্বরযন্ত্রের কাঁপুনি (Tremolo / Quiver):</span>
              <span className="font-mono text-rose-400">
                {tremolo > 0 ? `${tremolo} Hz` : 'অফ'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={tremolo}
              onChange={(e) => setTremolo(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">
              *ভয়, কান্না বা আকুল মিনতি প্রকাশের জন্য কাঁপুনি উপযোগী।
            </div>
          </div>

          {/* Room Reverb */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              ঘরের প্রতিধ্বনি (Reverb Ambience):
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {[
                { id: 'dry', label: 'ড্রাই স্টুডিও' },
                { id: 'warm_room', label: 'উষ্ণ ঘর' },
                { id: 'whisper_booth', label: 'ক্লোজ বুথ' },
                { id: 'dramatic_hall', label: 'নাটকীয় হল' },
                { id: 'spacious_cathedral', label: 'বিশাল অডিটোরিয়াম' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setReverb(item.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition ${
                    reverb === item.id
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium'
                      : 'bg-slate-950/70 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
