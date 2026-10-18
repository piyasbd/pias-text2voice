import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Download } from 'lucide-react';
import { studioAudioEngine } from '../utils/audioEngine';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  emotionTitle?: string;
  sourceType?: 'gemini' | 'dsp-synthesizer' | 'web-speech';
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onDownload: () => void;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  duration,
  currentTime,
  audioBlob,
  audioUrl,
  emotionTitle = 'Default Emotion',
  sourceType = 'gemini',
  onPlayToggle,
  onSeek,
  onDownload,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      const w = width;
      const h = height;

      ctx.clearRect(0, 0, w, h);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const freqData = studioAudioEngine.getFrequencyData();
      const waveData = studioAudioEngine.getWaveformData();

      // Render Frequency Bars (Lower Spectrum)
      const barCount = 48;
      const barWidth = (w / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        const val = isPlaying ? (freqData[i * 2] || 0) / 255 : Math.sin(i * 0.2 + Date.now() * 0.002) * 0.15 + 0.1;
        const barHeight = Math.max(4, val * (h * 0.55));
        const x = i * (barWidth + 2);
        const y = h - barHeight - 2;

        const gradient = ctx.createLinearGradient(0, y, 0, h);
        if (sourceType === 'gemini') {
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.85)'); // Cyan/Sky
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
        } else {
          gradient.addColorStop(0, 'rgba(244, 63, 94, 0.85)'); // Rose
          gradient.addColorStop(1, 'rgba(234, 88, 12, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      // Render Center Oscilloscope Wave Line
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = sourceType === 'gemini' ? '#38bdf8' : '#fb7185';
      ctx.shadowColor = sourceType === 'gemini' ? '#0ea5e9' : '#f43f5e';
      ctx.shadowBlur = isPlaying ? 10 : 2;

      const sliceWidth = w / waveData.length;
      let x = 0;

      for (let i = 0; i < waveData.length; i++) {
        let v = isPlaying ? waveData[i] / 128.0 : 1.0;
        let y = (v * (h * 0.45)) + (h * 0.05);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Playhead cursor
      if (duration > 0) {
        const progress = Math.min(1, Math.max(0, currentTime / duration));
        const headX = progress * w;

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX, 0);
        ctx.lineTo(headX, h);
        ctx.stroke();

        // Glow head circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX, h * 0.5, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, sourceType]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (duration <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs || 0);
    const ms = Math.floor(((secs || 0) % 1) * 10);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${m}:${remS < 10 ? '0' : ''}${remS}.${ms}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header info */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">
            {emotionTitle}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
            sourceType === 'gemini'
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {sourceType === 'gemini' ? 'Gemini 3.8 Audio 24kHz' : 'Web Audio DSP'}
          </span>
        </div>

        <div className="font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
          <span className="text-sky-400">{formatTime(currentTime)}</span>
          <span className="text-slate-600"> / </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative group cursor-pointer mb-3 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-850">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-28 block"
        />
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-white/[0.02] flex items-center justify-center">
          <span className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur">
            ক্লিক করে অবস্থান পরিবর্তন করুন (Seek)
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayToggle}
            disabled={duration <= 0 && !audioUrl}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isPlaying ? 'বিরতি দিন (Pause)' : 'শুনুন (Play)'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>

          <button
            onClick={() => onSeek(0)}
            disabled={duration <= 0 && !audioUrl}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition disabled:opacity-40"
            title="শুরু থেকে চালান (Restart)"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            disabled={!audioBlob && !audioUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-sky-500/40"
          >
            <Download size={14} className="text-sky-400" />
            <span>WAV ডাউনলোড</span>
          </button>
        </div>
      </div>
    </div>
  );
};
