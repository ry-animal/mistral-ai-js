import dotenv from 'dotenv';
dotenv.config();
import MistralClient from '@mistralai/mistralai';
import { tools, getPaymentDate, getPaymentStatus } from "./tools.js";
const client = new MistralClient(process.env.MISTRAL_API_KEY);

const availableFunctions = {
    getPaymentDate,
    getPaymentStatus
};

async function agent(query) {
    const messages = [
        { role: "user", content: query }
    ];

    for (let i = 0; i < 5; i++) {
        const response = await client.chat( {
            model: 'mistral-large-latest',
            messages: messages,
            tools: tools
        });
        const choice = response.choices[0];
        const message = choice.message;
        
        messages.push(message);

        const finishReason = choice.finish_reason;

        if (finishReason === 'stop') {
            return message.content;
        }
        
        if (finishReason === 'tool_calls') {
            const toolFunction = message.tool_calls[0].function;
            const functionName = toolFunction.name;
            const functionArgs = JSON.parse(toolFunction.arguments);

            const functionResponse = availableFunctions[functionName](functionArgs);

            messages.push({
                role: 'tool',
                name: functionName,
                content: functionResponse 
            });
        }
    }
}

const response = await agent("when was the transaction T1001 paid?");

console.log(response);