import React, { useState } from 'react';
import {
  Volume2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Info,
  Play,
  Pause,
  Loader2,
  Mic,
  Tag,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES, EMOTIONS_DATA, EmotionItem } from '../data/emotionsData';
import { studioAudioEngine } from '../utils/audioEngine';

interface EmotionCatalogProps {
  onSelectForStudio: (emotion: EmotionItem) => void;
  onSelectForCompare: (emotion: EmotionItem) => void;
  onSelectForPractice: (emotion: EmotionItem) => void;
}

export const EmotionCatalog: React.FC<EmotionCatalogProps> = ({
  onSelectForStudio,
  onSelectForCompare,
  onSelectForPractice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter emotions based on category & search query
  const filteredEmotions = EMOTIONS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.nameBn.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.voiceTypeBn.toLowerCase().includes(query) ||
      item.exampleBn.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlayPreview = async (item: EmotionItem) => {
    if (playingId === item.id) {
      studioAudioEngine.stop();
      setPlayingId(null);
      return;
    }

    setLoadingId(item.id);
    try {
      const res = await studioAudioEngine.generateVoice({
        text: item.exampleBn,
        emotionId: item.id,
        voiceName: item.recommendedVoice,
        pitch: item.pitch,
        speed: item.speed,
        energy: item.energy,
        tremolo: item.tremolo,
        reverb: item.reverb,
        stylePrompt: item.speechStyleInstruction,
      });

      setPlayingId(item.id);
      setLoadingId(null);

      if (res.sourceType === 'gemini') {
        studioAudioEngine.playUrl(res.audioUrl, () => {
          setPlayingId(null);
        });
      } else {
        await studioAudioEngine.playBuffer();
        const unregister = studioAudioEngine.subscribe((state) => {
          if (state.isPlaying === false) {
            setPlayingId(null);
            unregister();
          }
        });
      }
    } catch (err) {
      console.error(err);
      setLoadingId(null);
      setPlayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero / Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-3">
            <Sparkles size={14} />
            <span>ভয়েস অ্যাক্টিং ও অডিও ডাবিং মাস্টার গাইড</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            মানুষের কণ্ঠস্বর ও আবেগের পূর্ণাঙ্গ মাস্টার গাইড
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            বাংলা ও আন্তর্জাতিক ভয়েস ওভারের জন্য নির্ধারিত ৬টি প্রধান স্তর এবং ২৫টি নিখুঁত আবেগ। প্রতিটি আবেগের সাথে রয়েছে সুনির্দিষ্ট কণ্ঠের ধরন, বাস্তব সংলাপের উদাহরণ, স্কেল নির্দেশিকা এবং ডিরেক্টর নোট।
          </p>
        </div>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            সকল আবেগ ({EMOTIONS_DATA.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat.nameBn.split('.')[0]}. {cat.nameBn.split('.')[1]?.trim().split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">({cat.emotions.length})</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="আবেগ বা সংলাপ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
          />
        </div>
      </div>

      {/* Grid of Emotions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmotions.map((item) => {
          const isPlayingThis = playingId === item.id;
          const isLoadingThis = loadingId === item.id;
          const isNotesExpanded = expandedNotes[item.id] || false;

          return (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/40 group relative overflow-hidden backdrop-blur-sm"
            >
              {/* Subtle category bar at top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color.from} ${item.color.to}`} />

              <div>
                {/* Header: Title + Category */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {item.nameBn}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.nameEn}
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.color.badgeBg}`}>
                    {item.categoryNameBn.split('.')[1]?.trim()}
                  </span>
                </div>

                {/* Voice Characteristics (কণ্ঠের ধরন) */}
                <div className="my-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1">
                    <Volume2 size={13} className="text-sky-400" />
                    <span>কণ্ঠের ধরন:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.voiceTypeBn}
                  </p>
                </div>

                {/* Sample Dialogue (উদাহরণ) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-slate-400">উদাহরণ সংলাপ:</span>
                    <span className="text-[10px] font-mono text-slate-500">Bengali Dialogue</span>
                  </div>
                  <div className="relative bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 pr-14 text-sm text-amber-200/90 italic font-medium leading-relaxed">
                    "{item.exampleBn}"

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => handlePlayPreview(item)}
                      disabled={isLoadingThis}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition ${
                        isPlayingThis
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border border-sky-500/30'
                      }`}
                      title="সংলাপটি অডিওতে শুনুন"
                    >
                      {isLoadingThis ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isPlayingThis ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} className="translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  {/* English meaning */}
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 italic">
                    "{item.exampleEn}"
                  </p>
                </div>

                {/* Acoustic metrics pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    পিচ: {item.pitch > 0 ? `+${item.pitch}%` : `${item.pitch}%`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    গতি: {item.speed}x
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    কণ্ঠশিল্পী: {item.recommendedVoice}
                  </span>
                  {item.tremolo > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      কাঁপুনি (Tremolo)
                    </span>
                  )}
                </div>

                {/* Director Acting Notes Accordion */}
                <div className="border-t border-slate-800/80 pt-2 mb-3">
                  <button
                    onClick={() => toggleNotes(item.id)}
                    className="w-full flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 transition py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info size={12} className="text-amber-400" />
                      <span>পরিচালকের অভিনয় নির্দেশিকা (Director Notes)</span>
                    </span>
                    {isNotesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isNotesExpanded && (
                    <div className="mt-2 bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 text-xs text-amber-100/80 leading-relaxed">
                      {item.actorNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => onSelectForStudio(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 text-xs font-semibold border border-sky-500/20 transition group/btn"
                >
                  <Sliders size={13} />
                  <span>স্টুডিওতে এডিট</span>
                  <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => onSelectForPractice(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  title="এই আবেগে ভয়েস প্র্যাকটিস করুন"
                >
                  <Mic size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmotions.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <p className="text-slate-400 text-sm">
            "{searchQuery}" এর সাথে মিলে এমন কোনো আবেগ পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে খুঁজুন।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 text-xs text-sky-400 hover:underline"
          >
            সব আবেগ দেখুন
          </button>
        </div>
      )}
    </div>
  );
};
