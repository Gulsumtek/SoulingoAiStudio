# Future Fluent You 🎙️✨

**Future Fluent You** is an AI-powered pronunciation coach that helps you visualize and hear your future fluent self. By combining advanced multimodal AI with a mobile-first experience, it provides real-time feedback on your English speaking skills and generates a professional avatar of you delivering perfect speech.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_TypeScript_|_Gemini_AI-blue)

## 🌟 Features

*   **Future Avatar Generation**: Takes a selfie and uses **Gemini 2.5 Flash Image** to generate a confident, professional version of you ("Future You").
*   **Smart Demographics Analysis**: Automatically analyzes age and gender from your selfie to select the most appropriate TTS voice preset.
*   **Real-time Pronunciation Coaching**: 
    *   Records your voice.
    *   Analyzes accuracy, fluency, and mispronounced words using **Gemini 2.5 Flash**.
    *   Provides instant feedback and a scoring system (0-100).
*   **"Future You" Simulation**: Uses **Gemini 2.5 Flash TTS** (or browser fallback) to let you hear the sentence spoken perfectly by your AI avatar.
*   **Structured Learning Path**: 
    *   Includes courses from **A1 (Beginner)** to **C2 (Proficiency)**.
    *   Tracks progress and high scores locally.
*   **Instant Translation**: Translate feedback into Turkish (or other languages) on demand.
*   **Resilient Design**: Includes fallback mechanisms for API quotas (Mock data mode & Browser Text-to-Speech).

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
    *   *Text/Audio Analysis*: `gemini-2.5-flash`
    *   *Image Generation*: `gemini-2.5-flash-image`
    *   *Text-to-Speech*: `gemini-2.5-flash-preview-tts`
*   **State Management**: React Hooks + LocalStorage
*   **Audio**: Web Audio API (PCM Decoding), MediaRecorder API

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Google Gemini API Key (Get one at [aistudio.google.com](https://aistudiocdn.com/aistudio.google.com))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/future-fluent-you.git
    cd future-fluent-you
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your API key:
    ```env
    API_KEY=your_actual_api_key_here
    ```
    *(Note: The application expects `process.env.API_KEY` to be injected via your bundler or environment configuration)*.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📱 Usage

1.  **Onboarding**: Grant camera/microphone permissions.
2.  **Create Profile**: Take a selfie or upload a photo. The AI will generate your "Future Avatar".
3.  **Select Course**: Choose your English level (A1-C2).
4.  **Practice**:
    *   Read the sentence aloud and tap the **Microphone** button.
    *   View your score and specific feedback.
    *   Tap the **Play** button on your avatar to hear the "Future You" speak the sentence perfectly.
5.  **Translate**: Tap "Türkçeye Çevir" to understand the feedback in Turkish.

## ⚠️ API Quota & Fallbacks

This app uses advanced Gemini models. If you hit the API rate limits (Quota Exceeded):
1.  **Face Analysis**: Will default to generic demographics.
2.  **Avatar**: Will use your original photo.
3.  **Pronunciation**: Will provide simulated scores/feedback.
4.  **Audio**: Will switch to the browser's built-in Text-to-Speech engine so you can continue practicing.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
