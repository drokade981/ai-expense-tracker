import express from 'express';
import cors from 'cors';
import { agent } from './index.ts';
import type { StreamMessage } from './types.ts';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log('server is running');
    res.send('Server is running');
});

function extractText(content: unknown): string {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object') {
                    if ('text' in item && typeof (item as any).text === 'string') {
                        return (item as any).text;
                    }
                }
                return '';
            })
            .join('');
    }
    return '';
}

app.post('/chat', async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const { query } = req.body;

    const response = await agent.stream({
        messages: [
            {
                role: 'user',
                content: query
            }
        ]
    }, {
        streamMode: ['messages', 'custom'],
        configurable: { thread_id: '1' }
    });

    for await (const [eventType, chunk] of response) {
        console.log('eventType', eventType);

        if (eventType === 'custom') {
            console.log('custom chunk', JSON.stringify(chunk));
            const customMessage = chunk as StreamMessage;
            if (!customMessage.id) {
                customMessage.id = Date.now().toString();
            }
            res.write(`event: ${eventType}\n`);
            res.write(`data: ${JSON.stringify(customMessage)}\n\n`);
            continue;
        }

        if (eventType === 'messages') {
            const [messageChunk] = chunk;
            if (!messageChunk) continue;

            const messageType = messageChunk.getType ? messageChunk.getType() : messageChunk.type;

            if (messageType === 'ai') {
                const text = extractText(messageChunk.content);
                // Skip if there's no text (e.g. tool call or thought part)
                if (!text) continue;

                const message: StreamMessage = {
                    id: messageChunk.id || 'ai-response',
                    type: 'ai',
                    payload: { text }
                };

                res.write(`event: ${eventType}\n`);
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            } else if (messageType === 'tool') {
                let parsedResult = messageChunk.content;
                if (typeof messageChunk.content === 'string') {
                    try {
                        parsedResult = JSON.parse(messageChunk.content);
                    } catch {
                        parsedResult = messageChunk.content;
                    }
                }

                const message: StreamMessage = {
                    id: messageChunk.id || Date.now().toString(),
                    type: 'tool',
                    payload: {
                        name: messageChunk.name || 'tool',
                        result: parsedResult
                    }
                };

                res.write(`event: ${eventType}\n`);
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        }
    }

    res.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});