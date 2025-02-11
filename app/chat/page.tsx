'use client';

import { useState, useEffect, useRef, ReactElement, ReactHTML } from 'react';
import axios from 'axios';
import { Message } from '@/app/interfaces/Message';

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<Message>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputText = e.target.value;
        // console.log(inputText);
        const message: Message = {
            role: 'user',
            content: inputText,
            lang: 'ja-JP',
        }
        setMessage(message);
    };

    const handleSubmit = async () => {
        console.log("handleSubmit:", message)
        if (!message) return;
        setMessages(prevMessages => [...prevMessages, message]);

        try {
            // Chat
            const response = await axios.post('/api/chat', message);
            console.log(response);
            if (response?.data.message) {
                const botMessage = response?.data.message;
                botMessage.role = 'models';
                setMessages(prevMessages => [, ...prevMessages, response.data.message]);
            }
        } catch (error) {
            console.error('Error fetching response:', error);
        }
    };


    return (
        <div className="p-4 mb-4">
            <div className="bg-white shadow-md p-4 z-10">
                <h1>Chat</h1>
                <input onChange={handleInputText} type="text" className="border p-3 w-full"
                    value={message?.content} />
                <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">
                    Send
                </button>
            </div>

            <div>
                {messages && messages.map((message, index) => (
                    <div
                        key={index}
                        className={`m-3 p-5 rounded-lg shadow-md
                        ${message.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100  text-gray-800'}
                    `}>
                        <span className=
                            {`inline-block mb-2 me-3 px-3 py-1 
                                rounded-full text-white 
                                text-sm font-semibold
                            ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}
                        `}>
                            {message.role === 'user' ? 'あなた' : 'Bot'}
                        </span>
                        <span>{message.content}</span>
                    </div>
                ))}
            </div>
            <div ref={messagesEndRef} />
        </div>
    );
}