import { User } from 'lucide-react';
import type { StreamMessage } from '../types.ts';
import { ExpenseChart } from './ui/ExpenseChart.tsx';
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
                        {typeof message.payload?.text === 'string'
                            ? message.payload.text
                            : JSON.stringify(message.payload?.text, null, 2)}
                    </div>
                </div>
            </div>
        );
    } else if (message.type === 'toolCall:start') {
        return (
            <div className="flex items-center gap-3 py-3 px-6 text-xs text-amber-300/90 bg-amber-500/5 border-y border-amber-500/10">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="font-mono font-medium">Executing tool: <span className="text-amber-200">{message.payload.name}</span></span>
                {message.payload.args && Object.keys(message.payload.args).length > 0 && (
                    <span className="text-zinc-500 font-mono">({JSON.stringify(message.payload.args)})</span>
                )}
            </div>
        );
    } else if (message.type === 'tool') {
        return (
            <div className="flex gap-4 py-6 px-6">
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="text-sm font-medium text-zinc-300">
                        Tool Result: <span className='text-emerald-400 font-semibold'>{message.payload.name}</span>
                    </div>
                    <div className="text-zinc-100 whitespace-pre-wrap wrap-break-word leading-7 font-mono text-xs bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                        {typeof message.payload.result === 'string'
                            ? message.payload.result
                            : JSON.stringify(message.payload.result, null, 2)}
                    </div>
                    {message.payload.name === 'generate_expense_chart' && (
                        <ExpenseChart 
                        chartData={message.payload.result.data} 
                        labelKey={message.payload.result.labelKey}
                        />
                    )}
                </div>
            </div>
        );
    }

    return null;
}