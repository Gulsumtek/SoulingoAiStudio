// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// PCM Decoding for Gemini TTS
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playRawPcmAudio(
  base64Audio: string,
  sampleRate: number = 24000
): Promise<void> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate,
    });

    // Resume context if suspended (common in browsers requiring user interaction)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const byteData = decodeBase64(base64Audio);
    const dataInt16 = new Int16Array(byteData.buffer);
    
    // Create buffer
    const buffer = audioContext.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Convert Int16 to Float32 [-1.0, 1.0]
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    return new Promise((resolve) => {
      source.onended = () => {
        source.disconnect();
        audioContext.close();
        resolve();
      };
      source.start();
    });
  } catch (error) {
    console.error("Error playing PCM audio", error);
    throw error;
  }
}