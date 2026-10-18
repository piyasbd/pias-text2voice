import React from 'react';
import { Sparkles, Mic, Layers, Sliders, FileText, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export type AppTab = 'catalog' | 'studio' | 'compare' | 'practice' | 'document';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  apiHealth: { hasApiKey: boolean; engine: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, apiHealth }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <Mic size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>ভয়েস ইমোশন মাস্টার স্টুডিও</span>
                  <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                    Voice Emotion Studio
                  </span>
                </h1>
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] px-2 py-0.5 rounded-full font-medium">
                  ২৫টি মানবিক আবেগ
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                  ৫০ জন কণ্ঠশিল্পী (২-৯০ বছর)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                মানুষের কণ্ঠস্বর ও আবেগের পূর্ণাঙ্গ মাস্টার গাইড • ৫০টি বাংলাদেশী কণ্ঠ (ছেলে-মেয়ে উভয়)
              </p>
            </div>
          </div>

          {/* Engine Status & Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px]">
                {apiHealth?.hasApiKey ? 'Gemini 3.8 Flash TTS' : 'Web Audio DSP Engine'}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80">
              <CheckCircle2 size={12} className="text-sky-400" />
              <span>৬টি প্রধান ক্যাটাগরি</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-slate-900/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'catalog'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>১. মাস্টার গাইড তালিকা (Catalog)</span>
          </button>

          <button
            onClick={() => onTabChange('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'studio'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders size={14} />
            <span>২. টেক্সট-টু-ভয়েস স্টুডিও (TTS Studio)</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'compare'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ArrowLeftRight size={14} />
            <span>৩. আবেগ তুলনা মোড (Compare)</span>
          </button>

          <button
            onClick={() => onTabChange('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'practice'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic size={14} />
            <span>৪. কণ্ঠ অনুশীলন রুম (Practice)</span>
          </button>

          <button
            onClick={() => onTabChange('document')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'document'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>৫. পূর্ণাঙ্গ গাইড ডকুমেন্ট (Handbook)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
