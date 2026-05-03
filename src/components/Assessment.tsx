/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { StudentProfile, QuizQuestion } from '../types';
import { getInitialAssessment } from '../services/geminiService';
import { cn } from '../lib/utils';

interface AssessmentProps {
  profile: StudentProfile;
  onComplete: (score: number) => void;
}

export default function Assessment({ profile, onComplete }: AssessmentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setError(null);
        setLoading(true);
        const data = await getInitialAssessment(profile);
        setQuestions(data);
      } catch (err: any) {
        console.error("Failed to load global assessment", err);
        setError(err.message || 'Failed to generate assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [profile]);

  const handleSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-indigo-600 mb-6"
        >
          <Loader2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold font-display">Analyzing Your Topic...</h2>
        <p className="text-neutral-500 mt-2">LearnAI is preparing a personalized assessment for {profile.topic}.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <Sparkles size={40} className="grayscale" />
        </div>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">Assessment Unreachable</h2>
        <p className="text-neutral-500 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold font-sans shadow-xl active:scale-95 transition-all"
        >
          Retry Assessment
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center py-12 px-4 glass-card rounded-3xl max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">Assessment Ready</h2>
        <p className="text-neutral-500 mb-8">
          You scored <span className="font-bold text-neutral-900">{score}/{questions.length}</span>. 
          We've analyzed your current level.
        </p>
        <button
          onClick={() => onComplete(score)}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          Enter Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-semibold">
          <Sparkles size={16} />
          <span>Initial Assessment</span>
        </div>
        <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest leading-none">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 border-indigo-100">
        <h3 className="text-2xl font-semibold mb-8">{currentQuestion.question}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                selectedAnswer === option 
                  ? (option === currentQuestion.correctAnswer ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700")
                  : (selectedAnswer && option === currentQuestion.correctAnswer ? "border-green-500 bg-green-50 text-green-700" : "border-neutral-100 hover:border-indigo-200 bg-white")
              )}
            >
              <span className="font-medium text-lg">{option}</span>
              {selectedAnswer === option && (
                option === currentQuestion.correctAnswer 
                  ? <CheckCircle2 className="text-green-600" size={24} />
                  : <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs font-bold font-sans">X</div>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <button
                onClick={handleNext}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}</span>
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
