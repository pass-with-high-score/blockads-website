# BlockAds Reports MCP Server

Model Context Protocol (MCP) server for querying and managing website ad-blocking reports from BlockAds users stored in Supabase PostgreSQL.

## Features & Tools

| Tool Name | Description | Parameters |
|---|---|---|
| `list_reports` | List reports submitted by users | `status` ('pending', 'resolved', 'ignored', 'all'), `category`, `limit` (default: 20), `offset` |
| `search_reports` | Search reports by domain or keywords in URL/description | `query` (e.g. 'kenh14', 'video', 'shopee'), `limit` |
| `get_report_details` | Get complete details of a specific report by UUID | `report_id` (UUID) |
| `get_report_statistics` | Overview stats: total count, status breakdown, top reported domains | None |
| `update_report_status` | Update status of a report after investigation or filter rule addition | `report_id` (UUID), `status` ('pending', 'resolved', 'ignored') |

## Integration Configuration

### Option 1: Remote MCP Server (Recommended)

In your MCP client configuration (`~/.gemini/config/mcp_config.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "blockads-reports": {
      "serverUrl": "https://blockads.pwhs.app/api/mcp?key=YOUR_MCP_SECRET_KEY"
    }
  }
}
```

### Option 2: Local Stdio Transport

```json
{
  "mcpServers": {
    "blockads-reports": {
      "command": "node",
      "args": [
        "/path/to/blockads-website/mcp-server/dist/index.mjs"
      ],
      "env": {
        "DATABASE_URL": "postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require"
      }
    }
  }
}
```

## Development & Build

```bash
cd mcp-server
bun install
bun run build
```
