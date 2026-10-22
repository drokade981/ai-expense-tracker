import { User } from 'lucide-react';
import type { StreamMessage } from '../types.ts';
type Props = {
    message: StreamMessage
}
export function ChatMessage({ message }: Props) {
    console.log('message ===', message);
    if (message.type === 'user') {
        return (
            <div className="flex gap-4 py-6 px-6 transition-colors">
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white-500 via-white-500 to-gray-500 flex items-center justify-center shadow-lg">
                        <User color="white" />
                    </div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="text-sm font-medium text-zinc-300">
                        User
                    </div>
                    <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7">
                        {message.payload.text}
                    </div>
                </div>
            </div>
        )
    } else if(message.type === 'ai') {
        return (
            <div className="flex gap-4 py-6 px-6 transition-colors">
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white-500 via-white-500 to-gray-500 flex items-center justify-center shadow-lg">
                        {/* svg */}
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="text-sm font-medium text-zinc-300">
                        AI Assistant
                    </div>
                    <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7">
                        {message.payload.text}
                    </div>
                </div>
            </div>
        )
    } else if(message.type === 'toolCall:start') {
        return <>
            <div className='text-white'>
            <h1>Tool Call Start</h1>
            {JSON.stringify(message.payload.name, null, 2)}
            {JSON.stringify(message.payload.args, null, 2)}
            </div>
        </>
    } else if (message.type === 'tool') {
        return (
            <div className="flex gap-4 py-6 px-6">
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white-500 via-white-500 to-gray-500 flex items-center justify-center shadow-lg">
                        {/* svg */}
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="text-sm font-medium text-zinc-300">
                        Tool result: { ' ' }
                        <span className='text-yellow-200 font-medium'>{ message.payload.name}</span>
                    </div>
                    <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7">
                        {
                        JSON.stringify(message.payload.result, null, 2)
                        }
                    </div>
                </div>
            </div>
        )
    }
};