'use client';

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import PrefectureSelect from "../components/Prefecture";
import { Message } from "../interfaces/Message";

export default function Home() {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const changeMessageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
    };

    const changePrefectureHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPrefecture(e.target.value);
    };

    const changeStartDateHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const changeEndDateHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const sendHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (inputMessage.trim() === '' && selectedPrefecture === '' && startDate === '' && endDate === '') return;

        const userMessage: Message = {
            role: 'model',
            content: inputMessage +
                (selectedPrefecture ? ` (${selectedPrefecture})` : '') +
                (startDate ? ` Start Date: ${startDate}` : '') +
                (endDate ? ` End Date: ${endDate}` : '')
        };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        try {
            const response = await axios.post('/api/travel_plan/', userMessage);
            const botMessage = response.data;
            setMessages([...updatedMessages, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setInputMessage('');
        setSelectedPrefecture('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <main className="">
            <div className="bg-white shadow-md p-4 z-10">
                <h1 className="text-2xl p-5">Travel Plan</h1>
                <div className="">
                    <label htmlFor="">場所</label>
                    <PrefectureSelect
                        selectedPrefecture={selectedPrefecture}
                        onChange={changePrefectureHandler}
                    />
                </div>
                <div>
                    <label htmlFor="">フリーワード</label>
                    <input
                        onChange={changeMessageHandler}
                        value={inputMessage}
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-l mr-0"
                        placeholder="Type your message..."
                    />
                </div>
                <div>
                    <label htmlFor="">開始日</label>
                    <input
                        onChange={changeStartDateHandler}
                        value={startDate}
                        type="date"
                        className="w-1/4 p-2 border border-gray-300 rounded-l mr-0"
                    />
                </div>
                <div>
                    <label htmlFor="">終了日</label>
                    <input
                        onChange={changeEndDateHandler}
                        value={endDate}
                        type="date"
                        className="w-1/4 p-2 border border-gray-300 rounded-l mr-0"
                    />
                </div>
                <div className="my-4">
                    <button
                        className="w-1/6 bg-blue-500 text-white p-2 rounded-r"
                        onClick={sendHandler}>
                        Send
                    </button>
                </div>
            </div>
            <div className="pt-32 p-4 mb-4 overflow-y-scroll">
                {messages && messages.map((message, index) => (
                    <div
                        key={index}
                        className="m-3 p-5 border border-gray-100 rounded">
                        <span className={
                            `inline-block mb-2 me-3 px-3 py-1 
                             rounded-full text-white 
                             text-sm font-semibold
                             ${message.role === 'model' ? 'bg-blue-600' : 'bg-gray-600'}
                            `}>
                            {message.role === 'model' ? 'あなた' : 'ボット'}
                        </span>
                        <span>{message.content}</span>
                    </div>
                ))}
            </div>
            <div ref={messagesEndRef} />
        </main>
    );
}