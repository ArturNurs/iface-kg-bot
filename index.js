import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot{7642720725:AAGfz9VgXqKsaJ6RbDdXuy5B0SWEvtqu8BY}`;

// Set webhook
app.get('/', (req, res) => {
  res.send('iFace_kg_bot is running');
});

app.post('/api/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendMessage(chatId, '👋 Добро пожаловать в iFace.kg AI Bot!\n\nВыберите действие:', [
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
