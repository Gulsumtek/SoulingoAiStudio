import React from 'react';
import { EnglishLevel, COURSES } from '../types';
import { ArrowRight, Star, Trophy } from 'lucide-react';

interface CourseSelectorProps {
  onSelectLevel: (level: EnglishLevel) => void;
  completedSentences: Record<string, number>;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelectLevel, completedSentences }) => {
  const levels: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const getLevelProgress = (level: EnglishLevel) => {
    const sentences = COURSES[level];
    const completedCount = sentences.filter(s => (completedSentences[s.id] || 0) > 0).length;
    const totalScore = sentences.reduce((sum, s) => sum + (completedSentences[s.id] || 0), 0);
    const avgScore = completedCount > 0 ? Math.round(totalScore / sentences.length) : 0; // Avg over total to encourage completion
    return { completedCount, total: sentences.length, avgScore };
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Level</h2>
        <p className="text-slate-400">Choose a difficulty to start practicing.</p>
      </div>

      <div className="grid gap-4">
        {levels.map((level) => {
          const { completedCount, total, avgScore } = getLevelProgress(level);
          const progressPercent = (completedCount / total) * 100;
          
          let title = "Beginner";
          let desc = "Basic phrases & greetings";
          let color = "from-green-500 to-emerald-600";
          
          if (level === 'A2') {
            title = "Elementary";
            desc = "Daily routines & opinions";
            color = "from-cyan-500 to-blue-600";
          }
          if (level === 'B1') {
            title = "Intermediate";
            desc = "Work, travel & dreams";
            color = "from-indigo-500 to-purple-600";
          }
          if (level === 'B2') {
            title = "Upper Intermediate";
            desc = "Complex arguments & abstract topics";
            color = "from-fuchsia-500 to-pink-600";
          }
          if (level === 'C1') {
            title = "Advanced";
            desc = "Social, academic & professional";
            color = "from-amber-500 to-orange-600";
          }
          if (level === 'C2') {
            title = "Proficiency";
            desc = "Nuance, idioms & literature";
            color = "from-red-500 to-rose-600";
          }

          return (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              className="group relative overflow-hidden bg-slate-800 border border-slate-700 rounded-2xl p-5 text-left transition-all hover:border-slate-500 hover:shadow-lg active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white`}>{level}</span>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">{desc}</p>
                </div>
                {avgScore > 0 && (
                   <div className="flex flex-col items-end">
                       <div className="flex items-center gap-1 text-yellow-400 font-bold">
                           <Star className="w-4 h-4 fill-current" />
                           {avgScore}
                       </div>
                       <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Score</span>
                   </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative z-10">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{completedCount} / {total}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`} 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity`} />
            </button>
          );
        })}
      </div>
      
      {/* Total Stats Footer */}
      <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center gap-8">
          <div className="text-center">
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  {Object.values(completedSentences).length}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Sentences Mastered</div>
          </div>
      </div>
    </div>
  );
};