import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js"
import dotenv from "dotenv"
dotenv.config()
export const vectoStore=async(docs,collectionName)=>{
    const vectorStore = await QdrantVectorStore.fromExistingCollection(docs,embeddings, {
  url: process.env.QDRANT_URL,
  collectionName,
});
}