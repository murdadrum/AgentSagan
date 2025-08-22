
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion } from '../types';

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
        explanation: { type: Type.STRING, description: "A detailed, engaging explanation of the fact." },
        imagePrompt: { type: Type.STRING, description: "A concise, descriptive prompt for an AI image generator to create a technically accurate visual illustration (diagram, chart, or depiction) based on the fact." }
    },
    required: ["fact", "explanation", "imagePrompt"],
};


export const getCosmicFact = async (factLevel: number, previousFacts: string[]): Promise<FactResponse> => {
    try {
        const prompt = `
            Your current fact level is ${factLevel}. The difficulty should scale with this number (1 is very common knowledge, 10 is advanced).
            Please generate a new, unique fact about the cosmos that is not in this list of previous facts: [${previousFacts.join(', ')}].
            Provide an engaging and detailed explanation for the fact.
            Then, based on the fact and explanation, create a concise, descriptive prompt for an AI image generator to create a technically accurate visual illustration.
        `;

        const response = await ai.models.generateContent({
            model: factGenerationModel,
            contents: prompt,
            config: {
                systemInstruction: "You are a PhD Astrophysicist named Dr. Aime Sagan, hosting an educational and interactive game about the cosmos. Your tone is enthusiastic, knowledgeable, and engaging.",
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
                description: "An array of 4 strings: one correct answer and three plausible distractors."
            },
            correctAnswer: { type: Type.STRING, description: "The correct answer, which must exactly match one of the items in the 'options' array." }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

export const generateCosmicQuiz = async (facts: string[]): Promise<QuizQuestion[]> => {
    try {
        const prompt = `
            Based on the following five facts, create a multiple-choice quiz with one question for each fact. Each question should test understanding of the core concept in the fact. Each question must have four options: one correct answer and three plausible but incorrect distractors.

            Facts:
            ${facts.map((fact, index) => `${index + 1}. ${fact}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
            model: factGenerationModel,
            contents: prompt,
            config: {
                systemInstruction: "You are Dr. Aime Sagan, a PhD Astrophysicist creating a quiz for your space game.",
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
