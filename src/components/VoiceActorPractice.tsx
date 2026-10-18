import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  Info,
  CheckCircle,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { EMOTIONS_DATA, EmotionItem } from '../data/emotionsData';
import {
  BANGLADESHI_VOICE_PERSONAS,
  BangladeshiVoicePersona,
} from '../data/bangladeshiVoices';
import { studioAudioEngine } from '../utils/audioEngine';

interface VoiceActorPracticeProps {
  initialEmotion?: EmotionItem | null;
}

export const VoiceActorPractice: React.FC<VoiceActorPracticeProps> = ({ initialEmotion }) => {
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>(
    initialEmotion?.id || EMOTIONS_DATA[0].id
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('bd-nusrat-22');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isRefPlaying, setIsRefPlaying] = useState<boolean>(false);
  const [isMyVoicePlaying, setIsMyVoicePlaying] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const myAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const activeEmotion = EMOTIONS_DATA.find((e) => e.id === selectedEmotionId) || EMOTIONS_DATA[0];
  const activePersona = BANGLADESHI_VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || BANGLADESHI_VOICE_PERSONAS[0];

  useEffect(() => {
    if (initialEmotion) {
      setSelectedEmotionId(initialEmotion.id);
    }
  }, [initialEmotion]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setMicPermissionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMicPermissionError(
        'মাইক্রোফোনে প্রবেশাধিকার পাওয়া যায়নি। ব্রাউজার সেটিংসে মাইক্রোফোন অনুমোদন করুন।'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    if (isMyVoicePlaying && myAudioElementRef.current) {
      myAudioElementRef.current.pause();
      setIsMyVoicePlaying(false);
      return;
    }

    const audio = new Audio(recordedAudioUrl);
    myAudioElementRef.current = audio;
    setIsMyVoicePlaying(true);

    audio.play().catch(console.error);

    audio.onended = () => {
      setIsMyVoicePlaying(false);
    };
  };

  const playReferenceGuide = async () => {
    if (isRefPlaying) {
      studioAudioEngine.stop();
      setIsRefPlaying(false);
      return;
    }

    setIsRefPlaying(true);
    try {
      const combinedStylePrompt = `${activePersona.speechPrompt}. Emotional Tone: ${activeEmotion.speechStyleInstruction}. Age: ${activePersona.age} years old ${activePersona.genderBn}. Native Bangladeshi Bengali delivery.`;

      const res = await studioAudioEngine.generateVoice({
        text: activeEmotion.exampleBn,
        emotionId: activeEmotion.id,
        voiceName: activePersona.baseGeminiVoice,
        pitch: activePersona.pitchDefault,
        speed: activePersona.speedDefault,
        energy: activeEmotion.energy,
        tremolo: activePersona.tremoloDefault,
        reverb: activeEmotion.reverb,
        stylePrompt: combinedStylePrompt,
      });

      if (res.sourceType === 'gemini') {
        studioAudioEngine.playUrl(res.audioUrl, () => {
          setIsRefPlaying(false);
        });
      } else {
        await studioAudioEngine.playBuffer();
        const unregister = studioAudioEngine.subscribe((state) => {
          if (state.isPlaying === false) {
            setIsRefPlaying(false);
            unregister();
          }
        });
      }
    } catch {
      setIsRefPlaying(false);
    }
  };

  const downloadMyTake = () => {
    if (!recordedAudioUrl) return;
    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `my_voice_take_${activeEmotion.nameBn}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <Mic size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                কণ্ঠশিল্পীদের অনুশীলন রুম (Voice Actor Teleprompter & Recording)
              </h2>
              <p className="text-xs text-slate-400">
                টেলিপম্পটারে সংলাপ দেখে নিজের কণ্ঠ রেকর্ড করুন এবং মাস্টার রেফারেন্সের সাথে মিলিয়ে নিন।
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Emotion Dropdown */}
            <div className="min-w-[200px]">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                আবেগ নির্বাচন:
              </label>
              <select
                value={selectedEmotionId}
                onChange={(e) => {
                  setSelectedEmotionId(e.target.value);
                  setRecordedAudioUrl(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                {EMOTIONS_DATA.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.nameBn} ({em.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Persona Dropdown */}
            <div className="min-w-[230px]">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                রেফারেন্স কণ্ঠশিল্পী (বাংলাদেশী ৫০ জন):
              </label>
              <select
                value={selectedPersonaId}
                onChange={(e) => {
                  setSelectedPersonaId(e.target.value);
                  setRecordedAudioUrl(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-rose-300 outline-none cursor-pointer"
              >
                {BANGLADESHI_VOICE_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameBn} ({p.age} বছর • {p.genderBn})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Big Teleprompter Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-4">
          <span className={`w-2 h-2 rounded-full ${activeEmotion.color.badgeBg}`} />
          <span>আবেগ: {activeEmotion.nameBn}</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-slate-400">{activeEmotion.nameEn}</span>
        </div>

        {/* Large Teleprompter Dialogue */}
        <div className="max-w-3xl mx-auto my-4">
          <p className="text-2xl sm:text-4xl font-extrabold text-amber-200 tracking-tight leading-relaxed selection:bg-amber-500/30">
            "{activeEmotion.exampleBn}"
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 italic">
            "{activeEmotion.exampleEn}"
          </p>
        </div>

        {/* Vocal Delivery Prompt */}
        <div className="max-w-2xl mx-auto mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1.5">
            <Volume2 size={15} />
            <span>কণ্ঠের রূপরেখা ও অভিব্যক্তি:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {activeEmotion.voiceTypeBn}
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
            <Info size={15} />
            <span>পরিচালকের অভিনয় নোট (Director Acting Note):</span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            {activeEmotion.actorNotes}
          </p>
        </div>

        {/* Live Mic Recording Controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {micPermissionError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              {micPermissionError}
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* Record / Stop Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/25 transition-all flex items-center gap-2"
              >
                <Mic size={18} className="animate-pulse" />
                <span>মাইক্রোফোনে রেকর্ড শুরু করুন</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 animate-bounce"
              >
                <Square size={16} />
                <span>রেকর্ডিং থামান ({recordingSeconds}s)</span>
              </button>
            )}

            {/* Play AI Reference Guide Button */}
            <button
              onClick={playReferenceGuide}
              className={`py-3 px-5 rounded-2xl border text-xs font-semibold transition flex items-center gap-2 ${
                isRefPlaying
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-sky-400 border-slate-700'
              }`}
            >
              {isRefPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isRefPlaying ? 'রেফারেন্স থামান' : 'মাস্টার রেফারেন্স শুনুন'}</span>
            </button>
          </div>

          {/* User's recorded take playback */}
          {recordedAudioUrl && (
            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 mt-2 shadow-lg">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={playRecordedAudio}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    isMyVoicePlaying
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                  }`}
                >
                  {isMyVoicePlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
                </button>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    <span>আপনার ভয়েস টেক প্রস্তুত!</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    দৈর্ঘ্য: {recordingSeconds} সেকেন্ড
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadMyTake}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="আপনার রেকর্ড করা অডিও ডাউনলোড করুন"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
