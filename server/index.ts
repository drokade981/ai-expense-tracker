import { ChatGoogle } from "@langchain/google";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import dotenv from "dotenv";
import { initDB } from "./db.ts";
import { initTools } from "./tools.ts"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, ToolMessage } from "langchain";
import type { StreamMessage } from "./types.js";

dotenv.config();

/** initialise database */
const database = initDB("expenses.db");

const tools = initTools(database);

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash-lite",
});

/**
 * Tool Node
 * @param state 
 * @returns 
 */

const toolNode = new ToolNode(tools);

/**
 * call model node
 * @param state 
 * @returns 
 */
async function callModel(state: typeof MessagesAnnotation.State) {
    const  llmWithTools = llm.bindTools(tools);
    const response = await llmWithTools.invoke([
        {
            role: "system",
            content: `You are a helpful expense tracking asssistant. Current datetime is ${new Date().toISOString()}.
            call add_expense tool to add the expense to database
            call get_expenses tool to query expenses from database
            call generate_expense_chart tool when user needs to visualize expenses`
        },
        ...state.messages
    ]);
    return { messages: [response]};
}


/**
 * Continue edge
 */
function shouldContinue(state: typeof MessagesAnnotation.State, config: LangGraphRunnableConfig) {
    const messages = state.messages;
    const lastMessage = messages.at(-1) as AIMessage;
    
    if(lastMessage.tool_calls?.length) {

        // send custom event
        const customMessage: StreamMessage = {
            id: Date.now().toString(),
            type: 'toolCall:start',
            payload: {
                name: lastMessage.tool_calls[0].name,
                args: lastMessage.tool_calls[0].args
            }   
        };
        config.writer!(customMessage);
        return 'tools'
    }
    return '__end__';
}

function shouldCallModel(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages.at(-1) as ToolMessage;

    try {
        const message = typeof lastMessage.content === 'string'
            ? JSON.parse(lastMessage.content)
            : lastMessage.content;
        if (message && message.type === 'chart') {
            return '__end__';
        }
    } catch {
        // Not a JSON chart
    }
    return 'callModel';
}
/**
 * Graph
 */

const graph = new StateGraph(MessagesAnnotation)
    .addNode('callModel', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'callModel')
    .addConditionalEdges('callModel', shouldContinue, {
        __end__ : '__end__',
        tools: 'tools'
    })
    .addConditionalEdges('tools', shouldCallModel, {
        callModel: 'callModel',
        __end__: '__end__'
    });


    export const agent = graph.compile({
        checkpointer: new MemorySaver()
    });


    // async function main() {
    //     const response = await agent.stream({
    //         messages : [
    //             {
    //                 role: 'user',
    //                 content: 'Hi'
    //             }
    //         ]
    //     }, 
    //     {
    //         configurable: {thread_id: '1'},
    //         streamMode: ['updates', 'custom']
    //     }
    // );
    //     for await(const chunk of response) {
    //         const [step, content] = Object.entries(chunk)[0];
    //         console.log(`chunk: `, JSON.stringify(chunk, null, 2));
    //         // console.log(
    //         //     `content: ${JSON.stringify(content, null, 2)}`
    //         // )
    //     }
    //     console.log(JSON.stringify(response, null, 2));
    // }

    // main();