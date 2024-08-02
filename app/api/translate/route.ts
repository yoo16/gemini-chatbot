import { getLanguageName } from "@/app/components/Lang";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = 'gemini-1.5-flash';
    if (API_KEY) {
        const requestData = await req.json();
        if (!requestData) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        console.log(requestData);

        const { fromLangCode, toLangCode, userMessage } = requestData;
        if (!fromLangCode || !toLangCode || !userMessage) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        const fromLang = getLanguageName(fromLangCode)
        const toLang = getLanguageName(toLangCode)

        const prompt = `Please translate from ${fromLang} to ${toLang} 
                        without bracket character. \n ${userMessage}`;
        console.log(prompt)

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const response = {
            original: userMessage,
            translate: result.response.text(),
        };
        return NextResponse.json(response);
    }
}