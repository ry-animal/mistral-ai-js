import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import MistralClient from '@mistralai/mistralai';
import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

const mistral = new MistralClient(process.env.MISTRAL_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

export async function splitDocument(pathToFile) {
    const filePath = path.join(process.cwd(), pathToFile);
  
    try {
      const text = await fs.promises.readFile(filePath, 'utf-8');
  
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
        chunkOverlap: 40
      });
  
      const output = await splitter.createDocuments([text]);
      return output.map(chunk => chunk.pageContent);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }

const handbookChunks = await splitDocument('example_handbook.txt');

async function createEmbeddings(chunks) {
    const embeddings = await mistral.embeddings({
        model: 'mistral-embed',
        input: chunks
    });
    const data = chunks.map((chunk, i) => {
        return {
            content: chunk,
            embedding: embeddings.data[i].embedding
        }
    });
    return data;
}

const data = await createEmbeddings(handbookChunks);
await supabase.from('handbook_docs').insert(data);
console.log("Upload complete!");


