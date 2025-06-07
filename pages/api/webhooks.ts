import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';

interface ApiResponse<T = unknown> {
  data?: T;
  meta?: {
    timestamp: string;
    version: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string[];
    instance: string;
    timestamp: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  await dbConnect();

  const { query } = req;
  const service = query.service as string;
  const action = query.action as string;

  try {
    switch (service) {
      case 'telegram':
        return handleTelegram(req, res, action);
      case 'webhook':
        return handleGenericWebhook(req, res);
      case 'notification':
        return handleNotification(req, res);
      default:
        return res.status(400).json({
          error: {
            code: 'INVALID_SERVICE',
            message: `Invalid webhook service: ${service}`,
            instance: '/api/webhooks',
            timestamp: new Date().toISOString(),
          }
        });
    }
  } catch (error) {
    console.error('Webhooks API Error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        instance: '/api/webhooks',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

// Telegram Integration
async function handleTelegram(req: NextApiRequest, res: NextApiResponse<ApiResponse>, action?: string) {
  switch (req.method) {
    case 'POST':
      if (action === 'send') {
        return await sendTelegramMessage(req, res);
      } else {
        return await handleTelegramWebhook(req, res);
      }
    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed for telegram`,
          instance: '/api/webhooks?service=telegram',
          timestamp: new Date().toISOString(),
        }
      });
  }
}

async function sendTelegramMessage(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { message, chatId, parseMode = 'HTML' } = req.body;

  if (!message) {
    return res.status(400).json({
      error: {
        code: 'MISSING_MESSAGE',
        message: 'Message content is required',
        instance: '/api/webhooks?service=telegram&action=send',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const defaultChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotToken) {
    return res.status(500).json({
      error: {
        code: 'TELEGRAM_NOT_CONFIGURED',
        message: 'Telegram bot token not configured',
        instance: '/api/webhooks?service=telegram&action=send',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const targetChatId = chatId || defaultChatId;

  if (!targetChatId) {
    return res.status(400).json({
      error: {
        code: 'MISSING_CHAT_ID',
        message: 'Chat ID is required',
        instance: '/api/webhooks?service=telegram&action=send',
        timestamp: new Date().toISOString(),
      }
    });
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    );

    const responseData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return res.status(400).json({
        error: {
          code: 'TELEGRAM_API_ERROR',
          message: responseData.description || 'Failed to send Telegram message',
          details: [responseData],
          instance: '/api/webhooks?service=telegram&action=send',
          timestamp: new Date().toISOString(),
        }
      });
    }

    return res.status(200).json({
      data: {
        success: true,
        messageId: responseData.result.message_id,
        chatId: targetChatId,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      }
    });
  } catch {
    return res.status(500).json({
      error: {
        code: 'TELEGRAM_REQUEST_FAILED',
        message: 'Failed to send message to Telegram',
        instance: '/api/webhooks?service=telegram&action=send',
        timestamp: new Date().toISOString(),
      }
    });
  }
}

async function handleTelegramWebhook(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const update = req.body;

  // Log incoming webhook for debugging
  console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

  // Basic webhook validation
  if (!update.message && !update.callback_query) {
    return res.status(400).json({
      error: {
        code: 'INVALID_TELEGRAM_UPDATE',
        message: 'Invalid Telegram update format',
        instance: '/api/webhooks?service=telegram',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Process the update (simplified example)
  let responseMessage = '';
  let chatId = '';

  if (update.message) {
    chatId = update.message.chat.id;
    const messageText = update.message.text || '';
    
    // Simple command processing
    if (messageText.startsWith('/start')) {
      responseMessage = 'Willkommen! Bot ist bereit.';
    } else if (messageText.startsWith('/status')) {
      responseMessage = 'System läuft normal.';
    } else if (messageText.startsWith('/help')) {
      responseMessage = 'Verfügbare Befehle:\n/start - Bot starten\n/status - Systemstatus\n/help - Diese Hilfe';
    } else {
      responseMessage = `Nachricht erhalten: ${messageText}`;
    }
  } else if (update.callback_query) {
    chatId = update.callback_query.message.chat.id;
    responseMessage = `Button gedrückt: ${update.callback_query.data}`;
  }

  // Send response back to Telegram (optional)
  if (responseMessage && chatId) {
    try {
      await sendTelegramMessage(
        { body: { message: responseMessage, chatId } } as NextApiRequest,
        res
      );
    } catch (error) {
      console.error('Failed to send Telegram response:', error);
    }
  }

  return res.status(200).json({
    data: {
      processed: true,
      updateType: update.message ? 'message' : 'callback_query',
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Generic Webhook Handler
async function handleGenericWebhook(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for webhooks',
        instance: '/api/webhooks?service=webhook',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const webhookData = req.body;
  const headers = req.headers;

  // Log webhook for debugging
  console.log('Generic webhook received:', {
    headers: {
      'user-agent': headers['user-agent'],
      'content-type': headers['content-type'],
      'x-webhook-source': headers['x-webhook-source'],
    },
    body: webhookData,
  });

  // Process webhook based on source or content
  let processResult = '';

  if (headers['x-webhook-source'] === 'github') {
    processResult = 'GitHub webhook processed';
  } else if (headers['x-webhook-source'] === 'stripe') {
    processResult = 'Stripe webhook processed';
  } else {
    processResult = 'Generic webhook processed';
  }

  return res.status(200).json({
    data: {
      processed: true,
      result: processResult,
      timestamp: new Date().toISOString(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}

// Notification System
async function handleNotification(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method allowed for notifications',
        instance: '/api/webhooks?service=notification',
        timestamp: new Date().toISOString(),
      }
    });
  }

  const { type, title, message, recipients, channel = 'telegram' } = req.body;

  if (!type || !message) {
    return res.status(400).json({
      error: {
        code: 'MISSING_NOTIFICATION_DATA',
        message: 'Type and message are required',
        instance: '/api/webhooks?service=notification',
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Format notification message
  let formattedMessage = '';
  
  if (title) {
    formattedMessage += `<b>${title}</b>\n\n`;
  }
  
  formattedMessage += message;

  // Add notification type styling
  const typeEmojis = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    reminder: '🔔',
  };

  const emoji = typeEmojis[type as keyof typeof typeEmojis] || '📢';
  formattedMessage = `${emoji} ${formattedMessage}`;

  // Send notification based on channel
  let notificationResult;

  switch (channel) {
    case 'telegram':
      try {
        await sendTelegramMessage(
          { body: { message: formattedMessage } } as NextApiRequest,
          res
        );
        notificationResult = { channel: 'telegram', success: true };
      } catch (error) {
        notificationResult = { channel: 'telegram', success: false, error: error instanceof Error ? error.message : String(error) };
      }
      break;

    case 'email':
      // Placeholder for email notifications
      notificationResult = { channel: 'email', success: false, error: 'Email not implemented' };
      break;

    case 'push':
      // Placeholder for push notifications
      notificationResult = { channel: 'push', success: false, error: 'Push notifications not implemented' };
      break;

    default:
      return res.status(400).json({
        error: {
          code: 'INVALID_NOTIFICATION_CHANNEL',
          message: `Invalid notification channel: ${channel}`,
          instance: '/api/webhooks?service=notification',
          timestamp: new Date().toISOString(),
        }
      });
  }

  return res.status(200).json({
    data: {
      type,
      channel,
      result: notificationResult,
      recipients: recipients || ['default'],
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    }
  });
}