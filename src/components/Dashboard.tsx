/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Clock, 
  TrendingUp, 
  Award, 
  Flame,
  Star,
  ChevronRight,
  BookOpen,
  Zap,
  Users,
  Trophy,
  Download,
  BarChart2,
  Layout,
  Trash2,
  User as UserIcon,
  Settings,
  CreditCard,
  Grid,
  Globe,
  Loader2,
  HelpCircle,
  Compass,
  Target,
  Brain
} from 'lucide-react';
import { StudentProfile, LeaderboardEntry, OfflineLesson, SimplifiedLanguage, ClassLevel, LearningStyle, Flashcard } from '../types';
import { useEffect, useState } from 'react';
import { getLearningPath, getKnowledgeMap, getDailyChallenge } from '../services/geminiService';
import { cn } from '../lib/utils';
import AnalyticsSection from './AnalyticsSection';
import FlashcardOverlay from './FlashcardOverlay';
import KnowledgeMap from './KnowledgeMap';

interface DashboardProps {
  profile: StudentProfile;
  onStartLesson: () => void;
  onStartOfflineLesson: (lesson: OfflineLesson) => void;
  onUpdateProfile: (data: Partial<StudentProfile>) => void;
}

export default function Dashboard({ profile, onStartLesson, onStartOfflineLesson, onUpdateProfile }: DashboardProps) {
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [knowledgeMap, setKnowledgeMap] = useState<any>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [masteryForecast, setMasteryForecast] = useState<any>(null);
  const [viewType, setViewType] = useState<'list' | 'galaxy'>('list');
  const [loading, setLoading] = useState(true);
  const [loadingGalaxy, setLoadingGalaxy] = useState(false);
  const [activeTab, setActiveTab] = useState<'path' | 'analytics' | 'downloads' | 'profile' | 'flashcards'>('path');
  const [offlineLessons, setOfflineLessons] = useState<OfflineLesson[]>([]);
  const [offlineSearch, setOfflineSearch] = useState('');
  const [offlineSort, setOfflineSort] = useState<'date' | 'topic' | 'size'>('date');
  const [error, setError] = useState<string | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAnswered, setChallengeAnswered] = useState(false);
  const [challengeCorrect, setChallengeCorrect] = useState<boolean | null>(null);

  // Profile editing state
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    const saved = localStorage.getItem('offline_lessons');
    if (saved) {
      setOfflineLessons(JSON.parse(saved));
    }
  }, []);

  const deleteOfflineLesson = (id: string) => {
    const updated = offlineLessons.filter(l => l.id !== id);
    setOfflineLessons(updated);
    localStorage.setItem('offline_lessons', JSON.stringify(updated));
  };
  
  const leaderboard: LeaderboardEntry[] = [
    { name: 'Yash', xp: profile.xp, rank: 1, isCurrentUser: true },
    { name: 'Aditya', xp: 2450, rank: 2 },
    { name: 'Priya', xp: 2100, rank: 3 },
    { name: 'Rahul', xp: 1850, rank: 4 }
  ].sort((a,b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  const badges = [
    { id: '1', name: 'Fast Learner', icon: Zap, unlocked: true },
    { id: '2', name: 'Quiz Master', icon: Trophy, unlocked: profile.score ? profile.score >= 4 : false },
    { id: '3', name: 'Streak 7', icon: Flame, unlocked: false },
    { id: '4', name: 'Expert', icon: Award, unlocked: profile.level === 'Advanced' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        setLoading(true);
        const [path, challenge, forecast] = await Promise.all([
          getLearningPath(profile),
          getDailyChallenge(profile),
          getMasteryPrediction(profile).catch(() => null)
        ]);
        setLearningPath(path);
        setDailyChallenge(challenge);
        setMasteryForecast(forecast);
      } catch (e: any) {
        setError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile.topic, profile.classLevel, profile.subject, profile.language]);

  const loadGalaxyMap = async () => {
    if (knowledgeMap) return;
    try {
      setLoadingGalaxy(true);
      const data = await getKnowledgeMap(profile);
      setKnowledgeMap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGalaxy(false);
    }
  };

  useEffect(() => {
    if (viewType === 'galaxy') {
      loadGalaxyMap();
    }
  }, [viewType]);

  const handleSaveProfile = () => {
    onUpdateProfile(tempProfile);
    setEditMode(false);
  };

  const handleChallenge = (answer: string) => {
    const correct = answer.toLowerCase() === dailyChallenge.correctAnswer.toLowerCase();
    setChallengeCorrect(correct);
    setChallengeAnswered(true);
    if (correct) {
      onUpdateProfile({ xp: (profile.xp || 0) + 150 });
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {showFlashcards && profile.flashcards && (
        <FlashcardOverlay flashcards={profile.flashcards} onClose={() => setShowFlashcards(false)} />
      )}
      
      {/* Header / Hero */}
      <section className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              {profile.level} Level
            </span>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{profile.xp} Mastery Points</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-[-0.03em] leading-[0.95]"
          >
            Hello, <span className="text-indigo-200">{profile.name}</span>! Ready to level up?
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-indigo-100 text-lg mb-8"
          >
            You're currently mastering <strong>{profile.topic}</strong>. Your current goal: Reach the Top 3 on the leaderboard!
          </motion.p>
          
          <div className="flex flex-wrap gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={onStartLesson}
              className="group flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              <Play size={20} className="fill-indigo-600" />
              <span>Start Next Lesson</span>
            </motion.button>

            {profile.flashcards && profile.flashcards.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  boxShadow: ["0px 0px 0px rgba(99, 102, 241, 0)", "0px 0px 20px rgba(99, 102, 241, 0.4)", "0px 0px 0px rgba(99, 102, 241, 0)"]
                }}
                transition={{ 
                  delay: 0.4,
                  boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.4 }
                }}
                onClick={() => setShowFlashcards(true)}
                className="group flex items-center gap-3 bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all border border-indigo-400 active:scale-95 shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <CreditCard size={20} className="relative z-10" />
                <span className="relative z-10">Quick Flashcards ({profile.flashcards.length})</span>
                <motion.div 
                  className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <TrendingUp 
          size={200} 
          className="absolute -right-10 bottom-0 text-white/5 -rotate-12 pointer-events-none hidden md:block" 
        />
      </section>

      {/* Rewards & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Badges */}
        <section className="glass-card rounded-[2.5rem] p-8">
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <Award className="text-indigo-600" size={24} />
            My Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all",
                  badge.unlocked ? "bg-indigo-50 border-indigo-200" : "bg-neutral-50 border-neutral-100 grayscale opacity-50"
                )}
              >
                <div className={cn("mb-2 p-3 rounded-full", badge.unlocked ? "bg-white text-indigo-600 shadow-sm" : "bg-neutral-200 text-neutral-400")}>
                  <badge.icon size={24} />
                </div>
                <span className="text-[10px] uppercase font-black text-center leading-none">{badge.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mini Leaderboard */}
        <section className="glass-card rounded-[2.5rem] p-8">
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            Class Leaderboard
          </h2>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div 
                key={entry.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  entry.isCurrentUser ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn("w-6 font-bold", entry.isCurrentUser ? "text-indigo-200" : "text-neutral-400")}>#{entry.rank}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                    {entry.name[0]}
                  </div>
                  <span className="font-bold">{entry.name} {entry.isCurrentUser && "(You)"}</span>
                </div>
                <span className={cn("text-sm font-black", entry.isCurrentUser ? "text-indigo-100" : "text-indigo-600")}>
                  {entry.xp} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-100 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'path', label: 'Learning Path', icon: Layout },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
          { id: 'downloads', label: 'Offline', icon: Download },
          { id: 'profile', label: 'My Profile', icon: UserIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative",
              activeTab === tab.id ? "text-indigo-600" : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          {activeTab === 'path' ? (
            <div className="space-y-6">
              {/* Mastery Pulse Widget */}
              <div className="glass-card p-6 rounded-[2.5rem] bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100 flex items-center justify-between shadow-sm overflow-hidden relative group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic serif">Mastery Pulse</p>
                  <h3 className="text-xl font-bold text-neutral-800">Current Progress</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-display font-black text-indigo-600">{profile.xp}</span>
                    <span className="text-xs font-bold text-neutral-400">/ 5000 XP to Level Up</span>
                  </div>
                </div>
                <div className="flex gap-1 items-end h-12 relative z-10">
                   {[...Array(12)].map((_, i) => (
                     <motion.div 
                       key={i}
                       initial={{ height: 10 }}
                       animate={{ height: 10 + Math.random() * 30 }}
                       transition={{ repeat: Infinity, duration: 1 + Math.random(), repeatType: 'reverse' }}
                       className="w-1.5 rounded-full bg-indigo-200 group-hover:bg-indigo-400 transition-colors"
                     />
                   ))}
                </div>
                <div className="absolute -right-4 -top-4 text-indigo-600/5 group-hover:text-indigo-600/10 transition-colors">
                  <TrendingUp size={120} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Adaptive Path</h2>
                <div className="flex gap-2">
                  <div className="flex p-1 bg-neutral-100 rounded-xl">
                    <button 
                      onClick={() => setViewType('list')}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewType === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                      )}
                    >
                      <Grid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewType('galaxy')}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewType === 'galaxy' ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                      )}
                    >
                      <Globe size={16} />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tighter self-center ml-2">Class {profile.classLevel}</span>
                </div>
              </div>

              <div className="space-y-4">
                {error ? (
                  <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
                    <Zap className="mx-auto text-red-500 mb-4" size={32} />
                    <h4 className="text-red-900 font-bold mb-2">Something went wrong</h4>
                    <p className="text-red-700 text-sm mb-4">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100"
                    >
                      Try Again
                    </button>
                  </div>
                ) : loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-3xl" />
                  ))
                ) : viewType === 'galaxy' ? (
                  <div className="space-y-4">
                    {loadingGalaxy ? (
                      <div className="h-[500px] bg-neutral-50 rounded-[3rem] border border-neutral-100 flex flex-col items-center justify-center p-12 text-center">
                        <Loader2 className="text-indigo-600 animate-spin mb-4" size={40} />
                        <h4 className="font-display font-bold text-lg">Synthesizing Neural Map...</h4>
                        <p className="text-sm text-neutral-400 font-serif italic max-w-xs mx-auto mt-2">Connecting concepts across your customized learning universe.</p>
                      </div>
                    ) : knowledgeMap ? (
                      <KnowledgeMap data={knowledgeMap} />
                    ) : null}
                  </div>
                ) : (
                  learningPath.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={cn(
                        "relative group p-6 rounded-3xl border-2 transition-all flex items-center justify-between",
                        item.status === 'locked' 
                          ? "bg-neutral-50 border-neutral-100 opacity-60 grayscale" 
                          : (item.status === 'completed' ? "bg-white border-green-100 shadow-sm" : "bg-white border-indigo-100 shadow-md ring-4 ring-indigo-50")
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold",
                          item.status === 'completed' ? "bg-green-100 text-green-600" : (item.status === 'locked' ? "bg-neutral-200 text-neutral-500" : "bg-indigo-600 text-white")
                        )}>
                          {item.status === 'completed' ? <CheckCircle2 size={24} /> : i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg text-neutral-900">{item.title}</h4>
                            {item.status === 'locked' && <Lock size={14} className="text-neutral-400" />}
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                              <Clock size={12} /> {item.duration}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {item.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={item.status === 'locked'}
                        onClick={onStartLesson}
                        className={cn(
                          "p-3 rounded-full transition-all active:scale-90 shrink-0",
                          item.status === 'unlocked' || item.status === 'in-progress'
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                            : "bg-neutral-100 text-neutral-400"
                        )}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Your Performance Report</h2>
              <AnalyticsSection analytics={profile.analytics || []} />
            </div>
          ) : activeTab === 'flashcards' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Flashcard Bank</h2>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                  {profile.flashcards?.length || 0} Cards
                </div>
              </div>
              
              {profile.flashcards && profile.flashcards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.flashcards.map((card) => (
                    <div 
                      key={card.id}
                      className="p-6 bg-white border border-neutral-100 rounded-3xl hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setShowFlashcards(true)}
                    >
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Question</p>
                      <p className="font-bold text-neutral-800 line-clamp-2 mb-4">{card.front}</p>
                      <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400">Click to flip all</span>
                        <ChevronRight size={16} className="text-neutral-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                  <CreditCard size={40} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500 font-medium">No flashcards yet. Generate some during a lesson!</p>
                </div>
              )}
            </div>
          ) : activeTab === 'profile' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">My Personal Profile</h2>
                <button 
                  onClick={() => {
                    if (editMode) handleSaveProfile();
                    else {
                      setTempProfile(profile);
                      setEditMode(true);
                    }
                  }}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                    editMode ? "bg-green-600 text-white shadow-lg shadow-green-100" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {editMode ? <CheckCircle2 size={18} /> : <Settings size={18} />}
                  {editMode ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Account Basics</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Name</label>
                      {editMode ? (
                        <input 
                          type="text"
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.name || ''}
                          onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                        />
                      ) : (
                        <p className="font-bold text-neutral-900">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Class Label</label>
                      {editMode ? (
                        <select 
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.classLevel}
                          onChange={e => setTempProfile({...tempProfile, classLevel: Number(e.target.value) as ClassLevel})}
                        >
                          {[...Array(12)].map((_, i) => <option key={i} value={i+1}>Class {i+1}</option>)}
                        </select>
                      ) : (
                        <p className="font-bold text-neutral-900">Class {profile.classLevel}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Learning Preferences</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Learning Language</label>
                      {editMode ? (
                        <select 
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.language}
                          onChange={e => setTempProfile({...tempProfile, language: e.target.value as SimplifiedLanguage})}
                        >
                          {Object.values(SimplifiedLanguage).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                      ) : (
                        <p className="font-bold text-neutral-900">{profile.language}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Learning Style</label>
                      {editMode ? (
                        <select 
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.learningStyle}
                          onChange={e => setTempProfile({...tempProfile, learningStyle: e.target.value as LearningStyle})}
                        >
                          {Object.values(LearningStyle).map(style => <option key={style} value={style}>{style}</option>)}
                        </select>
                      ) : (
                        <p className="font-bold text-neutral-900">{profile.learningStyle}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl sm:col-span-2">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Target Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Current Subject</label>
                      {editMode ? (
                        <input 
                          type="text"
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.subject || ''}
                          onChange={e => setTempProfile({...tempProfile, subject: e.target.value})}
                        />
                      ) : (
                        <p className="font-bold text-neutral-900">{profile.subject}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500">Current Topic</label>
                      {editMode ? (
                        <input 
                          type="text"
                          className="w-full mt-1 p-2 border border-neutral-200 rounded-lg text-sm"
                          value={tempProfile.topic || ''}
                          onChange={e => setTempProfile({...tempProfile, topic: e.target.value})}
                        />
                      ) : (
                        <p className="font-bold text-neutral-900">{profile.topic}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">Learning Mastery Status</h4>
                  <p className="text-sm text-indigo-700 opacity-70">Based on your performance, you are at an <strong>{profile.level}</strong> level.</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display font-black text-indigo-600">{profile.xp} XP</p>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Total Points</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'downloads' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900">Offline Library</h2>
                  <p className="text-xs text-neutral-400 font-serif italic">Access your saved lessons without an internet connection</p>
                </div>
                <div className="flex items-center gap-2">
                   <select 
                    value={offlineSort}
                    onChange={(e) => setOfflineSort(e.target.value as any)}
                    className="bg-neutral-100 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-100"
                   >
                     <option value="date">Sort: Newest</option>
                     <option value="topic">Sort: A-Z</option>
                     <option value="size">Sort: Size</option>
                   </select>
                   <div className="px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold">
                    {offlineLessons.length} Items
                  </div>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search your downloads..."
                  value={offlineSearch}
                  onChange={(e) => setOfflineSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <Settings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 rotate-90" />
              </div>
              
              <div className="grid gap-4">
                {offlineLessons.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                    <Download size={40} className="mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500 font-medium font-serif italic">Your library is empty. Start saving lessons!</p>
                  </div>
                ) : (
                  offlineLessons
                    .filter(l => l.topic.toLowerCase().includes(offlineSearch.toLowerCase()))
                    .sort((a, b) => {
                      if (offlineSort === 'date') return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
                      if (offlineSort === 'size') return (b.size || 0) - (a.size || 0);
                      return a.topic.localeCompare(b.topic);
                    })
                    .map((lesson) => (
                      <motion.div 
                        layout
                        key={lesson.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-white border border-neutral-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-all group gap-4"
                      >
                        <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold">{lesson.topic}</h4>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Saved {new Date(lesson.savedAt).toLocaleDateString()}</p>
                            {lesson.size && <span className="text-[10px] text-indigo-400 font-bold">{(lesson.size / 1024).toFixed(1)} KB</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onStartOfflineLesson(lesson)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                          Open Lesson
                        </button>
                        <button 
                          onClick={() => deleteOfflineLesson(lesson.id)}
                          className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Mastery Forecast Card - ELITE FEATURE */}
          {masteryForecast && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target size={20} className="text-white" />
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Mastery Forecast</div>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-5xl font-display font-black text-white">{masteryForecast.mastery}%</span>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Conceptual Mastery</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Upcoming Hurdle</p>
                    <p className="text-xs font-bold font-serif italic text-white line-clamp-1">{masteryForecast.hurdle}</p>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-indigo-200">Time to Mastery:</span>
                    <span className="text-[10px] font-black text-white">{masteryForecast.hoursRemaining} Hours</span>
                  </div>
                </div>

                <div className="p-4 bg-white text-indigo-900 rounded-2xl relative overflow-hidden group/btn">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Pro Tip</p>
                  <p className="text-xs font-bold leading-tight">{masteryForecast.recommendation}</p>
                  <div className="absolute inset-0 bg-indigo-50 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-300 opacity-20" />
                </div>
              </div>
              
              {/* Background Accent */}
              <div className="absolute -left-4 -bottom-4 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Brain size={120} />
              </div>
            </motion.div>
          )}

          {/* Quick Brain Teaser Card (Daily Challenge) */}
          <div className="bg-neutral-900 rounded-[2rem] p-6 text-white shadow-xl shadow-neutral-200 relative overflow-hidden group">
            <div className="relative z-10">
              <Zap className="text-yellow-400 mb-4" size={32} />
              
              {!dailyChallenge ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-white/10 rounded-md w-3/4" />
                  <div className="h-10 bg-white/10 rounded-md" />
                </div>
              ) : challengeAnswered ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                    challengeCorrect ? "bg-green-500" : "bg-red-500"
                  )}>
                    {challengeCorrect ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{challengeCorrect ? "Brilliant!" : "Not quite!"}</h4>
                  <p className="text-xs text-neutral-400 mb-4 font-serif italic">{dailyChallenge.explanation}</p>
                  {challengeCorrect && (
                    <div className="inline-block px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-yellow-400">
                      +150 XP EARNED
                    </div>
                  )}
                </motion.div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">{dailyChallenge.title}</h3>
                  <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                    {dailyChallenge.challenge}
                  </p>
                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">The Question:</p>
                    <p className="text-sm font-medium italic font-serif">"{dailyChallenge.question}"</p>
                  </div>
                  <div className="grid gap-2">
                    <button 
                      onClick={() => handleChallenge(dailyChallenge.correctAnswer)}
                      className="w-full py-3 bg-white text-neutral-900 rounded-xl font-bold text-sm tracking-tight hover:bg-neutral-100 transition-all active:scale-95"
                    >
                      Solve Now
                    </button>
                    <button 
                      onClick={() => setChallengeAnswered(true)}
                      className="w-full py-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      I'm Stuck
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
              <Compass size={120} />
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="glass-card rounded-[2.5rem] p-6 border-neutral-100">
            <h3 className="text-lg font-display font-bold mb-5 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              Daily Challenges
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-orange-950">Speed Learner</span>
                  <span className="text-[10px] font-black px-2 py-1 bg-white text-orange-600 rounded-md">+100 XP</span>
                </div>
                <p className="text-xs text-orange-900/70 mb-3">Complete 2 lessons in under 15 minutes today.</p>
                <div className="w-full h-1.5 bg-orange-200/50 rounded-full overflow-hidden">
                   <div className="w-1/2 h-full bg-orange-500" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-blue-950">Perfect Quiz</span>
                  <span className="text-[10px] font-black px-2 py-1 bg-white text-blue-600 rounded-md">+250 XP</span>
                </div>
                <p className="text-xs text-blue-900/70">Score 10/10 on any Advanced Quiz.</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-neutral-400 mt-6 uppercase font-bold tracking-widest">Resets in 12h 45m</p>
          </div>

          {/* Activity Log */}
          <div className="glass-card rounded-[2rem] p-6 border-neutral-100">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-600" />
              Recent Activity
            </h3>
            <div className="space-y-5">
              {[
                { title: 'Intro to Fractions', time: '2h ago', points: '+20 XP', type: 'lesson' },
                { title: 'Quiz: Equal Parts', time: '5h ago', points: '+50 XP', type: 'quiz' },
                { title: 'Word Problems', time: 'Yesterday', points: '+15 XP', type: 'practice' }
              ].map((log, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{log.title}</p>
                      <p className="text-xs text-neutral-500">{log.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600">{log.points}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-neutral-400 border-t border-neutral-50 pt-4 hover:text-indigo-600 transition-colors">
              VIEW FULL HISTORY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
