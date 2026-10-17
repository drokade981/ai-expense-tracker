import express from 'express';
import cors from 'cors';
import { agent } from './index.ts';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log('server is running');
    res.send('Server is running');
});

app.post('/chat', async (req, res) => {
    res.writeHead(200, {
        'content-type': 'text/event-stream',
    });

    const {query} = req.body;

    const response = await agent.stream({
        messages: [
            {
                role: 'user',
                content: query
            }
        ]
    },{
        streamMode: ['messages'],
        configurable: { thread_id: '1'}
    });

    for await(const [eventType, chunk] of response){
        console.log('chunk', JSON.stringify(chunk[0].content, null,2));
        let message = { type: 'ai', payload: chunk[0].content};
        res.write(`event: ${eventType} \n`);
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    }    


    res.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});