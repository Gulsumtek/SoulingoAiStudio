import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { blobToBase64 } from '../services/audioUtils';

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string) => void;
  isProcessing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        onRecordingComplete(base64);
        
        // Cleanup tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error", err);
      alert("Microphone access needed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center animate-pulse text-cyan-400">
        <Loader2 className="w-16 h-16 animate-spin mb-2" />
        <span className="text-sm font-medium">AI Analyzing...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
          isRecording 
            ? 'bg-red-500 scale-110 shadow-red-500/50' 
            : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/30'
        }`}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white fill-current" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </button>
      <p className="mt-4 text-slate-400 text-sm font-medium">
        {isRecording ? "Recording... Tap to stop" : "Tap to record"}
      </p>
    </div>
  );
};