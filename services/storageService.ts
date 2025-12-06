import { UserProfile, UserProgress } from "../types";

const KEY_PROFILE = 'future_fluent_profile';
const KEY_PROGRESS = 'future_fluent_progress';

export const storageService = {
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEY_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveProgress: (progress: UserProgress) => {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  },

  getProgress: (): UserProgress => {
    const data = localStorage.getItem(KEY_PROGRESS);
    if (data) return JSON.parse(data);
    return {
      completedSentences: {},
      unlockedLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] // All unlocked for demo purposes
    };
  },

  saveScore: (sentenceId: string, score: number) => {
    const progress = storageService.getProgress();
    const currentBest = progress.completedSentences[sentenceId] || 0;
    
    if (score > currentBest) {
      progress.completedSentences[sentenceId] = score;
      storageService.saveProgress(progress);
    }
    return progress;
  },

  clearAll: () => {
    localStorage.removeItem(KEY_PROFILE);
    localStorage.removeItem(KEY_PROGRESS);
  }
};