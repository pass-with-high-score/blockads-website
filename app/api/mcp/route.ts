import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// CORS headers to allow connection from any MCP client (Claude Desktop, Cursor, Antigravity, browser, etc.)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

// Check access token for security
function isAuthorized(req: NextRequest): boolean {
  const secretKey = process.env.MCP_API_KEY || process.env.ADMIN_TOKEN;
  if (!secretKey) {
    return false;
  }

  // 1. Query parameter: ?key=... or ?token=...
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get("key") || searchParams.get("token");
  if (queryToken && queryToken === secretKey) {
    return true;
  }

  // 2. Authorization Header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer" && parts[1] === secretKey) {
      return true;
    }
  }

  // 3. Custom Header: x-mcp-key: <token>
  const customKey = req.headers.get("x-mcp-key");
  if (customKey && customKey === secretKey) {
    return true;
  }

  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Support SSE connection for standard MCP clients that initiate with GET
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing MCP access token. Please provide ?key=<token> or Bearer token.",
      },
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          "WWW-Authenticate": 'Bearer realm="BlockAds MCP"',
        },
      }
    );
  }

  const acceptHeader = req.headers.get("accept") || "";

  // If client expects HTML/browser, show human-readable documentation
  if (!acceptHeader.includes("text/event-stream")) {
    return NextResponse.json(
      {
        name: "BlockAds Reports MCP Server",
        version: "1.0.0",
        description: "Official MCP endpoint for BlockAds website reports on Supabase.",
        status: "online",
        transport: "Streamable HTTP / SSE",
        endpoint: "/api/mcp",
        available_tools: [
          "list_reports",
          "search_reports",
          "get_report_details",
          "get_report_statistics",
          "update_report_status",
        ],
      },
      { headers: CORS_HEADERS }
    );
  }

  // SSE Stream Transport
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send endpoint event according to MCP SSE specification
      const endpointData = `event: endpoint\ndata: /api/mcp\n\n`;
      controller.enqueue(encoder.encode(endpointData));
    },
  });

  return new Response(stream, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Tool definitions for MCP tools/list
const MCP_TOOLS = [
  {
    name: "list_reports",
    description: "List reported websites submitted by users from the BlockAds database.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "resolved", "ignored", "all"],
          description: "Filter by status ('pending', 'resolved', 'ignored', 'all'). Default: 'pending'.",
        },
        category: {
          type: "string",
          description: "Filter by issue category (e.g. 'ads_not_blocked', 'site_broken', 'popup_redirect', 'other').",
        },
        limit: {
          type: "number",
          description: "Maximum number of reports to return (1-100, default: 20).",
        },
        offset: {
          type: "number",
          description: "Offset for pagination (default: 0).",
        },
      },
    },
  },
  {
    name: "search_reports",
    description: "Search user reports by domain name or keywords in URL or description.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term (domain, keyword, e.g. 'kenh14', 'video', 'shopee').",
        },
        limit: {
          type: "number",
          description: "Maximum results (default: 20).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_report_details",
    description: "Get full details of a specific report by its UUID, including user agent and environment metadata.",
    inputSchema: {
      type: "object",
      properties: {
        report_id: {
          type: "string",
          description: "UUID of the report.",
        },
      },
      required: ["report_id"],
    },
  },
  {
    name: "get_report_statistics",
    description: "Get statistical summary of reports: total count, status breakdown, and top 10 most reported domains.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_report_status",
    description: "Update the status of a report after creating filter rules or investigating (e.g. mark as 'resolved', 'ignored', or 'pending').",
    inputSchema: {
      type: "object",
      properties: {
        report_id: {
          type: "string",
          description: "UUID of the report to update.",
        },
        status: {
          type: "string",
          enum: ["pending", "resolved", "ignored"],
          description: "New status.",
        },
      },
      required: ["report_id", "status"],
    },
  },
];

// Execute MCP Tool call
async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "list_reports": {
      const status = (args?.status as string) || "pending";
      const category = args?.category as string | undefined;
      const limit = Math.min(Math.max(Number(args?.limit) || 20, 1), 100);
      const offset = Math.max(Number(args?.offset) || 0, 0);

      let rows;
      if (status === "all") {
        if (category) {
          rows = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, screenshot_url, created_at
            FROM website_reports
            WHERE category = ${category}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          rows = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, screenshot_url, created_at
            FROM website_reports
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } else {
        if (category) {
          rows = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, screenshot_url, created_at
            FROM website_reports
            WHERE status = ${status} AND category = ${category}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          rows = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, screenshot_url, created_at
            FROM website_reports
            WHERE status = ${status}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      }

      return {
        count: rows.length,
        status_filter: status,
        category_filter: category || "all",
        offset,
        reports: rows,
      };
    }

    case "search_reports": {
      const query = (args?.query as string) || "";
      const limit = Math.min(Math.max(Number(args?.limit) || 20, 1), 50);
      const searchPattern = `%${query}%`;

      const rows = await sql`
        SELECT id, url, category, routing_mode, description, contact, status, screenshot_url, created_at
        FROM website_reports
        WHERE url ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return {
        search_query: query,
        results_count: rows.length,
        reports: rows,
      };
    }

    case "get_report_details": {
      const reportId = args?.report_id as string;
      if (!reportId) throw new Error("report_id is required");

      const rows = await sql`
        SELECT *
        FROM website_reports
        WHERE id = ${reportId}
        LIMIT 1
      `;

      if (!rows || rows.length === 0) {
        throw new Error(`Report not found with ID: ${reportId}`);
      }

      return rows[0];
    }

    case "get_report_statistics": {
      const [totalCountRow] = await sql`SELECT count(*)::int as count FROM website_reports`;
      const statusCounts = await sql`
        SELECT status, count(*)::int as count
        FROM website_reports
        GROUP BY status
      `;
      const categoryCounts = await sql`
        SELECT category, count(*)::int as count
        FROM website_reports
        GROUP BY category
        ORDER BY count DESC
      `;
      const topDomains = await sql`
        SELECT 
          regexp_replace(regexp_replace(url, '^https?://', ''), '/.*$', '') as domain,
          count(*)::int as report_count
        FROM website_reports
        GROUP BY domain
        ORDER BY report_count DESC
        LIMIT 10
      `;

      return {
        total_reports: totalCountRow?.count || 0,
        status_breakdown: statusCounts,
        category_breakdown: categoryCounts,
        top_reported_domains: topDomains,
      };
    }

    case "update_report_status": {
      const reportId = args?.report_id as string;
      const status = args?.status as string;
      if (!reportId || !status) throw new Error("report_id and status are required");

      const rows = await sql`
        UPDATE website_reports
        SET status = ${status}
        WHERE id = ${reportId}
        RETURNING id, url, status
      `;

      if (!rows || rows.length === 0) {
        throw new Error(`Report not found with ID: ${reportId}`);
      }

      return {
        success: true,
        message: `Report status updated to '${status}'.`,
        report: rows[0],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Handle JSON-RPC POST requests
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "Unauthorized: Invalid or missing MCP access token. Please provide ?key=<token> or Bearer token.",
        },
      },
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          "WWW-Authenticate": 'Bearer realm="BlockAds MCP"',
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    // Standard MCP initialize
    if (method === "initialize") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: true },
            },
            serverInfo: {
              name: "blockads-reports",
              version: "1.0.0",
            },
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // Client initialized notification
    if (method === "notifications/initialized") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    // Ping
    if (method === "ping") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: {} }, { headers: CORS_HEADERS });
    }

    // List available tools
    if (method === "tools/list") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS,
          },
        },
        { headers: CORS_HEADERS }
      );
    }

    // Call tool
    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      try {
        const toolResult = await executeTool(toolName, toolArgs);
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(toolResult, null, 2),
                },
              ],
              isError: false,
            },
          },
          { headers: CORS_HEADERS }
        );
      } catch (toolError: unknown) {
        const errorMsg = toolError instanceof Error ? toolError.message : String(toolError);
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Error executing tool '${toolName}': ${errorMsg}`,
                },
              ],
              isError: true,
            },
          },
          { headers: CORS_HEADERS }
        );
      }
    }

    // Method not found
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    console.error("MCP handler error:", err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error / Invalid JSON",
        },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
