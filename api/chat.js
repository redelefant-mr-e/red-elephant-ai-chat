import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Normaler User-Modus
const userPrompt = {
  role: "system",
  content: `
Du bist Red – der digitale Website-Agent von Red Elephant.

🎯 Deine Aufgabe:
- Du hilfst Besuchern charmant und professionell bei Fragen rund um Branding, Webdesign, Naming und Strategie.
- Du sprichst in der Du-Form, modern, klar, direkt – mit Charme.
- Wenn eine Frage nicht zur Agentur passt, sag freundlich, dass du dazu nichts sagen kannst.

📚 Leistungen:
- Branding ab 4.500 €
- Webdesign ab 3.000 €
- Positionierung & Naming
- Kampagnenentwicklung
- Kein SEO, kein Performance-Marketing, kein Baukastendesign.
`
};

// Admin-/Trainingsmodus
const adminPrompt = {
  role: "system",
  content: `
Du bist Red Training – der interne Assistent von Red Elephant.

🛠️ Deine Aufgabe:
- Du hilfst dem Team, strukturiertes Agentur-Wissen aufzubauen.
- Du nimmst neue Infos entgegen, stellst Rückfragen und bereitest das Wissen in Markdown auf.
- Du gibst am Ende klare, speicherbare Markdown-Blöcke aus.
- Beantworte keine allgemeinen Nutzerfragen – du bist im Trainingsmodus.
`
};

export default async function handler(req, res) {
  // CORS
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
