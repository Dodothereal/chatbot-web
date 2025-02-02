import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { message, messageHistory } = await request.json();

        // Convert message history to Anthropic's format
        const messages = messageHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
        }));

        // Add the new message
        messages.push({ role: "user", content: message });

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 5000,
            messages: messages
        });

        return new Response(JSON.stringify({
            message: response.content[0].text
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Error processing your request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}