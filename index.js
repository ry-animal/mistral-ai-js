import fs from 'fs';
import path from 'path';
import MistralClient from '@mistralai/mistralai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';

dotenv.config();
const client = new MistralClient(process.env.MISTRAL_API_KEY || '');

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
    const embeddings = await client.embeddings({
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

//createEmbeddings(handbookChunking);

console.log(await createEmbeddings(handbookChunking))
