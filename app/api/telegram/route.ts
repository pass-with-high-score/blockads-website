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
      `⛔️ <b>Truy cập bị từ chối</b>\n━━━━━━━━━━━━━━━━━━━━\nBạn không có quyền sử dụng bot quản trị BlockAds.\n🆔 ID của bạn: <code>${senderId || chatId}</code>`,
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
        `📋 <b>Quản lý báo cáo:</b>`,
        `• <code>/reports [status]</code> : Danh sách report mới nhất (<i>pending, resolved, ignored, all</i>). Mặc định: <i>pending</i>`,
        `• <code>/stats</code> : Thống kê tổng quan và top domain bị báo cáo`,
        `• <code>/search &lt;từ khóa&gt;</code> : Tìm báo cáo theo domain hoặc nội dung`,
        `• <code>/get &lt;id&gt;</code> : Xem chi tiết report (kèm ảnh chụp màn hình)`,
        ``,
        `⚡️ <b>Thay đổi trạng thái:</b>`,
        `• <code>/resolve &lt;id&gt;</code> : Đánh dấu đã sửa / bổ sung rule`,
        `• <code>/ignore &lt;id&gt;</code> : Đánh dấu bỏ qua / không phải lỗi adblock`,
        `• <code>/pending &lt;id&gt;</code> : Đặt lại trạng thái chờ xử lý`,
        ``,
        `📝 <b>Gửi báo cáo nhanh:</b>`,
        `• <code>/report &lt;url&gt; [mô tả]</code> : Tạo báo cáo trực tiếp từ Telegram`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `💡 <i>Tip: Bạn có thể dùng 8 ký tự đầu của ID, ví dụ: <code>/resolve a1b2c3d4</code></i>`,
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
          `📭 Không tìm thấy báo cáo nào ở trạng thái: <b>${escapeHtml(statusFilter)}</b>.`,
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
        const time = new Date(r.created_at).toLocaleDateString("vi-VN");

        return [
          `<b>${i + 1}.</b> <code>#${shortId}</code> | ${statusBadge}`,
          `🌐 <a href="${escapeHtml(r.url)}">${escapeHtml(domain)}</a>`,
          `📌 ${cat} | 🕒 ${time}`,
          `👉 Chi tiết: <code>/get ${shortId}</code>`,
        ].join("\n");
      }).join("\n\n");

      const responseText = [
        `📋 <b>DANH SÁCH BÁO CÁO (${escapeHtml(statusFilter.toUpperCase())})</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        rowsText,
        `━━━━━━━━━━━━━━━━━━━━`,
        `<i>Hiển thị ${query.length} báo cáo gần nhất.</i>`,
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
        : "<i>Chưa có dữ liệu</i>";

      const statsText = [
        `📊 <b>THỐNG KÊ BÁO CÁO BLOCKADS</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📦 <b>Tổng cộng:</b> ${totalRow?.count || 0} báo cáo`,
        `⏳ <b>Đang chờ (Pending):</b> ${statsMap.pending || 0}`,
        `✅ <b>Đã xử lý (Resolved):</b> ${statsMap.resolved || 0}`,
        `🚫 <b>Bỏ qua (Ignored):</b> ${statsMap.ignored || 0}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `🔥 <b>Top 5 tên miền bị báo cáo nhiều nhất:</b>`,
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
          "⚠️ Vui lòng nhập từ khóa tìm kiếm.\nVí dụ: <code>/search kenh14</code> hoặc <code>/search popup</code>",
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
          `🔍 Không tìm thấy kết quả nào cho: <i>"${escapeHtml(queryParam)}"</i>`,
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
          `👉 Chi tiết: <code>/get ${shortId}</code>`,
        ].join("\n");
      }).join("\n\n");

      const searchText = [
        `🔍 <b>KẾT QUẢ TÌM KIẾM CHO:</b> "${escapeHtml(queryParam)}"`,
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
          "⚠️ Vui lòng nhập ID báo cáo.\nVí dụ: <code>/get a1b2c3d4</code>",
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
          `❌ Không tìm thấy báo cáo với ID: <code>${escapeHtml(cleanId)}</code>`,
          undefined,
          message.message_id
        );
        return;
      }

      const r = reports[0];
      const shortId = r.id.slice(0, 8);
      const detailHtml = [
        `🛡 <b>CHI TIẾT BÁO CÁO #${shortId}</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `🌐 <b>Website:</b> <a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a>`,
        `📊 <b>Trạng thái:</b> ${formatStatusBadge(r.status)}`,
        `📌 <b>Vấn đề:</b> ${escapeHtml(formatCategory(r.category))}`,
        `⚙️ <b>Routing Mode:</b> ${escapeHtml(r.routing_mode || "N/A")}`,
        `📝 <b>Mô tả:</b>\n${r.description ? escapeHtml(r.description) : "<i>Không có</i>"}`,
        `👤 <b>Liên hệ:</b> ${r.contact ? escapeHtml(r.contact) : "<i>Ẩn danh</i>"}`,
        `🕒 <b>Thời gian:</b> ${new Date(r.created_at).toLocaleString("vi-VN")}`,
        `📱 <b>Thiết bị:</b> <code>${escapeHtml((r.user_agent || "N/A").slice(0, 100))}</code>`,
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
          `⚠️ Vui lòng nhập ID báo cáo.\nVí dụ: <code>${command} a1b2c3d4</code>`,
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
          `❌ Không tìm thấy báo cáo với ID: <code>${escapeHtml(cleanId)}</code>`,
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
        `✅ Đã cập nhật báo cáo <code>#${shortId}</code> sang trạng thái ${formatStatusBadge(newStatus)}!\n🌐 <b>Website:</b> <a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a>`,
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
          "⚠️ Cú pháp: <code>/report &lt;website_url&gt; [mô tả vấn đề]</code>\nVí dụ: <code>/report https://example.com có quảng cáo pop-up</code>",
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
          `🎉 <b>ĐÃ TẠO BÁO CÁO THÀNH CÔNG!</b> <code>#${shortId}</code>\n━━━━━━━━━━━━━━━━━━━━\n🌐 <b>Website:</b> <a href="${escapeHtml(normalizedUrl)}">${escapeHtml(normalizedUrl)}</a>\n📝 <b>Mô tả:</b> ${desc ? escapeHtml(desc) : "<i>Không có</i>"}\n👤 <b>Người báo cáo:</b> ${escapeHtml(sender)}`,
          keyboard,
          message.message_id
        );
      } catch (insertErr) {
        console.error("Error creating report via bot command:", insertErr);
        await sendTelegramMessage(chatId, "❌ Có lỗi xảy ra khi lưu báo cáo vào cơ sở dữ liệu.", undefined, message.message_id);
      }
      break;
    }

    default:
      // Unknown command: silently ignore or show help if sent in private chat
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
    await answerTelegramCallbackQuery(cb.id, "⛔️ Bạn không có quyền thực hiện thao tác này.", true);
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
      await answerTelegramCallbackQuery(cb.id, "❌ Báo cáo không tồn tại hoặc đã bị xóa.", true);
      return;
    }

    const r = reports[0];
    const userText = cb.from.username ? `@${cb.from.username}` : cb.from.first_name || "Admin";
    const detail = [
      `🛡 <b>CHI TIẾT BÁO CÁO #${shortId}</b>`,
      `🌐 <b>Website:</b> ${r.url}`,
      `📊 <b>Trạng thái:</b> ${r.status}`,
      `📌 <b>Vấn đề:</b> ${formatCategory(r.category)}`,
      `⚙️ <b>Routing:</b> ${r.routing_mode || "N/A"}`,
      `📝 <b>Mô tả:</b> ${r.description || "Không có"}`,
      `👤 <b>Người xem:</b> ${userText}`,
    ].join("\n");

    if (cb.message?.chat.id) {
      const kb = getReportActionKeyboard(r.id, r.url, r.status);
      await sendTelegramMessage(cb.message.chat.id, detail, kb, cb.message.message_id);
    }
    await answerTelegramCallbackQuery(cb.id, `Đã mở chi tiết #${shortId}`);
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
    await answerTelegramCallbackQuery(cb.id, "❌ Báo cáo không tồn tại.", true);
    return;
  }

  const r = updated[0];
  const adminName = cb.from.username ? `@${cb.from.username}` : cb.from.first_name || "Admin";

  // Answer callback popup
  await answerTelegramCallbackQuery(cb.id, `Đã chuyển #${shortId} sang ${statusText}!`);

  // Update existing message keyboard & append operator note
  if (cb.message) {
    const updatedKeyboard = getReportActionKeyboard(r.id, r.url, newStatus);
    const appendNote = `\n\n📌 <b>Cập nhật:</b> ${formatStatusBadge(newStatus)} bởi ${escapeHtml(adminName)}`;

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
