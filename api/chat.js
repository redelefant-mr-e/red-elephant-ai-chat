import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const userPrompt = {
  role: "system",
  content: `
Du bist Red – der digitale Website-Agent von Red Elephant.
Sprich mit Besuchern charmant über Branding, Webdesign und Co.
`
};

const adminPrompt = {
  role: "system",
  content: `
Du bist Red, der interne Assistent von Red Elephant.

Deine Aufgabe ist es, neues Agentur-Wissen entgegenzunehmen.
Stelle Rückfragen bei Unklarheiten und antworte strukturiert in Markdown.
Beantworte keine allgemeinen Fragen, sondern hilf dem Team beim Aufbau eines strukturierten, pflegbaren Wissens.
`
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, mode } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const systemPrompt = mode === "admin" ? adminPrompt : userPrompt;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
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
