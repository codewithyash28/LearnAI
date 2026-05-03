/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  Trophy, 
  User, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import Onboarding from './components/Onboarding';
import Assessment from './components/Assessment';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import { StudentProfile, Quiz, OfflineLesson, TopicAnalytics } from './types';

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'assessment' | 'dashboard' | 'lesson' | 'quiz' | 'offline-lesson'>('onboarding');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [activeOfflineLesson, setActiveOfflineLesson] = useState<OfflineLesson | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('learnai_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile) as StudentProfile;
      
      // Calculate Streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = parsed.lastActive;
      
      let updatedStreak = parsed.streak || 1;
      
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Increment if yesterday
          updatedStreak += 1;
        } else if (diffDays > 1) {
          // Reset if more than 1 day missed
          updatedStreak = 1;
        }
      }
      
      const sessionProfile = { ...parsed, streak: updatedStreak, lastActive: today };
      setProfile(sessionProfile);
      localStorage.setItem('learnai_profile', JSON.stringify(sessionProfile));
      setStep('dashboard');
    }
  }, []);

  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    setStep('assessment');
    localStorage.setItem('learnai_profile', JSON.stringify(newProfile));
  };

  const handleAssessmentComplete = (score: number) => {
    let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    if (score >= 4) level = 'Advanced';
    else if (score >= 3) level = 'Intermediate';

    const updatedProfile = { 
      ...profile!, 
      level, 
      score,
      xp: profile!.xp + (score * 50)
    };
    setProfile(updatedProfile);
    setCurrentLevel(level);
    localStorage.setItem('learnai_profile', JSON.stringify(updatedProfile));
    setStep('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('learnai_profile');
    setProfile(null);
    setStep('onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation - Only show if not in onboarding/assessment */}
      {step !== 'onboarding' && step !== 'assessment' && profile && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <GraduationCap size={24} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">LearnAI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setStep('dashboard')} className={`flex items-center gap-2 hover:text-indigo-600 transition-colors ${step === 'dashboard' ? 'text-indigo-600 font-medium' : 'text-neutral-500'}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center gap-2 text-neutral-500 hover:text-indigo-600 transition-colors">
                <BookOpen size={18} />
                <span>Courses</span>
              </button>
              <button className="flex items-center gap-2 text-neutral-500 hover:text-indigo-600 transition-colors">
                <Trophy size={18} />
                <span>Rewards</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100 animate-pulse">
                <Zap size={16} className="text-orange-600 fill-orange-600" />
                <span className="text-xs font-bold text-orange-700">{profile.streak} DAY STREAK</span>
              </div>
              <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-sm font-medium">{profile.name}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{profile.board} • CLASS {profile.classLevel}</span>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className={`${step !== 'onboarding' && step !== 'assessment' ? 'pt-24 pb-12' : ''} px-4`}>
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Onboarding onComplete={handleOnboardingComplete} />
              </motion.div>
            )}

            {step === 'assessment' && profile && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <Assessment profile={profile} onComplete={handleAssessmentComplete} />
              </motion.div>
            )}

            {step === 'dashboard' && profile && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard 
                  profile={profile} 
                  onStartLesson={() => setStep('lesson')}
                  onStartOfflineLesson={(lesson) => {
                    setActiveOfflineLesson(lesson);
                    setStep('offline-lesson');
                  }}
                  onUpdateProfile={(updatedData) => {
                    const newProfile = { ...profile, ...updatedData };
                    setProfile(newProfile);
                    localStorage.setItem('learnai_profile', JSON.stringify(newProfile));
                  }}
                />
              </motion.div>
            )}

            {step === 'offline-lesson' && profile && activeOfflineLesson && (
              <motion.div
                key="offline-lesson"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <LessonView 
                  profile={profile} 
                  level="Offline"
                  offlineContent={activeOfflineLesson.content}
                  onBack={() => setStep('dashboard')}
                  onTakeQuiz={() => setStep('quiz')}
                  onUpdateProfile={(updatedData) => {
                    const newProfile = { ...profile, ...updatedData };
                    setProfile(newProfile);
                    localStorage.setItem('learnai_profile', JSON.stringify(newProfile));
                  }}
                />
              </motion.div>
            )}

            {step === 'lesson' && profile && (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <LessonView 
                  profile={profile} 
                  level={currentLevel}
                  onBack={() => setStep('dashboard')}
                  onTakeQuiz={() => setStep('quiz')}
                  onUpdateProfile={(updatedData) => {
                    const newProfile = { ...profile, ...updatedData };
                    setProfile(newProfile);
                    localStorage.setItem('learnai_profile', JSON.stringify(newProfile));
                  }}
                />
              </motion.div>
            )}

            {step === 'quiz' && profile && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.5 }}
              >
                <QuizView 
                  profile={profile}
                  level={currentLevel}
                  onComplete={() => setStep('dashboard')}
                  onBack={() => setStep('dashboard')}
                  onUpdateProfile={(updatedData) => {
                    const newProfile = { ...profile, ...updatedData };
                    setProfile(newProfile);
                    localStorage.setItem('learnai_profile', JSON.stringify(newProfile));
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-8 text-center text-neutral-400 text-sm border-t border-neutral-100 mt-auto">
        <p>© 2026 LearnAI Platform • made with Code with Yash • Powered by Code With Yash</p>
      </footer>
    </div>
  );
}
