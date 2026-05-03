/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  PlayCircle, 
  HelpCircle, 
  Zap, 
  Award,
  Loader2,
  Share2,
  Maximize2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Timer,
  CheckCircle2,
  List,
  Download,
  CreditCard,
  Video,
  GraduationCap
} from 'lucide-react';
import { StudentProfile, Flashcard, OfflineLesson, Quiz } from '../types';
import { getLearningContent, getLessonSummary, getLessonExercises, getFlashcards, getAdaptiveQuiz } from '../services/geminiService';
import { cn } from '../lib/utils';

import TutorChat from './TutorChat';
import FlashcardOverlay from './FlashcardOverlay';

interface LessonViewProps {
  profile: StudentProfile;
  level: string;
  onBack: () => void;
  onTakeQuiz: () => void;
  onUpdateProfile: (data: Partial<StudentProfile>) => void;
  offlineContent?: string;
}

export default function LessonView({ profile, level, onBack, onTakeQuiz, onUpdateProfile, offlineContent }: LessonViewProps) {
  const [content, setContent] = useState<string>(offlineContent || '');
  const [loading, setLoading] = useState(!offlineContent);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${profile.topic}`) || '');
  const [isSaving, setIsSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // New States
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExercises, setShowExercises] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  // Video recap state (Veo)
  const [showVeoRecap, setShowVeoRecap] = useState(false);
  const [loadingVeo, setLoadingVeo] = useState(false);
  const [veoSteps, setVeoSteps] = useState<string[]>([]);

  // Sections for sidebar
  const [sections, setSections] = useState<{id: string, title: string}[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Update learning time every 10 seconds to ensure it persists
  useEffect(() => {
    if (seconds > 0 && seconds % 10 === 0) {
      onUpdateProfile({ learningTime: (profile.learningTime || 0) + 10 });
    }
  }, [seconds, onUpdateProfile, profile.learningTime]);

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const resp = await getLessonSummary(profile, content);
      setAiSummary(resp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateExercises = async () => {
    setLoadingExercises(true);
    try {
      const resp = await getLessonExercises(profile, content);
      setExercises(resp);
      setShowExercises(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExercises(false);
    }
  };

  const saveNotes = () => {
    setIsSaving(true);
    localStorage.setItem(`notes_${profile.topic}`, notes);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Learning ${profile.topic} on LearnAI`,
      text: `I just mastered ${profile.topic} on LearnAI! It's a personalized learning platform. Check it out!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} \n ${shareData.url}`);
        alert('Sharing link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const saveForOffline = async () => {
    try {
      setLoadingSummary(true); // Re-using loading summary as generic loading for save
      const quiz = await getAdaptiveQuiz(profile, level);
      
      const offlineItem: OfflineLesson = {
        id: profile.topic + Date.now(),
        topic: profile.topic,
        content: content,
        quiz: quiz,
        savedAt: new Date().toISOString(),
        size: new Blob([content, JSON.stringify(quiz || {})]).size
      };
      const saved = localStorage.getItem('offline_lessons');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('offline_lessons', JSON.stringify([...existing, offlineItem]));
      alert('Lesson and Quiz saved for offline access!');
    } catch (e) {
      console.error(e);
      alert('Failed to save offline content. Check your connection.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateFlashcardsAction = async () => {
    setLoadingFlashcards(true);
    try {
      const cards = await getFlashcards(profile, content);
      setFlashcards(cards);
      setShowFlashcards(true);
      
      // Persist to profile
      const currentCards = profile.flashcards || [];
      const newCards = [...cards, ...currentCards].filter((card, index, self) => 
        index === self.findIndex((t) => t.id === card.id || (t.front === card.front && t.back === card.back))
      );
      onUpdateProfile({ flashcards: newCards.slice(0, 100) }); // Keep last 100
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const generateVeoRecap = async () => {
    setLoadingVeo(true);
    // Simulating Veo/Gemini video recap generation
    setTimeout(() => {
      setVeoSteps([
        "Introduction to " + profile.topic,
        "Core Concepts Visualized",
        "Interactive Examples Recap",
        "Final Summary & Takeaways"
      ]);
      setLoadingVeo(false);
      setShowVeoRecap(true);
    }, 2000);
  };

  useEffect(() => {
    if (content) {
      const headings = content.split('\n')
        .filter(line => line.startsWith('## '))
        .map(line => {
          const title = line.replace('## ', '');
          const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return { id, title };
        });
      setSections(headings);
    }
  }, [content]);

  useEffect(() => {
    if (offlineContent) return;
    async function loadContent() {
      try {
        setError(null);
        setLoading(true);
        const data = await getLearningContent(profile, level);
        if (data.content) {
          setContent(data.content);
          if (data.hasVisual && data.svgCode) {
            setAiSummary(prev => prev + `\n\n### 🧬 Neural Visual Aid\n\n${data.svgCode}`);
          }
        } else {
          // Fallback if structured JSON fails but we get a string
          setContent(typeof data === 'string' ? data : '');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load lesson content.');
      } finally {
        setLoading(false);
      }
    }
    loadContent();

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0) {
        setProgress((scrolled / height) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [profile, level]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
            <Sparkles size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-display font-bold mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Personalizing Your Lesson...
        </h2>
        <p className="text-neutral-500 mt-4 text-center max-w-sm">
          Generating {level} level content for <span className="font-bold text-neutral-900">{profile.topic}</span> using your {profile.learningStyle} learning profile.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <Zap size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">
          Lesson Generation Failed
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md">
          {error}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-neutral-100 text-neutral-600 rounded-2xl font-bold transition-all"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 relative">
      {/* Scroll Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-neutral-100">
        <motion.div 
          className="h-full bg-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      <TutorChat profile={profile} lessonContent={content} />

      <AnimatePresence>
        {showFlashcards && (
          <FlashcardOverlay flashcards={flashcards} onClose={() => setShowFlashcards(false)} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-32 space-y-8">
            <div className="glass-card rounded-3xl p-6 border-neutral-100">
              <h4 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                <List size={16} />
                On This Page
              </h4>
              <nav className="space-y-1">
                {sections.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      const el = document.getElementById(s.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full text-left p-3 rounded-xl text-sm font-medium text-neutral-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all flex items-center gap-2 group relative overflow-hidden"
                  >
                    <div className="w-1 h-1 rounded-full bg-neutral-200 group-hover:bg-indigo-600 group-hover:scale-150 transition-all" />
                    <span className="line-clamp-1 relative z-10">{s.title}</span>
                    <motion.div 
                      className="absolute inset-0 bg-indigo-600/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" 
                    />
                  </button>
                ))}
                {sections.length === 0 && <p className="text-xs text-neutral-400">Loading sections...</p>}
              </nav>
            </div>

            <div className="glass-card rounded-3xl p-6 border-neutral-100 bg-neutral-900 text-white shadow-xl group cursor-pointer" onClick={generateFlashcardsAction}>
               <CreditCard size={24} className="mb-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
               <h4 className="font-bold mb-1">Quick Revision</h4>
               <p className="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest font-black">Generate Micro-Cards</p>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-white/50">Click to start AI</span>
                 <ChevronRight size={14} className="text-white/30 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border-neutral-100 bg-indigo-600 text-white shadow-xl">
               <Download size={24} className="mb-4 text-indigo-200" />
               <h4 className="font-bold mb-2">Study Offline</h4>
               <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Study on the go. Saves content & quizzes locally.</p>
               <button 
                 onClick={saveForOffline}
                 className="w-full py-3 bg-white text-indigo-600 rounded-xl font-extrabold text-[11px] uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
               >
                 Save to Browser
               </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-semibold transition-all group"
            >
              <div className="p-2 rounded-xl group-hover:bg-neutral-100">
                <ChevronLeft size={20} />
              </div>
              <span className="text-sm">Back to Home</span>
            </button>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button 
                onClick={generateSummary}
                disabled={loadingSummary}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50"
              >
                {loadingSummary ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate AI Summary
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                <Timer size={14} className="text-indigo-400" />
                {formatTime(seconds)}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="p-3 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="hero-section mb-12 text-center py-10 rounded-[3rem] bg-gradient-to-b from-indigo-50/50 to-transparent">
            {/* Same Hero content */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>AI Generated Personalized Content</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-bold text-neutral-900 mb-6 leading-[0.9] tracking-[-0.04em]">
              Mastering {profile.topic}
            </h1>
            <div className="flex items-center justify-center gap-6 text-neutral-500 font-medium">
              <span className="flex items-center gap-2">
                <BookOpen size={18} /> Lesson Content
              </span>
              <span className="flex items-center gap-2">
                <Zap size={18} /> 15 min read
              </span>
              <span className="flex items-center gap-2">
                <Award size={18} /> {level} Level
              </span>
            </div>
          </div>

          <div className="glass-card rounded-[3rem] p-8 md:p-12 border-white shadow-2xl relative mb-12">
            <article className="prose prose-indigo prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-neutral-600 prose-li:text-neutral-600">
               {/* Adding IDS to headings for navigation */}
               <ReactMarkdown
                 components={{
                   h2: ({ node, ...props }) => {
                     const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                     return <h2 id={id} {...props} />;
                   }
                 }}
               >
                 {content}
               </ReactMarkdown>
            </article>

            {/* Veo Video Recap Integration */}
            <div className="mt-16 bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
                      <Video size={12} />
                      Veo AI Summarizer
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4">Generate Cinematic Recap</h3>
                    <p className="text-neutral-400 mb-6">Let Veo create a visual animated summary of the most complex concepts from this lesson.</p>
                    
                    {!showVeoRecap ? (
                      <button 
                        onClick={generateVeoRecap}
                        disabled={loadingVeo}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/20"
                      >
                        {loadingVeo ? <Loader2 size={20} className="animate-spin" /> : <PlayCircle size={20} />}
                        {loadingVeo ? "Generating Recap..." : "Watch Video Recap"}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {veoSteps.map((step, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            key={i} 
                            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/10 transition-all"
                          >
                             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs">0{i+1}</div>
                             <span className="font-bold">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-64 aspect-video bg-neutral-800 rounded-2xl flex items-center justify-center border border-white/5 relative group cursor-pointer">
                     <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircle size={48} className="text-white" />
                     </div>
                     {!showVeoRecap ? (
                        <Video size={48} className="text-neutral-700" />
                     ) : (
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-full h-full bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs"
                        >
                          ANIMATED RECAP PLAYING
                        </motion.div>
                     )}
                  </div>
               </div>
            </div>

            </div>

            {/* Rating System */}
            <div className="mt-12 py-8 border-t border-neutral-100 flex flex-col items-center gap-4">
              <p className="font-bold text-neutral-800">Was this lesson clear and useful?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setRating('good')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    rating === 'good' ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-neutral-100 text-neutral-400 hover:border-green-200"
                  )}
                >
                  <ThumbsUp size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Helpful</span>
                </button>
                <button 
                  onClick={() => setRating('bad')}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    rating === 'bad' ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-neutral-100 text-neutral-400 hover:border-red-200"
                  )}
                >
                  <ThumbsDown size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Unclear</span>
                </button>
              </div>
            </div>

            {/* Interactive Exercises Section */}
            <div className="mt-12 space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-display font-bold">Interactive Exercises</h4>
                {!showExercises && (
                  <button 
                    onClick={generateExercises}
                    disabled={loadingExercises}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loadingExercises ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Generate Exercises
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showExercises && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                        <p className="font-medium text-neutral-800 mb-4">{ex.question}</p>
                        {ex.type === 'fill-blank' ? (
                          <div className="flex items-center gap-3">
                            <input 
                              type="text" 
                              className="bg-white border border-neutral-200 rounded-xl px-4 py-2 flex-1 max-w-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="Your answer..."
                              onChange={(e) => setExerciseAnswers(prev => ({...prev, [idx]: e.target.value}))}
                            />
                            {exerciseAnswers[idx] && (
                               <button className="text-indigo-600 font-bold text-sm">Check</button>
                            )}
                          </div>
                        ) : ex.type === 'matching' && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {ex.pairs.map((p: any, i: number) => (
                               <div key={i} className="flex flex-col gap-2">
                                 <div className="p-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium">{p.left}</div>
                                 <input 
                                   type="text" 
                                   className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                   placeholder="Match..."
                                 />
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notes Area */}
            <div className="mt-16 p-8 bg-neutral-50 rounded-3xl border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-bold text-lg flex items-center gap-2">
                   <BookOpen size={20} className="text-indigo-600" />
                   Learning Notes
                 </h4>
                 <button 
                   onClick={saveNotes}
                   className={cn(
                     "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                     isSaving ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                   )}
                 >
                   {isSaving && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={16} /></motion.div>}
                   {isSaving ? "Saved!" : "Save Notes"}
                 </button>
              </div>
              <textarea 
                className="w-full h-40 p-4 rounded-2xl bg-white border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-sans"
                placeholder="Jot down important points or calculations here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* AI Summary Section */}
            <AnimatePresence>
              {aiSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles size={120} />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Zap size={24} />
                      AI Visual Guide & Summary
                    </h4>
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1">
                      <ReactMarkdown>{aiSummary}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flashcard Master Card - New Call to Action */}
            <div className="mt-16 p-1 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center shrink-0">
                  <CreditCard size={48} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-display font-bold mb-3 tracking-tight">Master with Flashcards</h3>
                  <p className="text-neutral-500 mb-6 leading-relaxed">
                    Convert this entire lesson into interactive flashcards. Use spaced repetition to memorize concepts 3x faster than just reading.
                  </p>
                  <button 
                    onClick={generateFlashcardsAction}
                    disabled={loadingFlashcards}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100"
                  >
                    {loadingFlashcards ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} className="fill-white" />}
                    {loadingFlashcards ? "Generating Cards..." : "Launch Flashcard Deck"}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Sidebar / Bottom Bar */}
            <div className="mt-16 pt-12 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                   <GraduationCap size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Ready to test yourself?</h4>
                  <p className="text-neutral-500">Take the adaptive quiz to unlock the next level.</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={onTakeQuiz}
                  className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Take Quiz Now</span>
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                </button>
                <button 
                  onClick={saveNotes}
                  className="flex-1 md:flex-none px-8 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-bold hover:bg-neutral-200 transition-all"
                >
                  {isSaving ? "Saved!" : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended / Sidebar info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-20 lg:ml-[25%]">
          <div className="bg-yellow-50 p-8 rounded-[2rem] border border-yellow-100">
            <HelpCircle className="text-yellow-600 mb-4" size={32} />
            <h4 className="text-xl font-bold text-yellow-900 mb-2">Still confused?</h4>
            <p className="text-yellow-800/70 text-sm mb-6">
              If this lesson was too difficult or unclear, I can explain it again using a simpler approach or different examples.
            </p>
            <button className="text-yellow-900 font-bold text-sm tracking-tight hover:underline flex items-center gap-1">
              Explain with simpler examples <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
            <PlayCircle className="text-green-600 mb-4" size={32} />
            <h4 className="text-xl font-bold text-green-900 mb-2">Watch Visualization</h4>
            <p className="text-green-800/70 text-sm mb-6">
              See the visual breakdown of {profile.topic} to lock in your understanding.
            </p>
            <button 
              onClick={generateSummary}
              disabled={loadingSummary}
              className="text-green-900 font-bold text-sm tracking-tight hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              {loadingSummary ? "Generating..." : "Generate Visual Guide"} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
  );
}
