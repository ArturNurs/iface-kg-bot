import express from 'express';
import axios from 'axios';

const app = express();
// Ограничение размера тела запроса для безопасности
app.use(express.json({ limit: '100kb' }));

// Требуется задать BOT_TOKEN в окружении
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error('BOT_TOKEN не установлен. Установите переменную окружения BOT_TOKEN.');
  process.exit(1);
}
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// (Опционально) секретный токен для проверки вебхука
// Если используете setWebhook с параметром secret_token, задайте тот же WEBHOOK_SECRET в окружении
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;

app.get('/', (req, res) => {
  res.send('iFace_kg_bot is running');
});

app.post('/api/webhook', async (req, res) => {
  // Проверка секретного заголовка (если задано)
  if (WEBHOOK_SECRET) {
    const receivedSecret = req.get('x-telegram-bot-api-secret-token');
    if (!receivedSecret || receivedSecret !== WEBHOOK_SECRET) {
      console.warn('Invalid webhook secret token');
      return res.sendStatus(403);
    }
  }

  const update = req.body;
  if (!update) return res.sendStatus(200);

  try {
    // Обработка обычных сообщений
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text || '';

      if (text === '/start') {
        // передаём inline_keyboard как массив рядов кнопок
        const keyboard = [
          [{ text: '✨ Сделать заказ', callback_data: 'order' }],
          [{ text: '📩 Написать в Instagram', url: 'https://www.instagram.com/iface.kg' }]
        ];
        await sendMessage(chatId, '👋 Добро пожаловать в iFace.kg AI Bot!\n\nВыберите действие:', keyboard);
      }
    }

    // Обработка нажатий inline-кнопок
    if (update.callback_query) {
      const cq = update.callback_query;
      const callbackId = cq.id;
      const data = cq.data;
      const chatId = cq.message?.chat?.id;

      // Нужно отвечать на callback_query, чтобы в клиенте пропал спиннер
      await answerCallbackQuery(callbackId);

      if (data === 'order' && chatId) {
        await sendMessage(chatId, 'Спасибо! Пожалуйста, опишите ваш заказ или оставьте контакт.');
      }
    }
  } catch (err) {
    console.error('Ошибка обработки апдейта:', err?.response?.data || err?.message || err);
  }

  // Всегда быстро отвечаем Telegram
  res.sendStatus(200);
});

async function sendMessage(chatId, text, keyboard = null) {
  const payload = {
    chat_id: chatId,
    text
  };

  if (keyboard) {
    payload.reply_markup = { inline_keyboard: keyboard };
  }

  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
  } catch (e) {
    console.error('Error sending message:', e?.response?.data || e?.message || e);
  }
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  try {
    await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text
    });
  } catch (e) {
    console.error('Error answering callback query:', e?.response?.data || e?.message || e);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;