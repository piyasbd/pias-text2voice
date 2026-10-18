import React, { useState } from 'react';
import { FileText, Copy, Check, Printer, Download, Sparkles, BookOpen } from 'lucide-react';
import { CATEGORIES } from '../data/emotionsData';
import { BANGLADESHI_VOICE_PERSONAS } from '../data/bangladeshiVoices';

export const MasterGuideDoc: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const generateFullText = () => {
    let text = `মানুষের কণ্ঠস্বর ও আবেগের পূর্ণাঙ্গ মাস্টার গাইড (Voice Emotion Master List)\n\n`;

    CATEGORIES.forEach((cat) => {
      text += `${cat.nameBn} (${cat.nameEn})\n`;
      cat.emotions.forEach((em) => {
        text += `\n${em.nameBn} (${em.nameEn}):\n`;
        text += `কণ্ঠের ধরন: ${em.voiceTypeBn}\n`;
        text += `উদাহরণ: "${em.exampleBn}"\n`;
        text += `পরিচালকের নোট: ${em.actorNotes}\n`;
      });
      text += `\n----------------------------------------\n\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-sky-400" />
            <h2 className="text-xl font-bold text-white">
              পূর্ণাঙ্গ মাস্টার গাইড হ্যান্ডবুক (Master Guide Handbook)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            ভয়েস আর্টিস্ট, স্ক্রিপ্ট রাইটার, সাউন্ড ডিজাইনার ও ডাবিং ডিরেক্টরদের জন্য সম্পূর্ণ রেফারেন্স।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি করুন'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
          >
            <Printer size={14} />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Structured Document Body */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 sm:p-10 space-y-10 shadow-2xl text-slate-200">
        <div className="border-b border-slate-800 pb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            মানুষের কণ্ঠস্বর ও আবেগের পূর্ণাঙ্গ মাস্টার গাইড
          </h1>
          <p className="text-sm font-mono text-sky-400 mt-1">
            Voice Emotion Master List & Acoustic Delivery Guide
          </p>
        </div>

        {/* 6 Major Categories */}
        <div className="space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-slate-800">
                <span className="w-2.5 h-6 rounded-full bg-sky-500" />
                <h3 className="text-lg font-bold text-white">
                  {cat.nameBn}
                  <span className="text-xs font-normal text-slate-400 ml-2 font-mono">
                    ({cat.nameEn})
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cat.emotions.map((em) => (
                  <div
                    key={em.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-300">
                        {em.nameBn}
                        <span className="text-xs font-mono text-slate-400 font-normal ml-2">
                          ({em.nameEn})
                        </span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        ভয়েস: {em.recommendedVoice}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <strong className="text-slate-400 font-medium">কণ্ঠের ধরন: </strong>
                      {em.voiceTypeBn}
                    </div>

                    <div className="text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-sky-200 italic font-medium">
                      <span className="text-slate-500 not-italic mr-1.5 font-bold">উদাহরণ:</span>
                      "{em.exampleBn}"
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-850">
                      <strong className="text-amber-400">অভিনয় টিপস: </strong>
                      {em.actorNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 50 Bangladeshi Voice Personas Directory */}
        <div className="space-y-6 pt-6 border-t-2 border-slate-800">
          <div className="flex items-center gap-2.5 pb-2 border-b-2 border-slate-800">
            <span className="w-2.5 h-6 rounded-full bg-emerald-500" />
            <div>
              <h3 className="text-lg font-bold text-white">
                বাংলাদেশের ৫০ জন কণ্ঠশিল্পীর রূপরেখা ও বয়সভিত্তিক ডিরেক্টরি (২ - ৯০ বছর)
              </h3>
              <p className="text-xs text-slate-400">
                ছেলে ও মেয়ে উভয়ের বিভিন্ন বয়সের টোন, বাচনভঙ্গি এবং আদর্শ ভূমিকা
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BANGLADESHI_VOICE_PERSONAS.map((vp) => (
              <div
                key={vp.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">
                      {vp.nameBn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({vp.nameEn})
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold">
                    {vp.age} বছর • {vp.genderBn}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {vp.typeBn}
                </p>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                  <span className="text-amber-300">ভূমিকা: {vp.recommendedRole}</span>
                  <span className="font-mono text-slate-500">পিচ: {vp.pitchDefault > 0 ? `+${vp.pitchDefault}%` : `${vp.pitchDefault}%`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
