import React, { useState } from 'react';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { playRawPcmAudio } from '../services/audioUtils';

interface AvatarPlayerProps {
  avatarBase64: string;
  audioData: string | null;
  text: string;
  isLoadingAudio: boolean;
}

export const AvatarPlayer: React.FC<AvatarPlayerProps> = ({ avatarBase64, audioData, text, isLoadingAudio }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying || isLoadingAudio) return;

    setIsPlaying(true);

    try {
      if (audioData) {
        // Play AI Voice (PCM)
        await playRawPcmAudio(audioData);
      } else {
        // Fallback: Browser TTS
        await new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
      }
    } catch (e) {
      console.error("Playback failed", e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        {/* Animated Rings when playing */}
        {isPlaying && (
           <>
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/50 animate-[ping_1.5s_ease-in-out_infinite]" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
           </>
        )}
        
        <div className={`relative w-full h-full rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl transition-transform duration-300 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
          <img 
            src={`data:image/jpeg;base64,${avatarBase64}`} 
            alt="Future Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <button
          onClick={handlePlay}
          disabled={isPlaying || isLoadingAudio}
          className={`absolute -bottom-2 right-0 p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10 ${
            !audioData && !isLoadingAudio ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          {isLoadingAudio ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : !audioData ? (
             <Volume2 className="w-6 h-6 opacity-80" /> 
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
      </div>
      <p className="text-slate-400 text-sm font-medium">
        {isPlaying 
          ? 'Speaking...' 
          : isLoadingAudio 
            ? 'Preparing Voice...' 
            : !audioData 
              ? 'Hear "Future You" (Fallback Voice)' 
              : 'Hear "Future You"'}
      </p>
    </div>
  );
};