import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is required.");
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: "require",
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create MCP Server instance
const server = new McpServer({
  name: "blockads-reports",
  version: "1.0.0",
});

// Tool 1: List reports with filtering and pagination
server.tool(
  "list_reports",
  "List reported websites submitted by users from the BlockAds database.",
  {
    status: z
      .enum(["pending", "resolved", "ignored", "all"])
      .optional()
      .default("pending")
      .describe("Filter by report status ('pending', 'resolved', 'ignored', 'all'). Default is 'pending'."),
    category: z
      .string()
      .optional()
      .describe("Filter by issue category (e.g. 'ads_not_blocked', 'site_broken', 'popup_redirect', 'other')."),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Number of reports to fetch (1-100, default: 20)."),
    offset: z
      .number()
      .min(0)
      .optional()
      .default(0)
      .describe("Offset for pagination (default: 0)."),
  },
  async ({ status, category, limit, offset }) => {
    try {
      let query;
      if (status === "all") {
        if (category) {
          query = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, created_at
            FROM website_reports
            WHERE category = ${category}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          query = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, created_at
            FROM website_reports
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      } else {
        if (category) {
          query = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, created_at
            FROM website_reports
            WHERE status = ${status} AND category = ${category}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          query = await sql`
            SELECT id, url, category, routing_mode, description, contact, status, created_at
            FROM website_reports
            WHERE status = ${status}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                count: query.length,
                status_filter: status,
                category_filter: category || "all",
                offset,
                reports: query,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Database error: ${errorMsg}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Search reports by domain or description keyword
server.tool(
  "search_reports",
  "Search user reports by domain name or keywords in URL or description.",
  {
    query: z.string().describe("Search term (domain, keyword, e.g. 'kenh14', 'video', 'shopee')."),
    limit: z.number().min(1).max(50).optional().default(20).describe("Maximum results (default: 20)."),
  },
  async ({ query, limit }) => {
    try {
      const searchPattern = `%${query}%`;
      const results = await sql`
        SELECT id, url, category, routing_mode, description, contact, status, created_at
        FROM website_reports
        WHERE url ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                search_query: query,
                results_count: results.length,
                reports: results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Database error: ${errorMsg}` }],
        isError: true,
      };
    }
  }
);

// Tool 3: Get full details of a report by ID
server.tool(
  "get_report_details",
  "Get full details of a specific report by its UUID, including user agent and debug metadata.",
  {
    report_id: z.string().uuid().describe("UUID of the report."),
  },
  async ({ report_id }) => {
    try {
      const rows = await sql`
        SELECT *
        FROM website_reports
        WHERE id = ${report_id}
        LIMIT 1
      `;

      if (!rows || rows.length === 0) {
        return {
          content: [{ type: "text", text: `Report not found with ID: ${report_id}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows[0], null, 2),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Database error: ${errorMsg}` }],
        isError: true,
      };
    }
  }
);

// Tool 4: Get report statistics & top domains
server.tool(
  "get_report_statistics",
  "Get statistical summary of reports, status distribution, and most frequently reported domains.",
  {},
  async () => {
    try {
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
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_reports: totalCountRow.count,
                status_breakdown: statusCounts,
                category_breakdown: categoryCounts,
                top_reported_domains: topDomains,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Database error: ${errorMsg}` }],
        isError: true,
      };
    }
  }
);

// Tool 5: Update report status
server.tool(
  "update_report_status",
  "Update status of a report (e.g. mark as 'resolved' after creating filter rule, or 'ignored').",
  {
    report_id: z.string().uuid().describe("UUID of the report to update."),
    status: z.enum(["pending", "resolved", "ignored"]).describe("New status."),
  },
  async ({ report_id, status }) => {
    try {
      const rows = await sql`
        UPDATE website_reports
        SET status = ${status}
        WHERE id = ${report_id}
        RETURNING id, url, status
      `;

      if (!rows || rows.length === 0) {
        return {
          content: [{ type: "text", text: `Report not found with ID: ${report_id}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Report status updated to '${status}'.`,
                report: rows[0],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Database error: ${errorMsg}` }],
        isError: true,
      };
    }
  }
);

// Start server on stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BlockAds Reports MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting MCP Server:", err);
  process.exit(1);
});
