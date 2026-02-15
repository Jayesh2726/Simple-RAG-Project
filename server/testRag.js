import OpenAI from "openai";
import { retrieve } from "./retriever.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  const query = "What are symptoms of measles?";

  const docs = await retrieve(query);

  const context = docs.map(d => d.content).join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a medical assistant. Answer based only on provided context."
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion:\n${query}`
      }
    ]
  });

  console.log("\n🧠 Answer:\n");
  console.log(response.choices[0].message.content);
}

run();
