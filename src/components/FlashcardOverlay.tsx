import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface FlashcardOverlayProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardOverlay({ flashcards, onClose }: FlashcardOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const next = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between text-white mb-8">
          <div>
            <h3 className="text-2xl font-display font-bold">Concept Flashcards</h3>
            <p className="text-neutral-400 text-sm">Study these for quick revision</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="relative h-[400px] mb-8 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full cursor-pointer perspective-1000"
            >
              <div 
                className={cn(
                  "relative w-full h-full transition-all duration-500 preserve-3d shadow-2xl",
                  isFlipped ? "rotate-y-180" : ""
                )}
              >
                {/* Front */}
                <div className="absolute inset-0 bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden">
                  <span className="text-[10px] font-black uppercase text-indigo-600 mb-6 tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                    Question
                  </span>
                  <h4 className="text-2xl font-bold text-neutral-800 leading-tight">
                    {flashcards[currentIndex].front}
                  </h4>
                  <p className="mt-12 text-sm text-neutral-400 font-medium">Click to flip</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden text-white shadow-inner">
                  <span className="text-[10px] font-black uppercase text-indigo-200 mb-6 tracking-widest bg-white/10 px-3 py-1 rounded-full">
                    Explanation
                  </span>
                  <p className="text-xl font-medium leading-relaxed">
                    {flashcards[currentIndex].back}
                  </p>
                  <p className="mt-12 text-sm text-indigo-200 font-medium">Click to see question</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
           <div className="text-white/50 text-sm font-bold">
             Card {currentIndex + 1} of {flashcards.length}
           </div>
           <div className="flex gap-4">
             <button 
               onClick={prev}
               className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all border border-white/10"
             >
               <ChevronLeft size={24} />
             </button>
             <button 
               onClick={() => setIsFlipped(!isFlipped)}
               className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
             >
               <RotateCcw size={18} /> Flip
             </button>
             <button 
               onClick={next}
               className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all border border-white/10"
             >
               <ChevronRight size={24} />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
