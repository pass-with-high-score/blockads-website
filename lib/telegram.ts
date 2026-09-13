export function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Send text message to a chat
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: TelegramInlineKeyboardMarkup,
  replyToMessageId?: number
) {
  if (!botToken) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        reply_markup: replyMarkup,
        reply_to_message_id: replyToMessageId,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("sendTelegramMessage error:", error);
    return null;
  }
}

/**
 * Send photo to a chat
 */
export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  caption?: string,
  replyMarkup?: TelegramInlineKeyboardMarkup,
  replyToMessageId?: number
) {
  if (!botToken) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
        reply_to_message_id: replyToMessageId,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("sendTelegramPhoto error:", error);
    return null;
  }
}

/**
 * Edit text of an existing message
 */
export async function editTelegramMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: TelegramInlineKeyboardMarkup
) {
  if (!botToken) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("editTelegramMessageText error:", error);
    return null;
  }
}

/**
 * Edit caption of an existing photo/media message
 */
export async function editTelegramMessageCaption(
  chatId: string | number,
  messageId: number,
  caption: string,
  replyMarkup?: TelegramInlineKeyboardMarkup
) {
  if (!botToken) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("editTelegramMessageCaption error:", error);
    return null;
  }
}

/**
 * Acknowledge a callback query (removes loading spinner from button)
 */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  if (!botToken) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("answerTelegramCallbackQuery error:", error);
    return null;
  }
}

/**
 * Generate action buttons for a report
 */
export function getReportActionKeyboard(reportId: string, url?: string, currentStatus: string = "pending"): TelegramInlineKeyboardMarkup {
  const shortId = reportId.slice(0, 8);
  const buttons: TelegramInlineKeyboardButton[][] = [];

  const row1: TelegramInlineKeyboardButton[] = [];
  if (currentStatus !== "resolved") {
    row1.push({ text: "✅ Resolve", callback_data: `res:${shortId}` });
  }
  if (currentStatus !== "ignored") {
    row1.push({ text: "🚫 Ignore", callback_data: `ign:${shortId}` });
  }
  if (currentStatus !== "pending") {
    row1.push({ text: "⏳ Re-open", callback_data: `pen:${shortId}` });
  }
  if (row1.length > 0) {
    buttons.push(row1);
  }

  const row2: TelegramInlineKeyboardButton[] = [
    { text: "ℹ️ Details", callback_data: `det:${shortId}` },
  ];
  if (url) {
    row2.push({ text: "🌐 Open Site", url: url.startsWith("http") ? url : `https://${url}` });
  }
  buttons.push(row2);

  return { inline_keyboard: buttons };
}

/**
 * Format category human readable label
 */
export function formatCategory(cat?: string): string {
  const map: Record<string, string> = {
    ads_not_blocked: "🚫 Ads Still Showing",
    site_broken: "⚠️ Broken Page / Anti-Adblock",
    popup_redirect: "🪟 Pop-ups / Redirects",
    malware_phishing: "🚨 Malware / Phishing",
    other: "💬 Other Issue",
  };
  return (cat && map[cat]) || cat || "Uncategorized";
}

/**
 * Format status with emoji badge
 */
export function formatStatusBadge(status?: string): string {
  switch (status) {
    case "resolved":
      return "✅ <b>Resolved</b>";
    case "ignored":
      return "🚫 <b>Ignored</b>";
    case "pending":
    default:
      return "⏳ <b>Pending</b>";
  }
}
