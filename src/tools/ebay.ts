import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callEbayApi, callEbayTradingApi } from "../services/ebayClient.js";
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

  server.registerTool(
    "ebay_trading_api",
    {
      title: "eBay Trading API Proxy",
      description: `Call any eBay Trading API (XML SOAP) operation via the proxy. Uses a cached OAuth access token from EBAY_REFRESH_TOKEN, sent as X-EBAY-API-IAF-TOKEN and inside RequesterCredentials.

The XML request body is built automatically: the root element becomes {callName}Request with xmlns="urn:ebay:apis:eBLBaseComponents", and the fields in "params" are serialized as child elements.

Args:
  - callName (string): Trading API call name (e.g. GetMyeBaySelling, GetOrders, AddFixedPriceItem)
  - params (object, optional): Request body fields as a nested object matching the Trading API XML schema

Example params for GetMyeBaySelling:
  {
    "ActiveList": {
      "Include": true,
      "Pagination": { "EntriesPerPage": 200, "PageNumber": 1 }
    },
    "DetailLevel": "ReturnAll"
  }

Returns: { status, data } — HTTP status and the parsed XML response (unwrapped from the {callName}Response envelope)`,
      inputSchema: z.object({
        callName: z.string().min(1),
        params: z.record(z.unknown()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ callName, params }) => {
      try {
        const result = await callEbayTradingApi(callName, params ?? {});
        return { content: [{ type: "text", text: formatSuccess(result) }] };
      } catch (e) {
        handleApiError(e, "ebay_trading_api");
      }
    }
  );
}
