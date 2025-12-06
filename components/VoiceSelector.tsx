import React from 'react';
import { X, Check, Mic2 } from 'lucide-react';

interface VoiceSelectorProps {
  currentVoice: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voice: string) => void;
}

const VOICES = [
  { name: 'Kore', gender: 'Female', desc: 'Calm & Soothing' },
  { name: 'Fenrir', gender: 'Male', desc: 'Deep & Authoritative' },
  { name: 'Puck', gender: 'Male', desc: 'Energetic & Playful' },
  { name: 'Charon', gender: 'Male', desc: 'Deep & Steady' },
  { name: 'Zephyr', gender: 'Female', desc: 'Gentle & Clear' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ currentVoice, isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl shadow-2xl p-6 border-t border-slate-700 animate-[slide-in-from-bottom_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Select Voice</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white border border-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-4">
          {VOICES.map((voice) => (
            <button
              key={voice.name}
              onClick={() => {
                onSelect(voice.name);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                currentVoice === voice.name 
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentVoice === voice.name ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                    {voice.name[0]}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className={`font-semibold ${currentVoice === voice.name ? 'text-cyan-400' : 'text-slate-200'}`}>
                    {voice.name}
                  </span>
                  <span className="text-xs text-slate-400">{voice.gender} • {voice.desc}</span>
                </div>
              </div>
              {currentVoice === voice.name && <Check className="w-5 h-5 text-cyan-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};