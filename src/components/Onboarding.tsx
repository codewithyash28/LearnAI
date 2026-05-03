/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Sparkles, User, GraduationCap, MapPin } from 'lucide-react';
import { ClassLevel, LearningStyle, SimplifiedLanguage, StudentProfile, SchoolBoard } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    classLevel: 10,
    learningStyle: LearningStyle.MIXED,
    language: SimplifiedLanguage.HINGLISH,
    board: SchoolBoard.CBSE,
  });

  const handleNext = () => {
    onComplete({
      ...formData as StudentProfile,
      xp: 0,
      badges: ['New Explorer'],
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0],
      analytics: []
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-200"
        >
          <GraduationCap size={40} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4 tracking-tight">
          Welcome to <span className="text-indigo-600">LearnAI</span>
        </h1>
        <p className="text-neutral-500 max-w-md mx-auto">
          Your personal AI tutor designed for students worldwide. Let's customize your learning experience.
        </p>
      </div>

      <div className="w-full max-w-xl glass-card rounded-3xl p-8 border border-white">
        <div className="space-y-6">
          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
             <div className="shrink-0 p-3 bg-white rounded-xl text-indigo-600 shadow-sm self-start">
               <Sparkles size={20} />
             </div>
             <div>
               <h4 className="font-bold text-indigo-900 text-sm">Adaptive AI Personalization</h4>
               <p className="text-xs text-indigo-700/80 leading-relaxed mt-1">
                 LearnAI uses your class level, learning style, and primary language to calibrate its tutoring engine. Every lesson is generated uniquely for you, balancing core curriculum with your specific strengths.
               </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Student Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Yash"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Class Level</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={formData.classLevel}
                onChange={e => setFormData({ ...formData, classLevel: Number(e.target.value) as ClassLevel })}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>Class {i+1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">School Board</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={formData.board}
                onChange={e => setFormData({ ...formData, board: e.target.value as SchoolBoard })}
              >
                {Object.values(SchoolBoard).map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Subject</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="e.g. Science"
                value={formData.subject || ''}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Specific Topic</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="e.g. Photosynthesis"
                value={formData.topic || ''}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-neutral-700">Learning Style</label>
              <div className="group relative">
                <div className="p-1 rounded-full bg-neutral-100 cursor-help">
                  <Sparkles size={12} className="text-neutral-400" />
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-neutral-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                  <p className="font-bold mb-1">How it works:</p>
                  <strong>Visual:</strong> Focuses on charts and diagrams.<br/>
                  <strong>Auditory:</strong> Prioritizes spoken-word tutoring.<br/>
                  <strong>Logical:</strong> Deep dives into step-by-step reasoning.<br/>
                  <strong>Mixed:</strong> A balanced approach of all styles.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(LearningStyle).map(style => (
                <button
                  key={style}
                  onClick={() => setFormData({ ...formData, learningStyle: style })}
                  className={cn(
                    "px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
                    formData.learningStyle === style 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-neutral-700">Preferred Language</label>
              <div className="group relative">
                <div className="p-1 rounded-full bg-neutral-100 cursor-help">
                  <Sparkles size={12} className="text-neutral-400" />
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-neutral-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                  LearnAI adapts its entire teaching methodology and vocabulary to your chosen language, ensuring conceptual clarity in your mother tongue.
                </div>
              </div>
            </div>
            <div className="h-40 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(SimplifiedLanguage).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setFormData({ ...formData, language: lang })}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center min-h-[44px]",
                      formData.language === lang 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 font-black" 
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleNext}
              disabled={!formData.name || !formData.subject || !formData.topic || (formData.classLevel && (formData.classLevel < 1 || formData.classLevel > 12))}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group focus:ring-4 focus:ring-indigo-100"
            >
              <span>Start My Journey</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => onComplete({
                name: 'Guest Student',
                classLevel: 10,
                subject: 'General Studies',
                topic: 'Introduction',
                learningStyle: LearningStyle.MIXED,
                language: SimplifiedLanguage.ENGLISH,
                board: SchoolBoard.CBSE,
                xp: 0,
                badges: ['Explorer'],
                streak: 1,
                lastActive: new Date().toISOString().split('T')[0],
                analytics: []
              })}
              className="w-full bg-neutral-100 text-neutral-600 py-3 rounded-2xl font-bold hover:bg-neutral-200 transition-all text-sm"
            >
              Skip Setup (Continue as Guest)
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-8 opacity-50 grayscale">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Powered by</span>
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">Code With Yash</span>
        </div>
      </div>
    </div>
  );
}
