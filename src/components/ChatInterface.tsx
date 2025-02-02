'use client';
import { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';
import { MessageCircle, PlusCircle, Send, FileText, Bot, User, Loader } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    fileInfo?: {
        name: string;
        type: string;
        size: number;
        text?: string;
    };
}

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    messages: Message[];
}

export default function ChatInterface() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations from localStorage on initial render
    useEffect(() => {
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            const parsed = JSON.parse(savedConversations);
            setConversations(parsed);
            if (parsed.length > 0 && !currentConversationId) {
                const mostRecent = parsed[parsed.length - 1];
                setCurrentConversationId(mostRecent.id);
                setMessages(mostRecent.messages);
            }
        }
    }, []);

    // Save conversations to localStorage whenever they change
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
    }, [conversations]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const createNewConversation = () => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            timestamp: new Date(),
            messages: []
        };
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
        setMessages([]);
    };

    const selectConversation = (conversation: Conversation) => {
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages);
    };

    const updateConversation = (messages: Message[]) => {
        if (!currentConversationId) return;

        setConversations(prev => prev.map(conv => {
            if (conv.id === currentConversationId) {
                return {
                    ...conv,
                    title: messages[0]?.content.slice(0, 30) + '...' || 'New Chat',
                    messages: messages,
                    timestamp: new Date()
                };
            }
            return conv;
        }));
    };

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            if (file.type === 'application/pdf') {
                const response = await fetch('/api/process-pdf', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to process PDF');
                }

                const data = await response.json();

                // Add file upload message to chat
                const fileMessage = {
                    role: 'user' as const,
                    content: `Uploaded PDF: ${file.name}\nNumber of pages: ${data.pages}`,
                    fileInfo: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        text: data.text
                    }
                };

                const updatedMessages = [...messages, fileMessage];
                setMessages(updatedMessages);

                // Send the PDF content to Claude
                const claudeResponse = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: "I've uploaded a PDF document. Please analyze its content: \n\n" + data.text,
                        messageHistory: updatedMessages
                    }),
                });

                if (!claudeResponse.ok) {
                    throw new Error('Failed to get Claude response');
                }

                const claudeData = await claudeResponse.json();
                const finalMessages = [...updatedMessages, { role: 'assistant', content: claudeData.message }];
                setMessages(finalMessages);
                updateConversation(finalMessages);

            } else {
                const errorMessages = [...messages, {
                    role: 'assistant',
                    content: 'Sorry, currently only PDF files are supported for processing.'
                }];
                setMessages(errorMessages);
                updateConversation(errorMessages);
            }

        } catch (error) {
            console.error('Error handling file:', error);
            const errorMessages = [...messages, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your file.'
            }];
            setMessages(errorMessages);
            updateConversation(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Create new conversation if none exists
        if (!currentConversationId) {
            createNewConversation();
        }

        const userInput = input;
        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userInput,
                    messageHistory: newMessages,
                    fileInfo: selectedFile ? {
                        name: selectedFile.name,
                        type: selectedFile.type,
                        size: selectedFile.size,
                    } : null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            const updatedMessages = [...newMessages, { role: 'assistant', content: data.message }];
            setMessages(updatedMessages);
            updateConversation(updatedMessages);

        } catch (error) {
            console.error('Error:', error);
            const errorMessages = [...newMessages, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.'
            }];
            setMessages(errorMessages);
            updateConversation(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Conversation History Sidebar */}
            <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <h1 className="text-xl font-bold text-white mb-4 flex items-center">
                        <MessageCircle className="w-6 h-6 mr-2" />
                        Conversations
                    </h1>
                    <button
                        onClick={createNewConversation}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-2.5 px-4 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <PlusCircle className="w-5 h-5" />
                        New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${
                                currentConversationId === conv.id
                                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-100'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{conv.title || 'New Chat'}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {new Date(conv.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-800 to-gray-900">
                {/* Messages Section */}
                <div className="flex-1 overflow-y-auto p-6" style={{ scrollBehavior: 'smooth' }}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-6 flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`flex items-start max-w-[80%] space-x-3 ${
                                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-600 text-white'
                                }`}>
                                    {message.role === 'user'
                                        ? <User className="w-5 h-5" />
                                        : <Bot className="w-5 h-5" />
                                    }
                                </div>
                                <div
                                    className={`p-4 rounded-2xl ${
                                        message.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none'
                                            : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-tl-none'
                                    }`}
                                >
                                    {message.fileInfo ? (
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-sm opacity-90">
                        {message.fileInfo.name}
                      </span>
                                        </div>
                                    ) : null}
                                    <span className="whitespace-pre-wrap">{message.content}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-full text-gray-200">
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Section */}
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <FileUpload
                            onFileSelect={handleFileSelect}
                            disabled={isLoading}
                            compact={true}
                        />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full p-4 pr-16 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                placeholder="Type your message..."
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                                    isLoading || !input.trim()
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-500 hover:text-blue-400'
                                }`}
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}