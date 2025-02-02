import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Chatbot Interface',
    description: 'A sophisticated chatbot interface with file upload and markdown support',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <head>
            {/* KaTeX CSS for LaTeX rendering */}
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
                integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
                crossOrigin="anonymous"
            />

            {/* Syntax highlighting theme for code blocks */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css"
            />

            {/* Add custom fonts if desired */}
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {children}
        </div>
        </body>
        </html>
    )
}