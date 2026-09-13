import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  escapeHtml,
  sendTelegramMessage,
  sendTelegramPhoto,
  editTelegramMessageCaption,
  editTelegramMessageText,
  answerTelegramCallbackQuery,
  getReportActionKeyboard,
  formatCategory,
  formatStatusBadge,
} from "@/lib/telegram";

const botToken = process.env.TELEGRAM_BOT_TOKEN;

// GET: Webhook status and setup helper
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  // 1. Setup Webhook helper: ?setup=true&url=https://yourdomain.com/api/telegram
  const targetUrl = searchParams.get("url");
  if (searchParams.get("setup") === "true" && targetUrl) {
    try {
      const webhookRes = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetUrl)}`
      );
      const data = await webhookRes.json();
      return NextResponse.json({ success: true, result: data });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  }

  // 2. Inspect current Webhook info
  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoRes.json();
    return NextResponse.json({
      service: "BlockAds Telegram Bot Webhook API",
      status: "active",
      webhook_info: infoData,
      usage: "Send POST requests with Telegram Updates or set webhook via ?setup=true&url=<YOUR_URL>",
    });
  } catch {
    return NextResponse.json({
      service: "BlockAds Telegram Bot Webhook API",
      status: "active",
    });
  }
}

// POST: Handle Incoming Telegram Updates (Messages & Inline Buttons)
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle Callback Query (When an inline button is clicked)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Messages (Commands)
    if (update.message && update.message.text) {
      await handleMessage(update.message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook handler error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

// Authorization check: Only authorized admin (e.g. 1578783338 or TELEGRAM_REPORT_CHAT_ID) can access
function isAuthorizedUser(userId?: number | string, chatId?: number | string): boolean {
  const allowed = new Set(
    [
      process.env.TELEGRAM_REPORT_CHAT_ID,
      "1578783338",
      ...(process.env.TELEGRAM_ADMIN_IDS ? process.env.TELEGRAM_ADMIN_IDS.split(",") : []),
    ]
      .filter(Boolean)
      .map((id) => String(id).trim())
  );

  return Boolean(
    (userId && allowed.has(String(userId))) ||
    (chatId && allowed.has(String(chatId)))
  );
}

// --- Handler: Message Commands ---
async function handleMessage(message: {
  chat: { id: number };
  message_id: number;
  from?: { id: number; username?: string; first_name?: string };
  text: string;
}) {
  const chatId = message.chat.id;
  const senderId = message.from?.id;
  const rawText = message.text.trim();

  // Access control: Only user 1578783338 / admin chat can access
  if (!isAuthorizedUser(senderId, chatId)) {
    await sendTelegramMessage(
      chatId,
      `⛔️ <b>Access Denied</b>\n━━━━━━━━━━━━━━━━━━━━\nYou do not have permission to use the BlockAds Admin Bot.\n🆔 Your ID: <code>${senderId || chatId}</code>`,
      undefined,
      message.message_id
    );
    return;
  }

  // Parse command & arguments (e.g. "/reports pending" or "/resolve@MyBot 1a2b3c4d")
  const parts = rawText.split(/\s+/);
  const fullCommand = parts[0];
  const command = fullCommand.split("@")[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "/start":
    case "/help": {
      const helpText = [
        `🛡 <b>BlockAds Report Bot - Commands</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📋 <b>Report Management:</b>`,
        `• <code>/reports [status]</code> : List recent reports (<i>pending, resolved, ignored, all</i>). Default: <i>pending</i>`,
        `• <code>/stats</code> : Overview statistics & top reported domains`,
        `• <code>/search &lt;keyword&gt;</code> : Search reports by domain or description`,
        `• <code>/get &lt;id&gt;</code> : View detailed report (with screenshot if available)`,
        ``,
        `⚡️ <b>Status Updates:</b>`,
        `• <code>/resolve &lt;id&gt;</code> : Mark report as resolved / rule added`,
        `• <code>/ignore &lt;id&gt;</code> : Mark report as ignored / invalid`,
        `• <code>/pending &lt;id&gt;</code> : Reset status to pending`,
        ``,
        `📝 <b>Quick Report:</b>`,
        `• <code>/report &lt;url&gt; [description]</code> : Create a new report directly from Telegram`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `💡 <i>Tip: You can use the first 8 characters of an ID, e.g. <code>/resolve a1b2c3d4</code></i>`,
      ].join("\n");

      await sendTelegramMessage(chatId, helpText, undefined, message.message_id);
      break;
    }

    case "/reports":
    case "/list": {
      const statusFilter = (args[0] || "pending").toLowerCase();
      let query;

      if (["pending", "resolved", "ignored"].includes(statusFilter)) {
        query = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          WHERE status = ${statusFilter}
          ORDER BY created_at DESC
          LIMIT 8
        `;
      } else {
        query = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          ORDER BY created_at DESC
          LIMIT 8
        `;
      }

      if (query.length === 0) {
        await sendTelegramMessage(
          chatId,
          `📭 No reports found with status: <b>${escapeHtml(statusFilter)}</b>.`,
          undefined,
          message.message_id
        );
        return;
      }

      const rowsText = query.map((r, i) => {
        const shortId = r.id.slice(0, 8);
        const domain = r.url.replace(/^https?:\/\//i, "").split("/")[0];
        const statusBadge = formatStatusBadge(r.status);
        const cat = formatCategory(r.category);
        const time = new Date(r.created_at).toLocaleDateString("en-US");

        return [
          `<b>${i + 1}.</b> <code>#${shortId}</code> | ${statusBadge}`,
          `🌐 <a href="${escapeHtml(r.url)}">${escapeHtml(domain)}</a>`,
          `📌 ${cat} | 🕒 ${time}`,
          `👉 Details: <code>/get ${shortId}</code>`,
        ].join("\n");
      }).join("\n\n");

      const responseText = [
        `📋 <b>REPORT LIST (${escapeHtml(statusFilter.toUpperCase())})</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        rowsText,
        `━━━━━━━━━━━━━━━━━━━━`,
        `<i>Showing latest ${query.length} reports.</i>`,
      ].join("\n");

      await sendTelegramMessage(chatId, responseText, undefined, message.message_id);
      break;
    }

    case "/stats": {
      const [totalRow] = await sql`SELECT count(*)::int as count FROM website_reports`;
      const statusRows = await sql`
        SELECT status, count(*)::int as count
        FROM website_reports
        GROUP BY status
      `;
      const topDomains = await sql`
        SELECT 
          regexp_replace(regexp_replace(url, '^https?://', ''), '/.*$', '') as domain,
          count(*)::int as count
        FROM website_reports
        GROUP BY domain
        ORDER BY count DESC
        LIMIT 5
      `;

      const statsMap: Record<string, number> = { pending: 0, resolved: 0, ignored: 0 };
      statusRows.forEach((r) => {
        statsMap[r.status] = r.count;
      });

      const topDomainText = topDomains.length > 0
        ? topDomains.map((d, i) => `${i + 1}. <b>${escapeHtml(d.domain)}</b>: ${d.count} reports`).join("\n")
        : "<i>No data available</i>";

      const statsText = [
        `📊 <b>BLOCKADS REPORT STATISTICS</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📦 <b>Total Reports:</b> ${totalRow?.count || 0}`,
        `⏳ <b>Pending:</b> ${statsMap.pending || 0}`,
        `✅ <b>Resolved:</b> ${statsMap.resolved || 0}`,
        `🚫 <b>Ignored:</b> ${statsMap.ignored || 0}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `🔥 <b>Top 5 Most Reported Domains:</b>`,
        topDomainText,
      ].join("\n");

      await sendTelegramMessage(chatId, statsText, undefined, message.message_id);
      break;
    }

    case "/search":
    case "/find": {
      const queryParam = args.join(" ").trim();
      if (!queryParam) {
        await sendTelegramMessage(
          chatId,
          "⚠️ Please enter a keyword to search.\nExample: <code>/search example.com</code> or <code>/search popup</code>",
          undefined,
          message.message_id
        );
        return;
      }

      const pattern = `%${queryParam}%`;
      const results = await sql`
        SELECT id, url, category, status, created_at, description
        FROM website_reports
        WHERE url ILIKE ${pattern} OR description ILIKE ${pattern}
        ORDER BY created_at DESC
        LIMIT 5
      `;

      if (results.length === 0) {
        await sendTelegramMessage(
          chatId,
          `🔍 No reports found matching: <i>"${escapeHtml(queryParam)}"</i>`,
          undefined,
          message.message_id
        );
        return;
      }

      const itemsText = results.map((r, i) => {
        const shortId = r.id.slice(0, 8);
        const domain = r.url.replace(/^https?:\/\//i, "").split("/")[0];
        const badge = formatStatusBadge(r.status);
        return [
          `<b>${i + 1}.</b> <code>#${shortId}</code> | ${badge}`,
          `🌐 <a href="${escapeHtml(r.url)}">${escapeHtml(domain)}</a>`,
          `👉 Details: <code>/get ${shortId}</code>`,
        ].join("\n");
      }).join("\n\n");

      const searchText = [
        `🔍 <b>SEARCH RESULTS FOR:</b> "${escapeHtml(queryParam)}"`,
        `━━━━━━━━━━━━━━━━━━━━`,
        itemsText,
      ].join("\n");

      await sendTelegramMessage(chatId, searchText, undefined, message.message_id);
      break;
    }

    case "/get":
    case "/view": {
      const idInput = args[0]?.trim();
      if (!idInput) {
        await sendTelegramMessage(
          chatId,
          "⚠️ Please provide a report ID.\nExample: <code>/get a1b2c3d4</code>",
          undefined,
          message.message_id
        );
        return;
      }

      const cleanId = idInput.replace(/^#/, "");
      const reports = await sql`
        SELECT *
        FROM website_reports
        WHERE id::text ILIKE ${cleanId + "%"}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (!reports || reports.length === 0) {
        await sendTelegramMessage(
          chatId,
          `❌ Report not found with ID: <code>${escapeHtml(cleanId)}</code>`,
          undefined,
          message.message_id
        );
        return;
      }

      const r = reports[0];
      const shortId = r.id.slice(0, 8);
      const detailHtml = [
        `🛡 <b>REPORT DETAILS #${shortId}</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `🌐 <b>Website:</b> <a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a>`,
        `📊 <b>Status:</b> ${formatStatusBadge(r.status)}`,
        `📌 <b>Issue:</b> ${escapeHtml(formatCategory(r.category))}`,
        `⚙️ <b>Routing Mode:</b> ${escapeHtml(r.routing_mode || "N/A")}`,
        `📝 <b>Description:</b>\n${r.description ? escapeHtml(r.description) : "<i>None provided</i>"}`,
        `👤 <b>Contact:</b> ${r.contact ? escapeHtml(r.contact) : "<i>Anonymous</i>"}`,
        `🕒 <b>Time:</b> ${new Date(r.created_at).toLocaleString("en-US")}`,
        `📱 <b>Device:</b> <code>${escapeHtml((r.user_agent || "N/A").slice(0, 100))}</code>`,
        `📍 <b>IP:</b> <code>${escapeHtml(r.ip || "N/A")}</code>`,
      ].join("\n");

      const keyboard = getReportActionKeyboard(r.id, r.url, r.status);

      if (r.screenshot_url) {
        await sendTelegramPhoto(chatId, r.screenshot_url, detailHtml, keyboard, message.message_id);
      } else {
        await sendTelegramMessage(chatId, detailHtml, keyboard, message.message_id);
      }
      break;
    }

    case "/resolve":
    case "/done":
    case "/ignore":
    case "/pending":
    case "/reopen": {
      const idInput = args[0]?.trim();
      if (!idInput) {
        await sendTelegramMessage(
          chatId,
          `⚠️ Please provide a report ID.\nExample: <code>${command} a1b2c3d4</code>`,
          undefined,
          message.message_id
        );
        return;
      }

      let newStatus = "pending";
      if (command === "/resolve" || command === "/done") newStatus = "resolved";
      else if (command === "/ignore") newStatus = "ignored";

      const cleanId = idInput.replace(/^#/, "");
      const updated = await sql`
        UPDATE website_reports
        SET status = ${newStatus}
        WHERE id::text ILIKE ${cleanId + "%"}
        RETURNING id, url, status
      `;

      if (!updated || updated.length === 0) {
        await sendTelegramMessage(
          chatId,
          `❌ Report not found with ID: <code>${escapeHtml(cleanId)}</code>`,
          undefined,
          message.message_id
        );
        return;
      }

      const r = updated[0];
      const shortId = r.id.slice(0, 8);
      const keyboard = getReportActionKeyboard(r.id, r.url, r.status);

      await sendTelegramMessage(
        chatId,
        `✅ Successfully updated report <code>#${shortId}</code> to ${formatStatusBadge(newStatus)}!\n🌐 <b>Website:</b> <a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a>`,
        keyboard,
        message.message_id
      );
      break;
    }

    case "/report": {
      const inputUrl = args[0];
      if (!inputUrl) {
        await sendTelegramMessage(
          chatId,
          "⚠️ Usage: <code>/report &lt;website_url&gt; [issue description]</code>\nExample: <code>/report https://example.com popup ads appearing</code>",
          undefined,
          message.message_id
        );
        return;
      }

      let normalizedUrl = inputUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const desc = args.slice(1).join(" ").trim() || null;
      const sender = message.from?.username ? `@${message.from.username}` : message.from?.first_name || "Telegram User";

      try {
        const rows = await sql`
          INSERT INTO website_reports (
            url,
            category,
            routing_mode,
            description,
            contact,
            ip,
            user_agent,
            status
          ) VALUES (
            ${normalizedUrl},
            'other',
            'Telegram Bot',
            ${desc},
            ${sender},
            'Telegram',
            'Telegram Bot Command',
            'pending'
          )
          RETURNING id
        `;

        const newId = rows[0]?.id;
        const shortId = newId ? newId.slice(0, 8) : "unknown";
        const keyboard = newId ? getReportActionKeyboard(newId, normalizedUrl, "pending") : undefined;

        await sendTelegramMessage(
          chatId,
          `🎉 <b>REPORT CREATED SUCCESSFULLY!</b> <code>#${shortId}</code>\n━━━━━━━━━━━━━━━━━━━━\n🌐 <b>Website:</b> <a href="${escapeHtml(normalizedUrl)}">${escapeHtml(normalizedUrl)}</a>\n📝 <b>Description:</b> ${desc ? escapeHtml(desc) : "<i>None</i>"}\n👤 <b>Reporter:</b> ${escapeHtml(sender)}`,
          keyboard,
          message.message_id
        );
      } catch (insertErr) {
        console.error("Error creating report via bot command:", insertErr);
        await sendTelegramMessage(chatId, "❌ An error occurred while saving the report to the database.", undefined, message.message_id);
      }
      break;
    }

    default:
      // Unknown command: silently ignore
      break;
  }
}

// --- Handler: Inline Callback Query ---
async function handleCallbackQuery(cb: {
  id: string;
  data?: string;
  from: { id: number; first_name?: string; username?: string };
  message?: {
    message_id: number;
    chat: { id: number };
    caption?: string;
    text?: string;
  };
}) {
  const senderId = cb.from?.id;
  const chatId = cb.message?.chat.id;

  // Access control: Only user 1578783338 / admin chat can perform inline actions
  if (!isAuthorizedUser(senderId, chatId)) {
    await answerTelegramCallbackQuery(cb.id, "⛔️ You do not have permission to perform this action.", true);
    return;
  }

  const data = cb.data;
  if (!data) {
    await answerTelegramCallbackQuery(cb.id);
    return;
  }

  const [action, shortId] = data.split(":");
  if (!action || !shortId) {
    await answerTelegramCallbackQuery(cb.id);
    return;
  }

  // Details button clicked
  if (action === "det") {
    const reports = await sql`
      SELECT *
      FROM website_reports
      WHERE id::text ILIKE ${shortId + "%"}
      LIMIT 1
    `;

    if (!reports || reports.length === 0) {
      await answerTelegramCallbackQuery(cb.id, "❌ Report not found or has been deleted.", true);
      return;
    }

    const r = reports[0];
    const userText = cb.from.username ? `@${cb.from.username}` : cb.from.first_name || "Admin";
    const detail = [
      `🛡 <b>REPORT DETAILS #${shortId}</b>`,
      `🌐 <b>Website:</b> ${r.url}`,
      `📊 <b>Status:</b> ${r.status}`,
      `📌 <b>Issue:</b> ${formatCategory(r.category)}`,
      `⚙️ <b>Routing:</b> ${r.routing_mode || "N/A"}`,
      `📝 <b>Description:</b> ${r.description || "None"}`,
      `👤 <b>Viewer:</b> ${userText}`,
    ].join("\n");

    if (cb.message?.chat.id) {
      const kb = getReportActionKeyboard(r.id, r.url, r.status);
      await sendTelegramMessage(cb.message.chat.id, detail, kb, cb.message.message_id);
    }
    await answerTelegramCallbackQuery(cb.id, `Opened details for #${shortId}`);
    return;
  }

  // Status transition buttons
  let newStatus = "pending";
  let statusText = "Pending";
  if (action === "res") {
    newStatus = "resolved";
    statusText = "Resolved ✅";
  } else if (action === "ign") {
    newStatus = "ignored";
    statusText = "Ignored 🚫";
  } else if (action === "pen") {
    newStatus = "pending";
    statusText = "Pending ⏳";
  }

  const updated = await sql`
    UPDATE website_reports
    SET status = ${newStatus}
    WHERE id::text ILIKE ${shortId + "%"}
    RETURNING id, url, status
  `;

  if (!updated || updated.length === 0) {
    await answerTelegramCallbackQuery(cb.id, "❌ Report not found.", true);
    return;
  }

  const r = updated[0];
  const adminName = cb.from.username ? `@${cb.from.username}` : cb.from.first_name || "Admin";

  // Answer callback popup
  await answerTelegramCallbackQuery(cb.id, `Updated #${shortId} to ${statusText}!`);

  // Update existing message keyboard & append operator note
  if (cb.message) {
    const updatedKeyboard = getReportActionKeyboard(r.id, r.url, newStatus);
    const appendNote = `\n\n📌 <b>Updated:</b> ${formatStatusBadge(newStatus)} by ${escapeHtml(adminName)}`;

    if (cb.message.caption) {
      // It's a photo message
      const newCaption = (cb.message.caption + appendNote).slice(0, 1024);
      await editTelegramMessageCaption(cb.message.chat.id, cb.message.message_id, newCaption, updatedKeyboard);
    } else if (cb.message.text) {
      // It's a text message
      const newText = (cb.message.text + appendNote).slice(0, 4096);
      await editTelegramMessageText(cb.message.chat.id, cb.message.message_id, newText, updatedKeyboard);
    }
  }
}
