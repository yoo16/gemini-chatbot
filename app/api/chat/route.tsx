// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content, TextPart } from '@google/generative-ai';
import { Message } from '@/app/interfaces/Message';

var history: Content[] = [];
var conversationHistory: Content[] = [];

export async function POST(req: NextRequest) {
    const message = await req.json();
    if (!message) return;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return;
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat(
            {
                history: history,
                generationConfig: {
                    maxOutputTokens: 100,
                },
            }
        );
        const result = await chat.sendMessage(message.content);
        const botMessage: Message = {
            role: "models",
            content: result.response.text(),
        };
        return NextResponse.json(botMessage);
    } catch (error) {
        return NextResponse.json({ error: 'GoogleGenerativeAI error' }, { status: 500 });
    }
}
