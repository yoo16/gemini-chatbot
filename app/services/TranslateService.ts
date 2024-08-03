import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

if (!API_KEY) {
    throw new Error("API key is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
model.generationConfig.maxOutputTokens = 2048;

export async function translate(fromLang: string, toLang: string, userMessage: string) {
    const prompt = `Please translate from ${fromLang} to ${toLang} 
                    without bracket character.
                    If it cannot be translated, 
                    please return it as it cannot be translated in ${toLang}.
                    \n ${userMessage}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { original: userMessage, translate: text };
    } catch (error) {
        throw new Error('Translate Error');
    }
}