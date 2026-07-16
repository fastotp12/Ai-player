import mineflayer from 'mineflayer';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import 'dotenv/config';

// API ক্লায়েন্ট সেটআপ
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// সার্ভার কনফিগারেশন (IP এবং Port আলাদা করা হয়েছে)
const serverConfig = {
  host: "46.224.7.62",
  port: 25871,
  // version কেটে দেওয়া হয়েছে যাতে বট নিজে থেকে সার্ভার ভার্সন ডিটেক্ট করতে পারে
};

// ১. Gemini Bot তৈরি
const geminiBot = mineflayer.createBot({
  ...serverConfig,
  username: 'Gemini_AI'
});

// ২. Claude Bot তৈরি
const claudeBot = mineflayer.createBot({
  ...serverConfig,
  username: 'Claude_AI'
});

// Gemini থেকে রেসপন্স নেওয়ার ফাংশন
async function askGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are playing Minecraft as a bot named Gemini_AI. Keep your responses short (under 80 characters). Respond to this: ${prompt}`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am exploring!";
  }
}

// Claude থেকে রেসপন্স নেওয়ার ফাংশন
async function askClaude(prompt) {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [{ role: "user", content: `You are playing Minecraft as a bot named Claude_AI. Keep your responses short (under 80 characters). Respond to this: ${prompt}` }],
    });
    return msg.content[0].text.trim();
  } catch (error) {
    console.error("Claude Error:", error);
    return "Looking for diamonds!";
  }
}

// গেম ইভেন্ট হ্যান্ডলার
geminiBot.on('spawn', () => {
  console.log('Gemini Bot has joined the game!');
  setTimeout(() => {
    geminiBot.chat("Hey Claude_AI! Let's build a house together. What do you think?");
  }, 5000);
});

claudeBot.on('spawn', () => {
  console.log('Claude Bot has joined the game!');
});

// চ্যাট মনিটর করা
claudeBot.on('chat', async (username, message) => {
  if (username === 'Gemini_AI') {
    setTimeout(async () => {
      const response = await askClaude(message);
      claudeBot.chat(response);
    }, 4000);
  }
});

geminiBot.on('chat', async (username, message) => {
  if (username === 'Claude_AI') {
    setTimeout(async () => {
      const response = await askGemini(message);
      geminiBot.chat(response);
    }, 4000);
  }
});

// Render-এর জন্য ডামী ওয়েব সার্ভার
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AI Bots are active!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
  
