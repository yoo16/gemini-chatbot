import { getLanguageName } from "@/app/components/Lang";
import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/app/services/TranslateAIService";

export async function POST(req: NextRequest) {
    const requestData = await req.json();
    if (!requestData) {
        return NextResponse.json({ error: "Invalid request data" });
    }
    const { fromLangCode, toLangCode, userMessage } = requestData;
    if (!fromLangCode || !toLangCode || !userMessage) {
        return NextResponse.json({ error: "Invalid request data" });
    }
    const fromLang = getLanguageName(fromLangCode);
    const toLang = getLanguageName(toLangCode);

    try {
        const translation = await translate(fromLang, toLang, userMessage);
        return NextResponse.json(translation);
    } catch (error) {
        const response = {
            original: userMessage,
            translate: '',
            error: 'Translate error.',
        };
        return NextResponse.json(response);
    }
}