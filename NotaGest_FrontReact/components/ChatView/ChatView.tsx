'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PaperAirplaneIcon, SparklesIcon, UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou seu assistente inteligente. Como posso ajudar com suas notas fiscais hoje?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/api/ai/query`, 
                { query: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.answer,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error("Erro no Chat IA:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, tive um problema ao processar sua pergunta. Verifique se você já cadastrou notas fiscais para que eu possa analisá-las.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header do Chat */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-4 flex items-center gap-3 text-white">
                <div className="bg-white/20 p-2 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="font-bold">Assistente Inteligente NotaGest</h2>
                    <p className="text-xs text-white/80">RAG-Powered AI • Gemini 2.5 Flash</p>
                </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'}`}>
                                {msg.sender === 'user' ? <UserCircleIcon className="w-6 h-6" /> : <CpuChipIcon className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                                    ${msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center animate-pulse">
                                <CpuChipIcon className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Quanto gastei em materiais na obra do Centro?"
                    className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ChatView;
