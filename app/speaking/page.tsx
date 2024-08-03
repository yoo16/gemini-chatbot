'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
    const [transcription, setTranscription] = useState<string>('');
    const [audio, setAudio] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [error, setError] = useState<string>('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    const sendAudio = async (audio: Blob) => {
        const formData = new FormData();
        formData.append('file', audio, 'audio.wav');
        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            console.log(data);
            setTranscription(data.transcription);
        } catch (err) {
            setError('Error sending audio');
        }
    };

    const startRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.start();
                mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
                    setAudio(e.data);
                    setAudioUrl(URL.createObjectURL(e.data));
                };
            } catch (err) {
                setError('Error accessing audio devices');
            }
        } else {
            setError('getUserMedia not supported on your browser!');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };

    const playAudio = () => {
        if (audioElementRef.current) {
            audioElementRef.current.play();
        }
    };

    useEffect(() => {
        if (audio && audioUrl) {
            if (audioElementRef.current) {
                audioElementRef.current.src = audioUrl;
                playAudio();
            }
        }
    }, [audio, audioUrl]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Audio Transcription</h1>
            {error && (
                <div className="bg-red-300 text-red-500 mb-4">
                    {error}
                </div>
            )}
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Start Recording
                </button>
                <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                    Stop Recording
                </button>
            </div>
            {audio && (
                <audio controls ref={audioElementRef} />
            )}
            <h2 className="text-2xl font-semibold mb-2">Transcription</h2>
            <p className="px-4 py-2 bg-white rounded shadow w-3/4">{transcription}</p>
        </div>
    );
}
