import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const documents = JSON.parse(
  fs.readFileSync("./server/data/allData.json")
);

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function retrieve(query) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const queryEmbedding = response.data[0].embedding;

  const scoredDocs = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scoredDocs.sort((a, b) => b.score - a.score);

  return scoredDocs.slice(0, 3); // top 3 results
}
