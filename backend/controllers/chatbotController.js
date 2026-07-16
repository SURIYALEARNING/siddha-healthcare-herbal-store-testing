import { getFallbackResponse, getGeminiResponse } from '../services/chatbotService.js';

export async function chatHandler(req, res) {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Query message is required." });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === "MY_GEMINI_API_KEY") {
    console.log("No GEMINI_API_KEY located in environment, utilizing traditional rule-based Siddha therapist backup.");
    const responseText = getFallbackResponse(message);
    return res.json({ response: responseText });
  }

  try {
    const responseText = await getGeminiResponse(message, chatHistory);
    res.json({ response: responseText });
  } catch (err) {
    console.error("Gemini API server side error: ", err);
    res.status(500).json({ error: "Encountered issue calling Agathiyar AI engine. Please retry." });
  }
}
