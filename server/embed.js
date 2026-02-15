import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import fs from "fs";

// Import all data files
import chickenpox from "./data/chickenpox.js";
import measles from "./data/measles.js";
import monkeypox from "./data/monkeypox.js";
import normal from "./data/normal.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbeddings() {
  const allDocs = [
    ...chickenpox,
    ...measles,
    ...monkeypox,
    ...normal,
  ];

  for (let doc of allDocs) {
    console.log("Generating embedding for:", doc.id);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: doc.content,
    });

    doc.embedding = response.data[0].embedding;
  }

  fs.writeFileSync(
    "./server/data/allData.json",
    JSON.stringify(allDocs, null, 2)
  );

  console.log("✅ Embeddings Generated & Saved in allData.json");
}

generateEmbeddings();
