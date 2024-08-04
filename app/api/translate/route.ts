import { getLanguageName } from "@/app/components/Lang";
import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/app/services/TranslateAIService";
import { Message } from "@/app/interfaces/Message";

export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log("api translate:", data)
    const { message, toLang } = data;
    console.log("api translate:", message, toLang);
    if (!message || !toLang) return NextResponse.json({ error: 'API translate Message error.'});
    try {
        const result = await translate(message, toLang);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'API translate Translate error.'});
    }
}