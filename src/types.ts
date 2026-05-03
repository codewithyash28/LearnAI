/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export enum LearningStyle {
  VISUAL = 'Visual',
  AUDIO = 'Audio',
  TEXT = 'Text',
  MIXED = 'Mixed',
}

export enum SimplifiedLanguage {
  HINDI = 'Hindi',
  ENGLISH = 'English',
  HINGLISH = 'Hinglish',
  MARATHI = 'Marathi',
  MARGLISH = 'Marglish',
  MANDARIN = 'Mandarin Chinese',
  SPANISH = 'Spanish',
  ARABIC = 'Arabic',
  FRENCH = 'French',
  BENGALI = 'Bengali',
  PORTUGUESE = 'Portuguese',
  INDONESIAN = 'Indonesian',
  URDU = 'Urdu',
  RUSSIAN = 'Russian',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  TURKISH = 'Turkish',
  VIETNAMESE = 'Vietnamese',
  THAI = 'Thai',
  POLISH = 'Polish',
  DUTCH = 'Dutch',
  SWEDISH = 'Swedish',
  NORWEGIAN = 'Norwegian',
  DANISH = 'Danish',
  FINNISH = 'Finnish',
  GREEK = 'Greek',
  HEBREW = 'Hebrew',
  CZECH = 'Czech',
  HUNGARIAN = 'Hungarian',
}

export enum SchoolBoard {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  IB = 'IB (International)',
  IGCSE = 'IGCSE',
  STATE_BOARD = 'State Board',
  OTHER = 'Other (Global)'
}

export interface StudentProfile {
  name: string;
  classLevel: ClassLevel;
  subject: string;
  topic: string;
  learningStyle: LearningStyle;
  language: SimplifiedLanguage;
  board?: SchoolBoard;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  score?: number;
  xp: number;
  badges: string[];
  streak: number;
  lastActive?: string;
  learningTime?: number; // in seconds
  analytics?: TopicAnalytics[];
  flashcards?: Flashcard[];
}

export interface TopicAnalytics {
  topic: string;
  subject: string;
  performance: number; // 0-100
  timeSpent: number; // seconds
  lastAttempt: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface OfflineLesson {
  id: string;
  topic: string;
  content: string;
  quiz?: Quiz;
  savedAt: string;
  size?: number; // Estimated size in bytes
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  status: 'locked' | 'unlocked' | 'completed' | 'in-progress';
}

export interface ProgressData {
  overallProgress: number;
  topicsCompleted: number;
  averageScore: number;
  learningStreak: number;
}
