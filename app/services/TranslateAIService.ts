import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/app/interfaces/Message";
import { getLanguageName } from "../components/Lang";

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

if (!API_KEY) {
    throw new Error("API key is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
model.generationConfig.maxOutputTokens = 2048;

export async function translate(message: Message, toLang: string) {
    const fromLangString = getLanguageName(message.lang);
    const toLangString = getLanguageName(toLang);

    const prompt = `Please translate from ${fromLangString} to ${toLangString} 
                    without bracket character.
                    If it cannot be translated, 
                    please return it as it cannot be translated in ${toLangString}.
                    \n ${message.content}`;

    try {
        const result = await model.generateContent(prompt);
        message.content = result.response.text();
        message.lang = toLang;
        return { message: message };
    } catch (error) {
        return { message: null, error: 'Translate error.' };
    }
}