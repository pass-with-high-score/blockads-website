import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, category, description, routingMode, contact, honeypot } = body;

    // Honeypot spam check
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Report received" });
    }

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Website URL is required." },
        { status: 400 }
      );
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const categoryLabels: Record<string, string> = {
      ads_not_blocked: "🚫 Ads Still Showing",
      site_broken: "⚠️ Broken Page / Anti-Adblock",
      popup_redirect: "🪟 Pop-ups / Redirects",
      malware_phishing: "🚨 Malware / Phishing",
      other: "💬 Other Issue",
    };

    const categoryText = categoryLabels[category] || category || "Uncategorized";
    const modeText = routingMode || "Not specified";
    const cleanDesc = description?.trim() || null;
    const cleanContact = contact?.trim() || null;

    // Request metadata
    const userAgent = req.headers.get("user-agent") || "Unknown";
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "Unknown";

    // 1. Save to Supabase PostgreSQL
    let reportId: string | null = null;
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
          ${category || "other"},
          ${modeText},
          ${cleanDesc},
          ${cleanContact},
          ${ip},
          ${userAgent},
          'pending'
        )
        RETURNING id
      `;
      if (rows && rows.length > 0) {
        reportId = rows[0].id;
      }
    } catch (dbError) {
      console.error("Failed to save report to Supabase:", dbError);
      // We still continue to attempt sending the Telegram message
    }

    // 2. Dispatch notification to Telegram
    const timestamp = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date());

    const descHtml = cleanDesc ? escapeHtml(cleanDesc) : "<i>No description provided</i>";
    const contactHtml = cleanContact ? escapeHtml(cleanContact) : "<i>Anonymous</i>";
    const reportRef = reportId ? `\n🆔 <b>Report ID:</b> <code>#${escapeHtml(reportId.slice(0, 8))}</code>` : "";

    const messageHtml = [
      `🛡 <b>NEW WEBSITE REPORT (BLOCKADS)</b>${reportRef}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🌐 <b>Website:</b> <a href="${escapeHtml(normalizedUrl)}">${escapeHtml(normalizedUrl)}</a>`,
      `📌 <b>Issue:</b> ${escapeHtml(categoryText)}`,
      `⚙️ <b>Routing Mode:</b> ${escapeHtml(modeText)}`,
      `📝 <b>Description:</b>\n${descHtml}`,
      `👤 <b>Contact:</b> ${contactHtml}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🕒 <b>Timestamp:</b> <code>${escapeHtml(timestamp)}</code>`,
      `📱 <b>Device/Browser:</b> <code>${escapeHtml(userAgent.slice(0, 150))}</code>`,
      `📍 <b>IP:</b> <code>${escapeHtml(ip)}</code>`,
    ].join("\n");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_REPORT_CHAT_ID;

    if (botToken && chatId) {
      const telegramEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const telegramRes = await fetch(telegramEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageHtml,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });

      const telegramData = await telegramRes.json();
      if (!telegramRes.ok || !telegramData.ok) {
        console.error("Telegram API response error:", telegramData);
      }
      } catch (telegramErr) {
        console.error("Failed to forward report to Telegram:", telegramErr);
      }
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: "Your report has been submitted successfully. Thank you!",
    });
  } catch (error: unknown) {
    console.error("Error handling report submission:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 50);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search")?.trim() || "";
    const offset = (page - 1) * limit;

    const searchPattern = search ? `%${search}%` : null;

    // Fetch reports
    let reports;
    let totalCount = 0;

    if (searchPattern) {
      if (status === "all") {
        reports = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          WHERE url ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const [countRow] = await sql`
          SELECT count(*)::int as count
          FROM website_reports
          WHERE url ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
        `;
        totalCount = countRow?.count || 0;
      } else {
        reports = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          WHERE status = ${status} AND (url ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const [countRow] = await sql`
          SELECT count(*)::int as count
          FROM website_reports
          WHERE status = ${status} AND (url ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
        `;
        totalCount = countRow?.count || 0;
      }
    } else {
      if (status === "all") {
        reports = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const [countRow] = await sql`SELECT count(*)::int as count FROM website_reports`;
        totalCount = countRow?.count || 0;
      } else {
        reports = await sql`
          SELECT id, url, category, routing_mode, description, contact, status, created_at
          FROM website_reports
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const [countRow] = await sql`SELECT count(*)::int as count FROM website_reports WHERE status = ${status}`;
        totalCount = countRow?.count || 0;
      }
    }

    // Overall status stats for badges
    const statusCounts = await sql`
      SELECT status, count(*)::int as count
      FROM website_reports
      GROUP BY status
    `;

    const statsMap: Record<string, number> = {
      total: 0,
      pending: 0,
      resolved: 0,
      ignored: 0,
    };

    statusCounts.forEach((r) => {
      const s = r.status || "pending";
      const c = Number(r.count) || 0;
      statsMap[s] = (statsMap[s] || 0) + c;
      statsMap.total += c;
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      stats: statsMap,
    });
  } catch (error: unknown) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports from database." },
      { status: 500 }
    );
  }
}
