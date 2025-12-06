import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FeedbackResult, UserProfile } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Analyze Face to determine demographics for voice selection
export const analyzeUserFace = async (base64Image: string): Promise<{ gender: 'male' | 'female' | 'neutral', ageRange: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this selfie. JSON Output: { gender: 'male' | 'female' | 'neutral', ageRange: string }" }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gender: { type: Type.STRING, enum: ['male', 'female', 'neutral'] },
            ageRange: { type: Type.STRING }
          },
          required: ['gender', 'ageRange']
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No analysis returned");
  } catch (e) {
    console.error("Face Analysis Error (Quota may be exceeded):", e);
    // Fallback so app doesn't crash
    return { gender: 'neutral', ageRange: '25-35' };
  }
};

// 2. Generate "Future Professional" Avatar
export const generateAvatar = async (base64Image: string, gender: string): Promise<string> => {
  try {
    // Updated prompt for consistency and removing futuristic theme
    const prompt = `Transform this person into a professional, confident public speaker giving a speech. Bust up portrait. Keep facial features recognizable. Professional studio lighting. Blurred neutral background. High quality, photorealistic, 4k. Aspect ratio 1:1.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
        ]
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated");
  } catch (e) {
    console.error("Avatar Gen Error (Quota may be exceeded):", e);
    return base64Image; // Fallback to original image
  }
};

// 3. Analyze Pronunciation
export const analyzePronunciation = async (audioBase64: string, targetText: string): Promise<FeedbackResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
          { text: `The user is trying to say: "${targetText}". Analyze the pronunciation. Be encouraging but precise. Return JSON.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 100" },
            mispronounced: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of words pronounced incorrectly" },
            feedback: { type: Type.STRING, description: "Constructive feedback, max 2 sentences" }
          },
          required: ['score', 'mispronounced', 'feedback']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No analysis result");
  } catch (e) {
    console.error("Pronunciation Analysis Error (Quota may be exceeded):", e);
    // Fallback simulation
    return { 
      score: Math.floor(Math.random() * 20) + 70, 
      mispronounced: [], 
      feedback: "Great energy! (Note: API quota exceeded, this is a simulation). Keep practicing!" 
    };
  }
};

// 4. Generate TTS (Future Voice)
export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  try {
    // voiceName should be 'Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'
    const safeVoice = ['Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'].includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: safeVoice },
            },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      return audioData;
    }
    throw new Error("No audio returned");
  } catch (e) {
    console.error("TTS Error (Quota may be exceeded):", e);
    return null; // Return null to trigger fallback in UI
  }
};

// 5. Translate Text
export const translateText = async (text: string, targetLang: string = "Turkish"): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `Translate the following feedback text to ${targetLang}. Only return the translated string, nothing else. Text: "${text}"` }
        ]
      }
    });

    if (response.text) {
        return response.text.trim();
    }
    return text; // Fallback to original if failure
  } catch (e) {
    console.error("Translation Error (Quota may be exceeded):", e);
    return text;
  }
};