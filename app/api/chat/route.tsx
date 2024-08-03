// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content, TextPart } from '@google/generative-ai';
import { Message } from '@/app/interfaces/Message';

var history: Content[] = [];

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const MAX_TOKEN = 1024;

export async function POST(req: NextRequest) {
    const message = await req.json();
    if (!message) return;
    if (!API_KEY) return;
    if (!GEMINI_MODEL) return;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const config = {
            history: history,
            generationConfig: {
                maxOutputTokens: MAX_TOKEN,
            },
        }
        const chat = model.startChat(config);
        const result = await chat.sendMessage(message.content);

        const botMessage: Message = {
            role: message.role,
            content: result.response.text(),
        };
        return NextResponse.json(botMessage);
    } catch (error) {
        return NextResponse.json({ error: 'GoogleGenerativeAI error' });
    }
}
