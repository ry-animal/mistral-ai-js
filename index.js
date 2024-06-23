
import dotenv from 'dotenv';
import MistralClient from '@mistralai/mistralai';
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const mistral = new MistralClient(process.env.MISTRAL_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

const input = "December 25th is on a Sunday, do I get any extra time off to account for that?";

const embedding = await createEmbedding(input);

const context = await retrieveMatches(embedding);

const response = await generateChatResponse(context, input);
console.log(response);

async function createEmbedding(input) {
  const embeddingResponse = await mistral.embeddings({
      model: 'mistral-embed',
      input: [input]
  });
  return embeddingResponse.data[0].embedding;
}

async function retrieveMatches(embedding) {
    const { data } = await supabase.rpc('match_handbook_docs', {
        query_embedding: embedding,
        match_threshold: 0.78,
        match_count: 5
    });

    return data.map(chunk => chunk.content).join (" ");
}


async function generateChatResponse(context, query) {
    const response = await mistral.chat({
        model: 'mistral-tiny',
        messages: [{
            role: 'user',
            content: `Handbook context: ${context} - Question: ${query}`
        }]
    });
    return response.choices[0].message.content;
}