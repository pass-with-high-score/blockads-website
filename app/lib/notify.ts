export interface PreRegistrationPayload {
  email: string;
  platforms: string[];
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  totalCount?: number;
}

/**
 * Sends notification to Telegram and/or Discord when a user pre-registers.
 * If credentials are not configured, logs gracefully to console without failing.
 */
export async function sendPreRegistrationNotification(
  payload: PreRegistrationPayload
): Promise<void> {
  const tasks: Promise<void>[] = [];

  const platformIcons: Record<string, string> = {
    macos: "🍏 macOS",
    windows: "🪟 Windows",
  };

  const formattedPlatforms = payload.platforms
    .map((p) => platformIcons[p.toLowerCase()] || p)
    .join(", ");

  const now = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  // 1. Telegram Notification
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramBotToken && telegramChatId) {
    tasks.push(
      (async () => {
        try {
          const text = [
            `🎉 *New BlockAds Pre-Registration!*`,
            ``,
            `📧 *Email:* \`${payload.email}\``,
            `💻 *Platforms:* ${formattedPlatforms}`,
            payload.totalCount ? `📊 *Waitlist Position:* #${payload.totalCount}` : ``,
            payload.ipAddress ? `🌐 *IP:* \`${payload.ipAddress}\`` : ``,
            `🕒 *Time (VN):* ${now}`,
            payload.referrer ? `🔗 *Referrer:* ${payload.referrer}` : ``,
          ]
            .filter(Boolean)
            .join("\n");

          const response = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: telegramChatId,
                text,
                parse_mode: "Markdown",
                disable_web_page_preview: true,
              }),
            }
          );

          if (!response.ok) {
            const errBody = await response.text();
            console.error("Telegram webhook notification failed:", response.status, errBody);
          }
        } catch (err) {
          console.error("Error sending Telegram notification:", err);
        }
      })()
    );
  }

  // 2. Discord Webhook Notification
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhookUrl) {
    tasks.push(
      (async () => {
        try {
          const body = {
            username: "BlockAds Waitlist",
            avatar_url: "https://blockads.pwhs.app/icon.svg",
            embeds: [
              {
                title: "🎉 New BlockAds Pre-Registration",
                description: `A new user just joined the **macOS & Windows** waitlist!`,
                color: 0x00e676, // #00E676 neon green
                fields: [
                  { name: "Email", value: `\`${payload.email}\``, inline: true },
                  { name: "Platforms", value: formattedPlatforms, inline: true },
                  payload.totalCount
                    ? { name: "Position", value: `#${payload.totalCount}`, inline: true }
                    : null,
                  payload.ipAddress
                    ? { name: "IP Address", value: `\`${payload.ipAddress}\``, inline: true }
                    : null,
                  payload.referrer
                    ? { name: "Referrer", value: payload.referrer, inline: true }
                    : null,
                ].filter(Boolean),
                footer: { text: `Time: ${now} (GMT+7)` },
                timestamp: new Date().toISOString(),
              },
            ],
          };

          const response = await fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errBody = await response.text();
            console.error("Discord webhook notification failed:", response.status, errBody);
          }
        } catch (err) {
          console.error("Error sending Discord notification:", err);
        }
      })()
    );
  }

  if (tasks.length === 0) {
    console.log(
      `[Pre-Registration] ${payload.email} registered for [${formattedPlatforms}]. (Configure TELEGRAM_BOT_TOKEN+TELEGRAM_CHAT_ID or DISCORD_WEBHOOK_URL to receive live alerts)`
    );
    return;
  }

  await Promise.allSettled(tasks);
}
