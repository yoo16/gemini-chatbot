// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content, TextPart, InlineDataPart, HarmCategory, HarmBlockThreshold, StartChatParams } from '@google/generative-ai';
import { Message } from '@/app/interfaces/Message';

var history: Content[] = [];

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

const generationConfig = {
    temperature: 1,  //ランダム性
    topP: 0.95,      //累積確率
    topK: 64,        //トップkトークン
    maxOutputTokens: 1024,  //最大出力トークン数
    // responseMimeType: "application/json",
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export async function POST(req: NextRequest) {
    const message = await req.json();
    if (!message) return;
    if (!API_KEY) return;
    if (!GEMINI_MODEL) return;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel(
            {
                model: GEMINI_MODEL,
            });

        const config: StartChatParams = {
            history: history,
            generationConfig: generationConfig,
            safetySettings: safetySettings,
        }
        const chat = model.startChat(config);
        const result = await chat.sendMessage(message.content);
        const content = result.response.text().replaceAll('*', '\n');

        const botMessage: Message = {
            role: message.role,
            content: content,
        };
        return NextResponse.json(botMessage);
    } catch (error) {
        // return NextResponse.json({ error: 'GoogleGenerativeAI error' });
        return NextResponse.json({ error: error });
    }
}
