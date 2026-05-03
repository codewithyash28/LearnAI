/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Trophy, 
  Loader2,
  Clock,
  ArrowLeft,
  Award,
  Star,
  XCircle
} from 'lucide-react';
import { StudentProfile, Quiz, QuizQuestion } from '../types';
import { getAdaptiveQuiz } from '../services/geminiService';
import { cn } from '../lib/utils';

interface QuizViewProps {
  profile: StudentProfile;
  level: string;
  onComplete: () => void;
  onBack: () => void;
  onUpdateProfile: (data: Partial<StudentProfile>) => void;
}

export default function QuizView({ profile, level, onComplete, onBack, onUpdateProfile }: QuizViewProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const startQuiz = async (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setLoading(true);
    setError(null);
    setStartTime(Date.now());
    try {
      const data = await getAdaptiveQuiz(profile, difficulty);
      setQuiz(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate quiz. Maybe the topic is too complex or there's a connection issue.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold font-display mb-4">Oops! Quiz Generation Failed</h2>
        <p className="text-neutral-500 mb-8">{error}</p>
        <button
          onClick={() => setSelectedDifficulty(null)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Try a Different Difficulty
        </button>
      </div>
    );
  }

  if (!selectedDifficulty) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-display font-bold mb-4">Choose Your Challenge</h2>
          <p className="text-neutral-500 font-medium">Select a difficulty level for your quiz on {profile.topic}.</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'adaptive', label: 'Adaptive (Recommended)', desc: `Based on your ${level} level`, color: 'border-indigo-600 bg-indigo-50 text-indigo-700', active: true },
            { id: 'Beginner', label: 'Beginner', desc: 'Step-by-step simple questions' },
            { id: 'Intermediate', label: 'Intermediate', desc: 'Standard challenge level' },
            { id: 'Advanced', label: 'Advanced', desc: 'Mastery-level complex problems' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => startQuiz(opt.id === 'adaptive' ? level : opt.id)}
              className={cn(
                "p-6 rounded-[2rem] border-2 text-left transition-all hover:scale-102 active:scale-98 group flex items-center justify-between",
                opt.active ? "border-indigo-600 bg-indigo-50" : "border-neutral-100 bg-white hover:border-indigo-200"
              )}
            >
              <div>
                <h4 className="font-bold text-xl">{opt.label}</h4>
                <p className="text-neutral-500 text-sm mt-1">{opt.desc}</p>
              </div>
              <ChevronRight className="text-neutral-300 group-hover:text-indigo-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === quiz!.questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quiz!.questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="w-32 h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-8"
        >
          <Sparkles size={48} />
        </motion.div>
        <h2 className="text-3xl font-display font-bold">Assembling Your Quest...</h2>
        <p className="text-neutral-500 mt-2">Creating 10 adaptive questions for your level.</p>
      </div>
    );
  }

  if (showResults) {
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
    const timeTakenMins = Math.round(timeTakenSeconds / 60);
    const pass = score >= 7;
    const bonusXp = score * 50;

    // Record Analytics
    useEffect(() => {
      const performance = (score / 10) * 100;
      const currentAnalytics = profile.analytics || [];
      const topicIndex = currentAnalytics.findIndex(a => a.topic === profile.topic);
      
      const newAnalytics = {
        topic: profile.topic,
        subject: profile.subject,
        performance: performance,
        timeSpent: timeTakenSeconds,
        lastAttempt: new Date().toISOString(),
        strengths: score > 7 ? [profile.topic] : [],
        weaknesses: score < 5 ? [profile.topic] : []
      };

      let updatedAnalytics;
      if (topicIndex > -1) {
        updatedAnalytics = [...currentAnalytics];
        updatedAnalytics[topicIndex] = {
          ...updatedAnalytics[topicIndex],
          performance: Math.round((updatedAnalytics[topicIndex].performance + performance) / 2),
          timeSpent: updatedAnalytics[topicIndex].timeSpent + timeTakenSeconds,
          lastAttempt: newAnalytics.lastAttempt,
          strengths: [...new Set([...updatedAnalytics[topicIndex].strengths, ...newAnalytics.strengths])],
          weaknesses: score >= 7 ? updatedAnalytics[topicIndex].weaknesses.filter(w => w !== profile.topic) : updatedAnalytics[topicIndex].weaknesses
        };
      } else {
        updatedAnalytics = [...currentAnalytics, newAnalytics];
      }

      onUpdateProfile({ 
        analytics: updatedAnalytics,
        xp: profile.xp + bonusXp
      });
    }, []);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden",
            pass ? "bg-indigo-600 text-white" : "bg-white text-neutral-900 border-2 border-neutral-100"
          )}
        >
          {pass && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl" />
            </div>
          )}

          <div className={cn(
            "w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl",
            pass ? "bg-white text-indigo-600" : "bg-neutral-100 text-neutral-400"
          )}>
            {pass ? <Trophy size={48} /> : <Award size={48} />}
          </div>

          <h2 className="text-4xl font-display font-bold mb-2">
            {pass ? "Quest Master!" : "Keep Going!"}
          </h2>
          <p className={pass ? "text-indigo-100 mb-4" : "text-neutral-500 mb-4"}>
            You completed the <span className="font-bold underline decoration-2">{profile.topic}</span> challenge.
          </p>

          <div className="inline-flex items-center gap-2 bg-yellow-400 text-neutral-900 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-8">
            <Star size={14} className="fill-neutral-900" />
            <span>Earned +{bonusXp} XP</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className={cn("p-6 rounded-[2rem]", pass ? "bg-white/10" : "bg-neutral-50")}>
              <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", pass ? "text-indigo-200" : "text-neutral-400")}>Your Score</p>
              <p className="text-3xl font-display font-black">{score}/10</p>
            </div>
            <div className={cn("p-6 rounded-[2rem]", pass ? "bg-white/10" : "bg-neutral-50")}>
              <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", pass ? "text-indigo-200" : "text-neutral-400")}>Time Taken</p>
              <p className="text-3xl font-display font-black">{timeTakenMins}m</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onComplete}
              className={cn(
                "flex-1 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95",
                pass ? "bg-white text-indigo-600 hover:bg-neutral-100" : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Back to Dashboard
            </button>
            {!pass && (
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-4 rounded-2xl font-bold bg-neutral-100 text-neutral-900 transition-all hover:bg-neutral-200"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = quiz!.questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors font-medium">
          <ArrowLeft size={18} /> Exit
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
            <Clock size={16} /> 10:00
          </div>
          <div className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-tighter">
            {currentIndex + 1}/10
          </div>
        </div>
      </div>

      <div className="w-full h-3 bg-neutral-100 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="glass-card rounded-[3rem] p-8 md:p-12 relative border-indigo-100 shadow-2xl"
        >
          <div className="absolute -top-6 left-12 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
            {currentIndex + 1}
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-900 mb-10 mt-4 leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                disabled={!!selectedAnswer}
                onClick={() => handleSelect(option)}
                className={cn(
                  "text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group h-full",
                  selectedAnswer === option 
                    ? (option === currentQ.correctAnswer ? "border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100" : "border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100")
                    : (selectedAnswer && option === currentQ.correctAnswer ? "border-green-500 bg-green-50 text-green-700" : "border-neutral-100 bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50")
                )}
              >
                <span className="font-semibold text-lg">{option}</span>
                <AnimatePresence>
                  {selectedAnswer === option && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {option === currentQ.correctAnswer 
                        ? <CheckCircle2 className="text-green-600" size={28} />
                        : <XCircle className="text-red-600" size={28} />
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className={cn(
                "p-4 rounded-2xl mb-8 w-full text-center font-medium",
                selectedAnswer === currentQ.correctAnswer ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {selectedAnswer === currentQ.correctAnswer 
                  ? "Perfect! You got it right. ✨" 
                  : `Not quite. The correct answer was "${currentQ.correctAnswer}".`
                }
              </div>
              <button 
                onClick={nextQuestion}
                className="w-full sm:w-auto px-12 py-5 bg-neutral-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-2xl active:scale-95 group"
              >
                <span>{currentIndex === 9 ? "View Results" : "Next Challenge"}</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
