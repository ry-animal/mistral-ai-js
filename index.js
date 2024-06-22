import fs from 'fs';
import path from 'path';
import MistralClient from '@mistralai/mistralai';
import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

dotenv.config();

const { MISTRAL_API_KEY, SUPABASE_URL, SUPABASE_API_KEY } = process.env;

const mistral = new MistralClient(MISTRAL_API_KEY || '');
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

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

const handbookChunking = await splitDocument('example_handbook.txt');


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

const data = createEmbeddings(handbookChunking);

try{
    await supabase.from('handbook_docs').insert(data);
    console.log('success')
} catch(err) {
    console.log('something went wrong', err);
}
