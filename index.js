import dotenv from 'dotenv';
dotenv.config();

import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY || '';
const client = new MistralClient(apiKey);

const chatResponse = await client.chat({
    model: "mistral-tiny",
    messages: [{role: 'user', content: 'ASK Q HERE'}]
});

console.log(chatResponse.choices[0].message.content);
