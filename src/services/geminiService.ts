import { GoogleGenAI, Type } from "@google/genai";
import { StudentProfile, Quiz, QuizQuestion, Flashcard } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;

  let apiKey = '';
  try {
    apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY;
  } catch (e) {
    // Ignore errors in environments where process is not defined
  }

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
    throw new Error("Gemini API Key is not configured. Please set GEMINI_API_KEY in your environment.");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

const handleGeminiError = (error: any) => {
  console.error("Gemini API Error:", error);
  if (error?.message?.includes('429') || error?.status === 429 || JSON.stringify(error).includes('429') || JSON.stringify(error).includes('RESOURCE_EXHAUSTED')) {
    throw new Error("AI Quota Exceeded: You have reached the free tier limit for the AI model. Please wait a minute or try again later tonight when traffic is lower.");
  }
  throw error;
};

const SYSTEM_PROMPT = `
You are LearnAI Elite - an advanced AI-powered personalized learning assistant designed for students globally from primary to high school levels.

CORE MISSION:
You generate highly personalized, adaptive educational content that:
- Detects each student's learning level, pace, and style.
- Strictly adheres to the selected School Board curriculum (CBSE, ICSE, IB, etc.).
- Generates high-fidelity diagrams using SVG code when helpful for visual learners.
- Predicts mastery timelines and identifies specific conceptual bottlenecks.
- Auto-adjusts difficulty based on student performance.
- Makes learning engaging, relatable, and culturally inclusive across 20+ languages.
`;

export async function getInitialAssessment(profile: StudentProfile): Promise<QuizQuestion[]> {
  try {
    const ai = getAI();
    const prompt = `
      Generate a 5-question multiple choice assessment for a Class ${profile.classLevel} student interested in ${profile.subject} (Topic: ${profile.topic}).
      Language: ${profile.language}.
      Learning Style: ${profile.learningStyle}.
      Return the response as a JSON array of objects with 'question', 'options' (array of 4 strings), and 'correctAnswer' (string, one of the options).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getLearningContent(profile: StudentProfile, level: string): Promise<any> {
  try {
    const ai = getAI();
    const prompt = `
      Generate an ELITE personalized learning lesson for a Class ${profile.classLevel} student.
      Board: ${profile.board || 'CBSE'} (Universal Standard)
      Subject: ${profile.subject}
      Topic: ${profile.topic}
      Level: ${level}
      Style: ${profile.learningStyle}
      Language: ${profile.language}

      Structure:
      1. Hook Introduction
      2. Concept Explanation (Step-by-step)
      3. Worked Examples (Relatable context)
      4. Visual Aid (Optional: If learningStyle is VISUAL, provide a raw SVG code block for a diagram)
      5. Real-life Application
      6. Key Takeaways
      7. Common Mistakes
      
      Return as JSON { "content": "Markdown text here", "hasVisual": boolean, "svgCode": "optional svg string" }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getAdaptiveQuiz(profile: StudentProfile, level: string): Promise<Quiz> {
  try {
    const ai = getAI();
    const prompt = `
      Generate a 10-question adaptive quiz for a Class ${profile.classLevel} student on the topic "${profile.topic}".
      Difficulty Level: ${level}
      Language: ${profile.language}
      
      Distribution: 4 Easy, 4 Medium, 2 Hard.
      Return as JSON: { "topic": "${profile.topic}", "difficulty": "${level}", "questions": [ { "question": "", "options": ["", "", "", ""], "correctAnswer": "" } ] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer"],
              },
            },
          },
          required: ["topic", "difficulty", "questions"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as Quiz;
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getLearningPath(profile: StudentProfile): Promise<any[]> {
  try {
    const ai = getAI();
    const prompt = `
      Create a personalized learning path for:
      Class: ${profile.classLevel}, Subject: ${profile.subject}, Topic: ${profile.topic}, Level: ${profile.level || 'Beginner'}
      
      Return a list of 5 sequential sub-topics or modules.
      Each module should have: id, title, description, duration, difficulty, status ('locked' except the first one which is 'unlocked').
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["locked", "unlocked", "completed", "in-progress"] },
            },
            required: ["id", "title", "description", "duration", "difficulty", "status"],
          },
        },
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getLessonSummary(profile: StudentProfile, content: string): Promise<string> {
  try {
    const ai = getAI();
    const prompt = `
      Summarize the following lesson on "${profile.topic}" for a ${profile.classLevel} student.
      Provide a "Visual Guide" summary using markdown. Use emojis, bullet points, and clear sections.
      Make it visually appealing and easy to grasp quickly.
      Lesson Content: ${content.substring(0, 4000)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT
      },
    });
    
    return response.text || "";
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getLessonExercises(profile: StudentProfile, content: string): Promise<any[]> {
  try {
    const ai = getAI();
    const prompt = `
      Create 3 interactive exercises based on this lesson:
      Topic: ${profile.topic}, Level: ${profile.level || 'Beginner'}
      Lesson Content: ${content.substring(0, 3000)}

      Types to include: Fill-in-the-blanks or Matching.
      Return a list of JSON objects.
      Example: { type: "fill-blank", question: "The capital of France is [blank].", answer: "Paris" }
      Example: { type: "matching", question: "Match the following", pairs: [{ left: "Apple", right: "Red" }, { left: "Banana", right: "Yellow" }] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["fill-blank", "matching"] },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              pairs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    left: { type: Type.STRING },
                    right: { type: Type.STRING },
                  },
                  required: ["left", "right"],
                }
              }
            },
            required: ["type", "question"],
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getTutorResponse(profile: StudentProfile, context: string, userQuestion: string, history: any[]): Promise<string> {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nYou are currently tutoring ${profile.name} on the topic "${profile.topic}".\nLesson Context: ${context.substring(0, 2000)}\n\nGoal: Answer the student's question clearly. If they are asking for an answer to a problem, don't just give the answer—guide them step-by-step. Use their preferred language: ${profile.language}.`
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: userQuestion });
    return result.text || "";
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getFlashcards(profile: StudentProfile, content: string): Promise<Flashcard[]> {
  try {
    const ai = getAI();
    const prompt = `
      Based on the following lesson content for ${profile.topic}, generate 5-8 flashcards for quick revision.
      Each flashcard should have a 'front' (question or concept) and a 'back' (answer or explanation).
      Return as a JSON array of objects.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
            },
            required: ["id", "front", "back"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getKnowledgeMap(profile: StudentProfile): Promise<any> {
  try {
    const ai = getAI();
    const prompt = `
      Create a conceptual "Knowledge Map" (a galaxy of related concepts) for a student studying ${profile.topic} (${profile.subject}) at Class ${profile.classLevel} level.
      
      Identify:
      1. One central 'core' node (the current topic)
      2. 3-4 'prerequisite' nodes (concepts they should already know)
      3. 3-4 'forward' nodes (what this topic leads into)
      4. 2-3 'interdisciplinary' nodes (how this connects to other subjects)

      For each node, provide: id, label, type, description, and relative x, y coordinates (between -200 and 200).
      Also provide a list of 'edges' connecting related nodes.
      Return as a JSON object with 'nodes' and 'edges' arrays.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["core", "prerequisite", "forward", "interdisciplinary"] },
                  description: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                },
                required: ["id", "label", "type", "description", "x", "y"],
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING },
                },
                required: ["from", "to"],
              }
            }
          },
          required: ["nodes", "edges"],
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getDailyChallenge(profile: StudentProfile): Promise<any> {
  try {
    const ai = getAI();
    const prompt = `
      Generate a "Daily Brain Teaser" for a Class ${profile.classLevel} student interested in ${profile.subject}.
      Theme: ${profile.topic}.
      Language: ${profile.language}.
      
      The challenge should be a quick logic puzzle, a "Did you know?" fact with a follow-up question, or a short scenario.
      Return JSON: { "title": "", "challenge": "", "question": "", "correctAnswer": "", "explanation": "" }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            challenge: { type: Type.STRING },
            question: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["title", "challenge", "question", "correctAnswer", "explanation"],
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw handleGeminiError(error);
  }
}

export async function getMasteryPrediction(profile: StudentProfile): Promise<any> {
  try {
    const ai = getAI();
    const prompt = `
      Based on this student profile:
      Name: ${profile.name}, XP: ${profile.xp}, Topic: ${profile.topic}, Board: ${profile.board}
      Recent Analytics: ${JSON.stringify(profile.analytics || [])}
      
      Predict:
      1. Mastery Percentage (0-100)
      2. Hours until total mastery
      3. Next big conceptual hurdle
      4. Recommended focus area
      
      Return JSON: { "mastery": number, "hoursRemaining": number, "hurdle": string, "recommendation": string }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw handleGeminiError(error);
  }
}
