# @iFace_kg_bot
Telegram bot for iFace.kg AI Bot/ (корень)
 ├─ index.js
 import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Set webhook
app.get('/', (req, res) => {
  res.send('iFace.kg Bot is running');
});

app.post('/api/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendMessage(chatId, '👋 Добро пожаловать в iFace.kg!\n\nВыберите действие:', [
      [{ text: '✨ Сделать заказ', callback_data: 'order' }],
      [{ text: '📩 Написать в Instagram', url: 'https://www.instagram.com/iface.kg' }]
    ]);
  }

  res.sendStatus(200);
});

async function sendMessage(chatId, text, keyboard = null) {
  const payload = {
    chat_id: chatId,
    text,
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined
  };

  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
  } catch (e) {
    console.error('Error sending message:', e.response?.data || e);
  }
}

export default app;
 ├─ package.json
 {
  "name": "iface-kg-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "dependencies": {
    "axios": "^1.6.7",
    "express": "^4.19.2"
  }
}
 ├─ vercel.json
 {
  "version": 2,
  "routes": [
    {
      "src": "/api/webhook",
      "dest": "/index.js",
      "methods": ["POST"]
    },
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
