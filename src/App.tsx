import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { EmotionCatalog } from './components/EmotionCatalog';
import { VoiceStudio } from './components/VoiceStudio';
import { EmotionCompare } from './components/EmotionCompareModal';
import { VoiceActorPractice } from './components/VoiceActorPractice';
import { MasterGuideDoc } from './components/MasterGuideDoc';
import { EmotionItem, EMOTIONS_DATA } from './data/emotionsData';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('catalog');
  const [selectedEmotionForStudio, setSelectedEmotionForStudio] = useState<EmotionItem | null>(null);
  const [selectedEmotionForCompare, setSelectedEmotionForCompare] = useState<EmotionItem | null>(null);
  const [selectedEmotionForPractice, setSelectedEmotionForPractice] = useState<EmotionItem | null>(null);
  const [apiHealth, setApiHealth] = useState<{ hasApiKey: boolean; engine: string } | null>(null);

  useEffect(() => {
    // Check server backend health
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiHealth(data);
      })
      .catch(() => {
        setApiHealth({ hasApiKey: false, engine: 'Web Audio DSP Engine' });
      });
  }, []);

  const handleSelectForStudio = (emotion: EmotionItem) => {
    setSelectedEmotionForStudio(emotion);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectForCompare = (emotion: EmotionItem) => {
    setSelectedEmotionForCompare(emotion);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectForPractice = (emotion: EmotionItem) => {
    setSelectedEmotionForPractice(emotion);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiHealth={apiHealth}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'catalog' && (
          <EmotionCatalog
            onSelectForStudio={handleSelectForStudio}
            onSelectForCompare={handleSelectForCompare}
            onSelectForPractice={handleSelectForPractice}
          />
        )}

        {activeTab === 'studio' && (
          <VoiceStudio initialEmotion={selectedEmotionForStudio} />
        )}

        {activeTab === 'compare' && (
          <EmotionCompare
            initialEmotionA={selectedEmotionForCompare || EMOTIONS_DATA[5]}
            initialEmotionB={EMOTIONS_DATA[17]}
          />
        )}

        {activeTab === 'practice' && (
          <VoiceActorPractice initialEmotion={selectedEmotionForPractice} />
        )}

        {activeTab === 'document' && <MasterGuideDoc />}
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            মানুষের কণ্ঠস্বর ও আবেগের পূর্ণাঙ্গ মাস্টার গাইড • টেক্সট-টু-ভয়েস স্টুডিও
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Gemini 3.8 Flash Audio</span>
            <span>•</span>
            <span>Web Audio 24kHz DSP</span>
            <span>•</span>
            <span>২৫টি মৌলিক অভিব্যক্তি</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
