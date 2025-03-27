import fs from "fs";
import path from "path";
import { Configuration, OpenAIApi } from "openai";

// GPT konfigurieren
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 🔁 Markdown-Loader
function loadPromptFromFile(filename) {
  const filePath = path.join(process.cwd(), "knowledge", "prompts", filename);
  return fs.readFileSync(filePath, "utf-8");
}

// Prompts aus Markdown laden
const userPrompt = {
  role: "system",
  content: loadPromptFromFile("user-prompt.md"),
};

const adminPrompt = {
  role: "system",
  content: loadPromptFromFile("admin-prompt.md"),
};

export default async function handler(req, res) {
  // CORS erlauben
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, mode } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemPrompt = mode === "admin" ? adminPrompt : userPrompt;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        systemPrompt,
        { role: "user", content: message }
      ]
    });

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("GPT Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
}
