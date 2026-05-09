const { GoogleGenAI } = require('@google/genai');
const ErrorResponse = require('../utils/errorResponse');

exports.generateChatReply = async (message) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ErrorResponse('Gemini API key is not configured', 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are Krishi AI, an agricultural assistant for the Farmify app. You help farmers in India with their farming queries. Always be polite, helpful, and concise. If asked in Hindi or Hinglish, reply in Hinglish. Keep your answer under 3-4 short sentences.\nUser query: ${message}`,
          },
        ],
      },
    ],
  });

  return response.text || 'Sorry, I could not generate a response.';
};
