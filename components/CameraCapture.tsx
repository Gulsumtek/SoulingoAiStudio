import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Upload, Image as ImageIcon, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onCancel?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Don't alert immediately, user might prefer upload
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get Base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip prefix
        const base64 = result.split(',')[1];
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden rounded-none md:rounded-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>

      {/* Cancel Button (if provided) */}
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-black/60 hover:text-white transition-all border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-6 z-10 w-full px-8 pb-12 pt-8">
         <p className="text-white/90 text-sm font-medium text-center drop-shadow-md max-w-xs">
            Take a selfie or upload a photo to generate your Future Avatar
         </p>
         
         <div className="flex items-center gap-8">
            {/* Upload Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center backdrop-blur-md">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs">Upload</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />

            {/* Shutter Button */}
            <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
                <div className="w-18 h-18 rounded-full bg-white border-2 border-black" />
            </button>

            {/* Refresh/Flip (Visual Only for now) */}
            <button 
              onClick={() => startCamera()}
              className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center backdrop-blur-md">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-xs">Retry</span>
            </button>
         </div>
      </div>
    </div>
  );
};