
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, DifficultyLevel, FactResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const factGenerationModel = "gemini-2.5-flash";
const imageGenerationModel = 'imagen-3.0-generate-002';

const factSchema = {
    type: Type.OBJECT,
    properties: {
        fact: { type: Type.STRING, description: "A single, interesting fact about the cosmos." },
        explanation: { type: Type.STRING, description: "A detailed, engaging explanation of the fact, tailored to the specified audience." },
        imagePrompt: { type: Type.STRING, description: "A rich, descriptive prompt for an image generation model to create a photorealistic, awe-inspiring image related to the fact. This prompt should be detailed and evoke a sense of wonder. For example: 'A swirling nebula of cosmic dust and gas, with newborn stars igniting within its vibrant clouds, in shades of deep purple and brilliant gold.'" }
    },
    required: ["fact", "explanation", "imagePrompt"],
};

const getDifficultyConfig = (difficulty: DifficultyLevel) => {
    const systemInstruction = "You are Commander Sagan, a seasoned and inspiring leader of the starship CosmoQuest. Your tone is commanding yet approachable, encouraging, and filled with a sense of wonder. You explain complex topics with clarity and passion, inspiring your crew (the students) to explore the universe. Your goal is to guide them on their educational mission, making them feel like part of an epic space exploration journey.";

    switch (difficulty) {
        case 1:
            return {
                audience: "high school students beginning their study of astronomy",
                systemInstruction,
                explanationDetail: "focusing on core principles and definitions, ensuring clarity and building a strong foundation.",
            };
        case 2:
            return {
                audience: "high school students with a grasp of basic astronomy",
                systemInstruction,
                explanationDetail: "delving into more specific phenomena and processes, such as stellar evolution or planetary science, with greater detail.",
            };
        case 3:
            return {
                audience: "advanced high school students ready for a challenge",
                systemInstruction,
                explanationDetail: "exploring complex, theoretical, or cutting-edge topics in astrophysics, such as black holes, dark matter, or the origins of the universe, with in-depth analysis.",
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
            Also, provide a detailed and creative prompt for an image generation model that visually represents the fact.
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

export const generateCosmicImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: `A breathtaking, photorealistic image of: ${prompt}. Cinematic lighting, high detail, 8k resolution.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating cosmic image:", error);
        return null; // Return null to indicate failure, allowing the app to proceed without an image.
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