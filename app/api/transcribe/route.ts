import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import os from 'os';

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
    try {
        const file = req.body as any;
        if (!file) return;

        const buffer = await streamToBuffer(Readable.from(file));
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, 'upload.wav');

        fs.writeFileSync(tempFilePath, buffer);

        const fileData = fs.readFileSync(tempFilePath);
        return NextResponse.json({ fileData: fileData });
        // const response = await fetch('https://api.gemini.com/v1/speech-to-text', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${API_KEY}`,
        //         'Content-Type': 'audio/wav',
        //     },
        //     body: fileData,
        // });

        // if (!response.ok) {
        //     return NextResponse.json({ error: 'Error transcribing the audio' }, { status: response.status });
        // }

        // const data = await response.json();
        // return NextResponse.json({ transcription: data.transcription });

        // デバッグのためにファイルデータを返す
        // return NextResponse.json({ fileData: fileData.toString('base64') });
    } catch (error) {
        console.error('Error processing the request:', error);
        return NextResponse.json({ error: 'Error processing the request' });
    }
}
