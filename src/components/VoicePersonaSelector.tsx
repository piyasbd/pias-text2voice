import React, { useState, useMemo } from 'react';
import {
  Search,
  User,
  Users,
  Sparkles,
  Check,
  Play,
  Pause,
  Filter,
  Baby,
  GraduationCap,
  Briefcase,
  Heart,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  BANGLADESHI_VOICE_PERSONAS,
  BangladeshiVoicePersona,
} from '../data/bangladeshiVoices';
import { VOICE_ACTORS } from '../data/emotionsData';
import { studioAudioEngine } from '../utils/audioEngine';

interface VoicePersonaSelectorProps {
  selectedPersonaId: string;
  onSelectPersona: (persona: BangladeshiVoicePersona) => void;
  selectedCoreVoice?: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  onSelectCoreVoice?: (voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon') => void;
}

export const VoicePersonaSelector: React.FC<VoicePersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Active persona object
  const activePersona = useMemo(() => {
    return (
      BANGLADESHI_VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) ||
      BANGLADESHI_VOICE_PERSONAS[0]
    );
  }, [selectedPersonaId]);

  // Filtered personas
  const filteredPersonas = useMemo(() => {
    return BANGLADESHI_VOICE_PERSONAS.filter((p) => {
      // Age filter
      if (selectedAgeFilter !== 'all' && p.ageCategoryBn !== selectedAgeFilter) {
        return false;
      }
      // Gender filter
      if (selectedGenderFilter !== 'all' && p.gender !== selectedGenderFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchesAge = p.age.toString() === q || `${p.age} বছর`.includes(q);
        const matchesType = p.typeBn.toLowerCase().includes(q) || p.descriptionBn.toLowerCase().includes(q);
        const matchesRole = p.recommendedRole.toLowerCase().includes(q);
        if (!matchesName && !matchesAge && !matchesType && !matchesRole) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedAgeFilter, selectedGenderFilter]);

  // Quick audio preview for a voice persona
  const handlePreviewVoice = async (persona: BangladeshiVoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewPlayingId === persona.id) {
      studioAudioEngine.stop();
      setPreviewPlayingId(null);
      return;
    }

    setPreviewPlayingId(persona.id);

    // Sample greeting adapted to age
    let sampleLine = 'নমস্কার, আমি আপনার কণ্ঠশিল্পী।';
    if (persona.age <= 4) {
      sampleLine = 'আমি কথা বলতে পারি! আমাকে কেমন লাগছে?';
    } else if (persona.age <= 10) {
      sampleLine = 'আমরা একসাথে অনেক মজার গল্প আর ছড়া শুনব!';
    } else if (persona.age <= 18) {
      sampleLine = 'চমৎকার একটি গল্পের মধ্য দিয়ে আমাদের আড্ডা শুরু হোক!';
    } else if (persona.age >= 70) {
      sampleLine = 'অনেক আশীর্বাদ রইল বাবা, পরম যত্নে এগিয়ে চলো।';
    } else {
      sampleLine = 'আপনার যেকোনো স্ক্রিপ্টকে জীবন্ত করে তোলাই আমার লক্ষ্য।';
    }

    try {
      const res = await studioAudioEngine.generateVoice({
        text: sampleLine,
        emotionId: 'warm-affectionate',
        voiceName: persona.baseGeminiVoice,
        pitch: persona.pitchDefault,
        speed: persona.speedDefault,
        energy: 0.85,
        tremolo: persona.tremoloDefault,
        reverb: persona.age >= 70 ? 'warm_room' : 'dry',
        stylePrompt: `${persona.speechPrompt}. Warm friendly speaking introduction in Bengali.`,
      });

      if (res.sourceType === 'gemini') {
        studioAudioEngine.playUrl(res.audioUrl, () => setPreviewPlayingId(null));
      } else {
        await studioAudioEngine.playBuffer();
        const unsub = studioAudioEngine.subscribe((state) => {
          if (state.isPlaying === false) {
            setPreviewPlayingId(null);
            unsub();
          }
        });
      }
    } catch {
      setPreviewPlayingId(null);
    }
  };

  const getAgeBadgeStyle = (age: number) => {
    if (age <= 10) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    if (age <= 18) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    if (age <= 29) return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    if (age <= 49) return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    if (age <= 69) return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>কণ্ঠশিল্পী (Voice Persona)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                বাংলাদেশের ৫০ জন (২-৯০ বছর)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              বিভিন্ন বয়সের ছেলে ও মেয়ে উভয়ের বাস্তব বাংলাদেশি বাচনভঙ্গি
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-200 text-xs p-1"
          title={isExpanded ? 'ছোট করুন' : 'বড় করুন'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Active Persona Spotlight Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-sky-500/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-base font-extrabold leading-none">{activePersona.age}</span>
            <span className="text-[9px] text-slate-400 font-normal">বছর</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                {activePersona.nameBn}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({activePersona.nameEn})
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded border ${getAgeBadgeStyle(activePersona.age)}`}>
                {activePersona.genderBn}
              </span>
            </div>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {activePersona.typeBn}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span className="text-sky-400">প্রস্তাবিত:</span>
              <span>{activePersona.recommendedRole}</span>
              <span>•</span>
              <span className="font-mono">পিচ: {activePersona.pitchDefault > 0 ? `+${activePersona.pitchDefault}%` : `${activePersona.pitchDefault}%`}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => handlePreviewVoice(activePersona, e)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition flex-shrink-0 ${
            previewPlayingId === activePersona.id
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/30'
          }`}
        >
          {previewPlayingId === activePersona.id ? (
            <>
              <Pause size={13} />
              <span>নমুনা শুনছেন...</span>
            </>
          ) : (
            <>
              <Play size={13} className="translate-x-0.5" />
              <span>ভয়েস স্যাম্পল শুনুন</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="নাম, বয়স (যেমন ২, ২৫, ৯০) বা ভূমিকা খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
                />
              </div>

              {/* Gender selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setSelectedGenderFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedGenderFilter === 'all'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  সব ({BANGLADESHI_VOICE_PERSONAS.length})
                </button>
                <button
                  onClick={() => setSelectedGenderFilter('male')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedGenderFilter === 'male'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ছেলে / পুরুষ (২৫)
                </button>
                <button
                  onClick={() => setSelectedGenderFilter('female')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedGenderFilter === 'female'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  মেয়ে / নারী (২৫)
                </button>
              </div>
            </div>

            {/* Age Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 'all', label: 'সকল বয়স (২-৯০)' },
                { id: 'শিশু (২-১০ বছর)', label: 'শিশু (২-১০ বছর)' },
                { id: 'কিশোর-কিশোরী (১১-১৮ বছর)', label: 'কিশোর (১১-১৮)' },
                { id: 'তারুণ্য ও যুব (১৯-২৯ বছর)', label: 'তরুণ (১৯-২৯)' },
                { id: 'পরিপক্ব বয়স্ক (৩০-৪৯ বছর)', label: 'পরিপক্ব (৩০-৪৯)' },
                { id: 'প্রবীণ ও বয়োজ্যেষ্ঠ (৫০-৬৯ বছর)', label: 'প্রবীণ (৫০-৬৯)' },
                { id: 'দাদু-নানী ও শতায়ু (৭০-৯০ বছর)', label: 'দাদু-নানী (৭০-৯০)' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedAgeFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition border ${
                    selectedAgeFilter === filter.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Grid of Personas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredPersonas.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              const isPlaying = previewPlayingId === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => onSelectPersona(persona)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-2 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/70 border-slate-850 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-100 group-hover:text-sky-300 transition-colors">
                        {persona.nameBn}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getAgeBadgeStyle(persona.age)}`}>
                        {persona.age} বছর
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {persona.genderBn}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      {persona.typeBn}
                    </p>

                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {persona.recommendedRole}
                    </div>
                  </div>

                  {/* Play audio preview button */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handlePreviewVoice(persona, e)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300'
                      }`}
                      title={`${persona.nameBn}-এর নমুনা ভয়েস শুনুন`}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
                    </button>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPersonas.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-850">
              কোনো কণ্ঠশিল্পী পাওয়া যায়নি। অনুসন্ধান পরিবর্তন করুন।
            </div>
          )}
        </>
      )}
    </div>
  );
};
