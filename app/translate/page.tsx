'use client';

import axios from 'axios';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/app/interfaces/Message';
import { getLanguageName, languages } from '@/app/components/Lang';
import { handleSpeak, initializeSpeechRecognition, SpeechRecognitionConfig } from '../services/SpeechService';
import { translateText } from '@/app/services/TranslateService';
import { translate } from '@/app/services/TranslateAIService';

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [translateMessage, setTranslateMessage] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [fromLang, setFromLang] = useState<string>('ja-JP');
    const [toLang, setToLang] = useState<string>('en-US');
    const [error, setError] = useState<string>('');

    const swapLanguages = useCallback(() => {
        const temp = fromLang;
        setFromLang(toLang);
        setToLang(temp);
    }, [fromLang, toLang]);

    const handleFromLang = (event: any) => {
        setFromLang(event.target.value);
    };

    const handleToLang = (event: any) => {
        setToLang(event.target.value);
    };

    const initSpeechRecognition = useCallback(() => {
        if ('webkitSpeechRecognition' in window) {
            const speechRecognition = new (window as any).webkitSpeechRecognition();
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.lang = fromLang;

            speechRecognition.onstart = () => {
                setIsListening(true);
            };

            speechRecognition.onend = () => {
                setIsListening(false);
            };

            speechRecognition.onresult = (event: any) => {
                const message: Message = {
                    role: 'user',
                    content: event.results[0][0].transcript,
                    lang: fromLang,
                }
                handleTranslate(message, toLang);
            };
            setRecognition(speechRecognition);
        } else {
            setError('Web Speech API is not supported in this browser.');
        }
    }, [fromLang, toLang]);

    const handleVoiceInput = useCallback(() => {
        if (recognition) {
            recognition.start();
        }
    }, [recognition]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === ' ') {
            swapLanguages();
            event.preventDefault();
        } else if (event.key === 'Enter') {
            handleVoiceInput();
            event.preventDefault();
        }
    }, [handleVoiceInput, swapLanguages]);

    const testTranslate = async () => {
        const message: Message = {
            role: 'user',
            content: 'こんにちは',
            lang: 'ja-JP',
        }
        await handleTranslate(message, 'en-US');
    }

    const handleTranslate = async (message: Message, toLang: string) => {
        setError('');
        if (!message) return;
        try {
            setMessages(prevMessages => [message, ...prevMessages]);
            const result = await translateText(message, toLang);
            if (result.error) {
                setError(result.error);
            } else if (result.message) {
                const translateMessage = result.message
                translateMessage.role = (message.role === 'partner') ? 'user' : 'partner';
                setTranslateMessage(translateMessage.content);
                setMessages(prevMessages => [translateMessage, ...prevMessages]);
                handleSpeak(translateMessage.content, translateMessage.lang, setError, setIsSpeaking);
            }
        } catch (error) {
            setError('Error fetching response:');
        }
    };

    const handleAIAnswer = async (message: Message) => {
        try {
            const response = await axios.post('/api/chat', message);
            if (!response.data.error && response.data.message) {
                handleTranslate(response.data.message, fromLang);
            }
        } catch (err) {
            setError('Chat error');
        }
    }

    const stopSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false)
        }
    };

    useEffect(() => {
        initSpeechRecognition();
    }, [initSpeechRecognition, fromLang, toLang]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="p-4 mb-4">
            <div className="bg-white shadow-md p-4 z-10">
                <div>
                    <select id="from-language" className="mx-3 p-3" value={fromLang} onChange={handleFromLang}>
                        {languages.map((language) => (
                            <option key={language.code} value={language.code}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={swapLanguages} className="mx-3 p-3">
                        →
                    </button>
                    <select id="to-language" className="mx-3 p-3" value={toLang} onChange={handleToLang}>
                        {languages.map((language) => (
                            <option key={language.code} value={language.code}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                </div>

                {error &&
                    <div className="bg-red-300 text-red-600 p-6">
                        {error}
                    </div>
                }

                <div className="flex space-x-4 mt-4">
                    <button onClick={testTranslate} className="p-2 bg-orange-500 text-white rounded">
                        Test Translate
                    </button>

                    <button onClick={handleVoiceInput} className="p-2 bg-blue-500 text-white rounded">
                        {isListening ? 'Listening...' : 'Input voice'}
                        <span className="m-2">
                            [Enter]
                        </span>
                    </button>
                    {isSpeaking && (
                        <button onClick={stopSpeech} className="p-2 bg-red-500 text-white rounded">
                            Stop Speech
                        </button>
                    )}
                </div>

                {translateMessage &&
                    <div className="text-3xl my-3 p-5 bg-gray-100 text-gray-800">
                        {translateMessage}
                    </div>
                }
            </div>

            <div className="flex flex-col">
                {messages && messages.map((message, index) => (
                    <div
                        key={index}
                        className={`m-3 p-5 w-1/2 rounded-lg shadow-md
                                ${message.role === 'user' ?
                                'bg-blue-100 text-blue-800 self-start' :
                                'bg-gray-100 text-gray-800 self-end'
                            }
                        `}>
                        <span>{message.content}</span>
                        <span className="bg-gray-500 text-white mx-1 py-1 px-2 rounded text-xs">
                            {getLanguageName(message.lang)}
                        </span>
                        <div className="mt-2">
                            <button onClick={() => handleSpeak(message.content, message.lang, setError, setIsSpeaking)}
                                className="bg-green-500 text-white mx-1 py-1 px-2 rounded text-xs"
                            >
                                Speech
                            </button>
                            <button onClick={() => handleAIAnswer(message)}
                                className="bg-blue-500 text-white mx-1 py-1 px-2 rounded text-xs"
                            >
                                AI answer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
