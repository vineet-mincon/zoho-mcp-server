import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callEbayApi } from "../services/ebayClient.js";
import { formatSuccess, handleApiError } from "../services/zohoClient.js";

export function registerEbayTools(server: McpServer): void {
  server.registerTool(
    "ebay_api",
    {
      title: "eBay API Proxy",
      description: `Call any eBay API endpoint via the proxy. Uses a cached OAuth access token that is auto-refreshed from EBAY_REFRESH_TOKEN.

Args:
  - method (string): HTTP method — GET, POST, PUT, or DELETE
  - path (string): eBay API path starting with "/" (e.g. /sell/account/v1/privilege)
  - body (object, optional): JSON body for POST/PUT requests

Returns: { status, data } — the eBay response status code and parsed body as-is`,
      inputSchema: z.object({
        method: z.enum(["GET", "POST", "PUT", "DELETE"]),
        path: z.string().regex(/^\//, "path must start with /"),
        body: z.record(z.unknown()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ method, path, body }) => {
      try {
        const result = await callEbayApi(method, path, body);
        return { content: [{ type: "text", text: formatSuccess(result) }] };
      } catch (e) {
        handleApiError(e, "ebay_api");
      }
    }
  );
}
