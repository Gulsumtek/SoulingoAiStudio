import React, { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { AudioRecorder } from './components/AudioRecorder';
import { ScoreGauge } from './components/ScoreGauge';
import { AvatarPlayer } from './components/AvatarPlayer';
import { VoiceSelector } from './components/VoiceSelector';
import { CourseSelector } from './components/CourseSelector';
import { AppState, UserProfile, FeedbackResult, EnglishLevel, COURSES, PracticeSentence, UserProgress } from './types';
import { analyzeUserFace, generateAvatar, analyzePronunciation, generateSpeech, translateText } from './services/geminiService';
import { storageService } from './services/storageService';
import { Sparkles, ArrowRight, RefreshCcw, User, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, LogOut, Languages, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({ completedSentences: {}, unlockedLevels: [] });
  
  // Practice State
  const [currentLevel, setCurrentLevel] = useState<EnglishLevel>('A1');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceSelectorOpen, setIsVoiceSelectorOpen] = useState(false);

  // Translation State
  const [translatedFeedback, setTranslatedFeedback] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Audio Preloading State
  const [preloadedAudio, setPreloadedAudio] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const currentLevelSentences = COURSES[currentLevel];
  const currentSentence: PracticeSentence = currentLevelSentences[currentSentenceIndex];

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load persisted data
    const profile = storageService.getProfile();
    const progress = storageService.getProgress();

    setUserProgress(progress);

    if (profile) {
      setUserProfile(profile);
      setAppState(AppState.COURSE_SELECT);
    }
  }, []);

  // --- PRELOAD AUDIO ---
  useEffect(() => {
    if (appState === AppState.PRACTICE && userProfile) {
      let isMounted = true;

      const preloadAudio = async () => {
        setIsAudioLoading(true);
        setPreloadedAudio(null); 
        try {
          // generateSpeech now returns string | null. It does not throw.
          const audio = await generateSpeech(currentSentence.text, userProfile.voiceName);
          if (isMounted) {
            setPreloadedAudio(audio);
          }
        } catch (e) {
          console.error("Failed to preload audio:", e);
        } finally {
          if (isMounted) {
            setIsAudioLoading(false);
          }
        }
      };

      preloadAudio();

      return () => {
        isMounted = false;
      };
    }
  }, [appState, userProfile?.voiceName, currentSentence.text, userProfile]);

  // --- ACTIONS ---

  const handleCapture = async (base64Image: string) => {
    setAppState(AppState.ANALYZING_USER);
    try {
      // Parallel execution for speed
      const [analysis] = await Promise.all([
        analyzeUserFace(base64Image),
      ]);

      const generatedAvatar = await generateAvatar(base64Image, analysis.gender);

      let voiceName = userProfile?.voiceName || 'Fenrir'; // Preserve existing or Default Male
      if (!userProfile && analysis.gender === 'female') voiceName = 'Kore';

      const newProfile: UserProfile = {
        originalImage: base64Image,
        avatarImage: generatedAvatar,
        gender: analysis.gender,
        ageRange: analysis.ageRange,
        voiceName: voiceName
      };

      storageService.saveProfile(newProfile);
      setUserProfile(newProfile);
      setAppState(AppState.COURSE_SELECT);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
      setAppState(AppState.CAMERA);
    }
  };

  const handleRecordingComplete = async (audioBase64: string) => {
    setIsProcessing(true);
    setFeedback(null);
    setTranslatedFeedback(null); // Reset translation
    try {
      const result = await analyzePronunciation(audioBase64, currentSentence.text);
      setFeedback(result);
      
      // Save Score
      const newProgress = storageService.saveScore(currentSentence.id, result.score);
      setUserProgress(newProgress);

    } catch (e) {
      console.error(e);
      alert("Failed to analyze audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslateFeedback = async () => {
    if (!feedback || isTranslating) return;

    if (translatedFeedback) {
        // Toggle off
        setTranslatedFeedback(null);
        return;
    }

    setIsTranslating(true);
    try {
        const translated = await translateText(feedback.feedback);
        setTranslatedFeedback(translated);
    } catch (e) {
        console.error("Translation failed", e);
    } finally {
        setIsTranslating(false);
    }
  };

  const handleLevelSelect = (level: EnglishLevel) => {
    setCurrentLevel(level);
    setCurrentSentenceIndex(0);
    setFeedback(null);
    setTranslatedFeedback(null);
    setAppState(AppState.PRACTICE);
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setFeedback(null);
      setTranslatedFeedback(null);
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < currentLevelSentences.length - 1) {
      setFeedback(null);
      setTranslatedFeedback(null);
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
        // Finished Level
        setAppState(AppState.COURSE_SELECT);
    }
  };

  const handleVoiceSelect = (voice: string) => {
    if (userProfile) {
      const updated = { ...userProfile, voiceName: voice };
      setUserProfile(updated);
      storageService.saveProfile(updated);
    }
  };

  const handleResetProfile = () => {
      if(confirm("Are you sure? This will delete your avatar and progress.")) {
          storageService.clearAll();
          window.location.reload();
      }
  };

  // --- RENDER VIEWS ---

  if (appState === AppState.INTRO) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-900 to-slate-900 z-0"></div>
        <div className="z-10 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-cyan-500/20">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Future Fluent You</h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            See your future professional self. <br/>
            Master English pronunciation with <br/>
            <span className="text-cyan-400 font-semibold">Real-time AI Coaching</span>.
          </p>
          <button
            onClick={() => setAppState(AppState.CAMERA)}
            className="w-full bg-white text-slate-900 font-bold text-lg py-4 rounded-xl shadow-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (appState === AppState.CAMERA) {
    return (
      <div className="h-screen bg-black w-full overflow-hidden">
        <CameraCapture 
            onCapture={handleCapture} 
            onCancel={userProfile ? () => setAppState(AppState.COURSE_SELECT) : undefined} 
        />
      </div>
    );
  }

  if (appState === AppState.ANALYZING_USER) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Constructing Future Self...</h2>
        <p className="text-slate-400">Analyzing biometrics and generating avatar.</p>
      </div>
    );
  }

  if (appState === AppState.COURSE_SELECT) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setAppState(AppState.CAMERA)}
                      className="group relative w-10 h-10 rounded-full overflow-hidden border border-slate-600 hover:border-cyan-500 transition-colors"
                    >
                        {userProfile?.avatarImage && (
                            <>
                              <img src={`data:image/jpeg;base64,${userProfile.avatarImage}`} className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40">
                                <RefreshCcw className="w-4 h-4 text-white" />
                              </div>
                            </>
                        )}
                    </button>
                    <span className="font-semibold text-white">My Courses</span>
                </div>
                <button onClick={handleResetProfile} className="text-slate-500 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-1 overflow-y-auto">
                <CourseSelector 
                    onSelectLevel={handleLevelSelect} 
                    completedSentences={userProgress.completedSentences} 
                />
            </main>
        </div>
      )
  }

  // PRACTICE STATE
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <button 
            onClick={() => setAppState(AppState.COURSE_SELECT)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
        >
            <LayoutGrid className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{currentLevel} COURSE</span>
             <div className="flex gap-1 mt-1">
                 {currentLevelSentences.map((_, idx) => (
                     <div key={idx} className={`w-2 h-1 rounded-full ${idx === currentSentenceIndex ? 'bg-cyan-400' : idx < currentSentenceIndex ? 'bg-slate-500' : 'bg-slate-800'}`} />
                 ))}
             </div>
        </div>

        <button 
          onClick={() => setIsVoiceSelectorOpen(true)}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-full border border-cyan-900 hover:bg-cyan-900/50 transition-colors"
        >
          <User className="w-3 h-3" />
          <span className="hidden xs:inline">{userProfile?.voiceName}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 max-w-lg mx-auto w-full gap-6 pb-24">
        
        {/* Card */}
        <div className="w-full bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-lg text-center relative">
             {/* Nav Arrows */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2">
                <button 
                    onClick={handlePrevSentence}
                    disabled={currentSentenceIndex === 0}
                    className="p-2 bg-slate-800 rounded-full border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2">
                 <button 
                    onClick={handleNextSentence}
                    disabled={currentSentenceIndex === currentLevelSentences.length - 1 && !feedback} // Can only go next if done or not last? Let's allow nav.
                    className="p-2 bg-slate-800 rounded-full border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

           <span className="text-xs text-slate-500 uppercase tracking-widest mb-4 block">
               Sentence {currentSentenceIndex + 1}
           </span>
           <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-2">
             "{currentSentence.text}"
           </p>
           
           {/* Current High Score */}
           {userProgress.completedSentences[currentSentence.id] ? (
               <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-green-400">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   Best Score: {userProgress.completedSentences[currentSentence.id]}
               </div>
           ) : (
             <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-slate-500">
                 Not completed yet
             </div>
           )}
        </div>

        {/* Recorder Area - Always visible initially */}
        {!feedback && (
             <div className="flex flex-col items-center animate-in fade-in duration-500">
                <AudioRecorder 
                    onRecordingComplete={handleRecordingComplete} 
                    isProcessing={isProcessing} 
                />
                
                {/* Optional: Show avatar preview statically or hint */}
                <div className="mt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     {userProfile && <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700"><img src={`data:image/jpeg;base64,${userProfile.avatarImage}`} className="w-full h-full object-cover" /></div>}
                </div>
             </div>
        )}

        {/* Feedback & Avatar Area - Visible after recording */}
        {feedback && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
             
             {/* The Future You Player is now unlocked */}
             {userProfile && (
                <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center">
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4">Listen to Future You</p>
                    <AvatarPlayer 
                        avatarBase64={userProfile.avatarImage} 
                        audioData={preloadedAudio}
                        text={currentSentence.text}
                        isLoadingAudio={isAudioLoading}
                    />
                </div>
             )}

             <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex-1 pr-4">
                   <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Feedback</h3>
                        <button 
                            onClick={handleTranslateFeedback}
                            disabled={isTranslating}
                            className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                        >
                            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Languages className="w-3 h-3"/>}
                            {translatedFeedback ? "Show Original" : "Türkçeye Çevir"}
                        </button>
                   </div>
                   
                   <div className="relative">
                        <p className={`text-sm text-slate-300 mb-2 transition-opacity ${isTranslating ? 'opacity-50' : 'opacity-100'}`}>
                            {translatedFeedback || feedback.feedback}
                        </p>
                   </div>

                   {feedback.mispronounced.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-2">
                       {feedback.mispronounced.map((word, i) => (
                         <span key={i} className="text-xs text-red-300 bg-red-900/30 px-1.5 py-0.5 rounded">
                           {word}
                         </span>
                       ))}
                     </div>
                   )}
                </div>
                <ScoreGauge score={feedback.score} />
             </div>
             
             <div className="flex gap-3 sticky bottom-6">
               <button 
                 onClick={() => {
                     setFeedback(null);
                     setTranslatedFeedback(null);
                 }}
                 className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium flex items-center justify-center gap-2 hover:bg-slate-600 shadow-lg"
               >
                 <RefreshCcw className="w-4 h-4" /> Try Again
               </button>
               <button 
                 onClick={handleNextSentence}
                 className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-cyan-500 shadow-lg shadow-cyan-900/20"
               >
                 Next <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </div>
        )}
      </main>

      {userProfile && (
        <VoiceSelector 
          currentVoice={userProfile.voiceName} 
          isOpen={isVoiceSelectorOpen} 
          onClose={() => setIsVoiceSelectorOpen(false)} 
          onSelect={handleVoiceSelect} 
        />
      )}
    </div>
  );
};

export default App;