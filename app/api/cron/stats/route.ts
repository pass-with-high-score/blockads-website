import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { escapeHtml, sendTelegramMessage } from "@/lib/telegram";

const TARGET_GROUP_ID = process.env.TELEGRAM_DAILY_STATS_CHAT_ID || "-1003728420340";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const cronSecret = process.env.CRON_SECRET;
    const querySecret = searchParams.get("secret");
    const isTrigger = searchParams.get("trigger") === "true";

    // Verify secret if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret && !isTrigger) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Overall counts
    const [totalRow] = await sql`SELECT count(*)::int as count FROM website_reports`;
    const statusCounts = await sql`
      SELECT status, count(*)::int as count
      FROM website_reports
      GROUP BY status
    `;

    // 2. Last 24 Hours Activity
    const [new24hRow] = await sql`
      SELECT count(*)::int as count
      FROM website_reports
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;

    const [resolved24hRow] = await sql`
      SELECT count(*)::int as count
      FROM website_reports
      WHERE status = 'resolved' AND created_at >= NOW() - INTERVAL '24 hours'
    `;

    // 3. Top 5 Reported Domains
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
    statusCounts.forEach((r) => {
      statsMap[r.status] = r.count;
    });

    const todayStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "full",
    }).format(new Date());

    const topDomainLines =
      topDomains.length > 0
        ? topDomains.map((d, i) => `<b>${i + 1}.</b> <code>${escapeHtml(d.domain)}</code>: <b>${d.count}</b> reports`).join("\n")
        : "<i>No reported domains</i>";

    const messageHtml = [
      `📊 <b>BLOCKADS DAILY REPORT SUMMARY</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📅 <b>Date:</b> <code>${escapeHtml(todayStr)}</code>`,
      ``,
      `⚡️ <b>Past 24 Hours Activity:</b>`,
      `• 🆕 New Reports: <b>${new24hRow?.count || 0}</b>`,
      `• ✅ Marked Resolved: <b>${resolved24hRow?.count || 0}</b>`,
      ``,
      `📦 <b>All-Time Status:</b>`,
      `• ⏳ Pending: <b>${statsMap.pending || 0}</b>`,
      `• ✅ Resolved: <b>${statsMap.resolved || 0}</b>`,
      `• 🚫 Ignored: <b>${statsMap.ignored || 0}</b>`,
      `• 📁 Total in DB: <b>${totalRow?.count || 0}</b>`,
      ``,
      `🔥 <b>Top 5 Reported Domains:</b>`,
      topDomainLines,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🤖 <i>Automated daily report dispatched to BlockAds Android Chat</i>`,
    ].join("\n");

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "⏳ View Pending", callback_data: "reports_pending" },
          { text: "🌐 Open Website", url: "https://blockads.pwhs.app/report" },
        ],
      ],
    };

    const sendRes = await sendTelegramMessage(TARGET_GROUP_ID, messageHtml, replyMarkup);

    return NextResponse.json({
      success: true,
      delivered_to: TARGET_GROUP_ID,
      telegram_response: sendRes,
      stats: {
        total: totalRow?.count || 0,
        new_24h: new24hRow?.count || 0,
        resolved_24h: resolved24hRow?.count || 0,
        breakdown: statsMap,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to run daily stats cron:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
