import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, DifficultyLevel } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const factGenerationModel = "gemini-2.5-flash";
const imageGenerationModel = "imagen-3.0-generate-002";

interface FactResponse {
    fact: string;
    explanation: string;
    imagePrompt: string;
}

const factSchema = {
    type: Type.OBJECT,
    properties: {
        fact: { type: Type.STRING, description: "A single, interesting fact about the cosmos." },
        explanation: { type: Type.STRING, description: "A detailed, engaging explanation of the fact, tailored to the specified audience." },
        imagePrompt: { type: Type.STRING, description: "A concise, descriptive prompt for an AI image generator to create a technically accurate but visually appealing illustration (diagram, chart, or depiction) based on the fact." }
    },
    required: ["fact", "explanation", "imagePrompt"],
};

const getDifficultyConfig = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
        case 1:
            return {
                audience: "a child aged 6-10",
                systemInstruction: "You are Dr. Aime Sagan, a super friendly and fun astrophysicist hosting a space game for kids aged 6-10. Your tone is extremely enthusiastic, simple, and exciting. Use easy-to-understand words, short sentences, and fun analogies. Avoid complex jargon. Make learning about space feel like an awesome adventure.",
                explanationDetail: "using simple language and fun analogies suitable for a 6-10 year old.",
            };
        case 2:
            return {
                audience: "a teenager aged 11-18",
                systemInstruction: "You are Dr. Aime Sagan, an engaging and cool astrophysicist hosting a space game for teenagers aged 11-18. Your tone is informative but also exciting and relatable. You can introduce more technical terms but should always explain them clearly. Assume a basic understanding of science but aim to expand on it.",
                explanationDetail: "that is detailed and engaging for a teenager aged 11-18. Explain any technical terms you use.",
            };
        case 3:
            return {
                audience: "an adult (age 20+)",
                systemInstruction: "You are Dr. Aime Sagan, a knowledgeable and enthusiastic astrophysicist hosting a space game for adults. Your tone is that of an expert speaking to a curious and intelligent peer. You can use precise, technical terminology, but should still prioritize clarity and engaging explanations. Your passion for the subject should be evident.",
                explanationDetail: "that is in-depth, technically accurate, and detailed, suitable for an adult with a keen interest in astrophysics.",
            };
    }
};

export const getCosmicFact = async (factLevel: number, previousFacts: string[], difficulty: DifficultyLevel): Promise<FactResponse> => {
    const config = getDifficultyConfig(difficulty);
    try {
        const prompt = `
            The user is at fact level ${factLevel} and has selected a difficulty appropriate for ${config.audience}.
            The difficulty should scale with the fact level number, starting simple and getting progressively more complex within the chosen difficulty tier.
            Please generate a new, unique fact about the cosmos that is not in this list of previous facts: [${previousFacts.join(', ')}].
            Provide an engaging explanation for the fact ${config.explanationDetail}.
            Then, based on the fact and explanation, create a concise, descriptive prompt for an AI image generator to create a technically accurate visual illustration.
        `;

        const response = await ai.models.generateContent({
            model: factGenerationModel,
            contents: prompt,
            config: {
                systemInstruction: config.systemInstruction,
                responseMimeType: "application/json",
                responseSchema: factSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FactResponse;

    } catch (error) {
        console.error("Error generating cosmic fact:", error);
        throw new Error("Failed to get a fact from the cosmos. Please try again.");
    }
};

export const generateCosmicImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating cosmic image:", error);
        throw new Error("The cosmic observatory seems to be having issues. Could not generate an image.");
    }
};


const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "A multiple-choice question about one of the provided facts." },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 strings: one correct answer and three plausible distractors. All options should be tailored to the target audience's comprehension level."
            },
            correctAnswer: { type: Type.STRING, description: "The correct answer, which must exactly match one of the items in the 'options' array." }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

export const generateCosmicQuiz = async (facts: string[], difficulty: DifficultyLevel): Promise<QuizQuestion[]> => {
    const config = getDifficultyConfig(difficulty);
    try {
        const prompt = `
            Based on the following five facts, create a multiple-choice quiz with one question for each fact. Each question should test understanding of the core concept in the fact. Each question must have four options: one correct answer and three plausible but incorrect distractors. Tailor the language and complexity for ${config.audience}.

            Facts:
            ${facts.map((fact, index) => `${index + 1}. ${fact}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
            model: factGenerationModel,
            contents: prompt,
            config: {
                systemInstruction: config.systemInstruction,
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as QuizQuestion[];

    } catch (error) {
        console.error("Error generating cosmic quiz:", error);
        throw new Error("Failed to generate a quiz. The cosmos is quiet for now.");
    }
};