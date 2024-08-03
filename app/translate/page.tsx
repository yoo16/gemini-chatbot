'use client';

import { useState, useEffect, useRef, ReactElement, ReactHTML, useCallback } from 'react';
import axios from 'axios';
import { Message } from '../interfaces/Message';
import { languages, getLanguageName } from '@/app/components/Lang';
import { handleSpeak, initializeSpeechRecognition } from '../services/SpeechService';
import { translateText } from '../services/TranslateService';

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [fromLang, setFromLang] = useState<string>('ja-JP');
    const [toLang, setToLang] = useState<string>('en-US');
    const [error, setError] = useState<string>('');

    const swapLanguages = () => {
        const temp = fromLang;
        setFromLang(toLang);
        setToLang(temp);
    };

    const handleFromLang = (event: any) => {
        setFromLang(event.target.value);
    };

    const handleToLang = (event: any) => {
        setToLang(event.target.value);
    };

    // const handleSpeak = (text: string) => {
    //     if ('speechSynthesis' in window) {
    //         const utterance = new SpeechSynthesisUtterance(text);
    //         utterance.lang = toLang;
    //         window.speechSynthesis.speak(utterance);
    //     } else {
    //         setError('Your browser does not support speech synthesis.');
    //     }
    // };

    const translate = () => {
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
                const transcript = event.results[0][0].transcript;
                handleSubmit(transcript);
            };
            setRecognition(speechRecognition);
        } else {
            setError('Web Speech API is not supported in this browser.');
        }
    }

    const handleVoiceInput = () => {
        if (recognition) {
            recognition.start();
        }
    };

    const handleSubmit = async (userMessage: string) => {
        if (!userMessage) return;
        try {
            setMessages(prevMessages => [{ role: 'user', content: userMessage }, ...prevMessages]);
            const requestData = {
                userMessage: userMessage,
                fromLangCode: fromLang,
                toLangCode: toLang,
            }
            const result = await translateText(requestData);
            if (result.error) {
                setError(result.error);
            } else if (result.translate) {
                const botMessage: Message = { role: 'models', content: result.translate };
                setMessages(prevMessages => [botMessage, ...prevMessages]);
                handleSpeak(result.translate, toLang, setError);
            }
        } catch (error) {
            setError('Error fetching response:');
        }
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === ' ') {
            swapLanguages();
        } else if (event.key === 'Enter') {
            handleVoiceInput();
        }
        event.preventDefault();
    }, [handleVoiceInput, swapLanguages]);

    useEffect(() => {
        translate();
    }, [fromLang, toLang]);

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

                <button onClick={handleVoiceInput} className="p-2 bg-blue-500 text-white rounded mt-4">
                    {isListening ? 'Listening...' : '音声入力'}
                </button>
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
                        `}><span>{message.content}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}