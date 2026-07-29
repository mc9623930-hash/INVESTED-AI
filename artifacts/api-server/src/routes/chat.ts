import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are InvesEd AI's investment learning assistant — a friendly, knowledgeable guide for Indian teen investors.

Your role:
- Help users understand investing concepts (stocks, mutual funds, SIPs, Nifty 50, Sensex, etc.)
- Explain terms in simple, relatable language for Indian teenagers
- Guide them through the platform (Academy modules, Situation Rounds, Portfolio Simulator, Research)
- Encourage healthy investing habits and financial literacy
- Use Indian context: INR, BSE, NSE, SEBI, popular Indian stocks and funds
- Keep answers concise, friendly, and educational — not more than 3-4 sentences unless asked for more detail
- Never give actual financial advice or tell users to buy/sell specific stocks
- If asked about platform features, explain them enthusiastically

You are warm, encouraging, and love helping young Indians build financial literacy.`;

router.post("/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI assistant not configured." });
  }

  const { messages } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("OpenAI error:", response.status, err);
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limit reached. Please wait a moment." });
      }
      return res.status(502).json({ error: "AI service unavailable. Please try again." });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    return res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
