import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// LM Studio local API endpoint
const MODEL_URL = "http://127.0.0.1:5001/v1/chat/completions";

app.post("/generate", async (req, res) => {
  const { character, history, userMessage } = req.body;

  // Build the RP prompt
  const prompt = `
You are writing as the character ${character.name} in a roleplay scene.

Write in a natural, human, scene-based style:
- Use third-person actions
- Use natural, human dialogue
- Show movement, body language, pacing
- No generic emotional analysis
- No "they pause" / "they think carefully" filler
- No summarizing the user’s message
- No disclaimers or meta-commentary
- Stay fully in character

Character:
Name: ${character.name}
Description: ${character.description}
Personality: ${character.personality}
Speaking Style: ${character.style}
Example Lines: ${character.examples}

Conversation so far:
${history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n")}

USER: "${userMessage}"

Write ${character.name}'s next message as a scene, with actions and dialogue.
`;

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mixtral-8x22b",   // LM Studio model name
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 350
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "…";

    res.json({ reply });
  } catch (err) {
    console.error("Error contacting LM Studio:", err);
    res.json({ reply: "Error: could not reach local model." });
  }
});

// Start server
app.listen(5000, () => {
  console.log("LocalRP backend running at http://localhost:5000");
});