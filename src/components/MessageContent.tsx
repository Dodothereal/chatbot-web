'use client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { FileText } from 'lucide-react';

interface MessageContentProps {
    content: string;
    fileInfo?: {
        name: string;
        type: string;
        size: number;
        text?: string;
    };
}

export default function MessageContent({ content, fileInfo }: MessageContentProps) {
    return (
        <>
            {fileInfo && (
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm opacity-90">
                        {fileInfo.name}
                    </span>
                </div>
            )}
            <div className="markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                    components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ node, inline, className, children, ...props }) => (
                            <code
                                className={`${className} ${inline ? 'bg-gray-800 px-1 py-0.5 rounded' : ''}`}
                                {...props}
                            >
                                {children}
                            </code>
                        ),
                        pre: ({ children }) => (
                            <pre className="bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto">
                                {children}
                            </pre>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-500 pl-4 mb-4 italic">
                                {children}
                            </blockquote>
                        ),
                        a: ({ children, href }) => (

                            href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                        >
                        {children}
                        </a>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </>
    );
}