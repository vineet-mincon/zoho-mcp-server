import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import axios from "axios";

import { registerInvoiceTools } from "./tools/invoices.js";
import { registerSalesOrderTools } from "./tools/salesOrders.js";
import { registerPurchaseOrderTools } from "./tools/purchaseOrders.js";
import { registerDropshipmentTools } from "./tools/dropshipments.js";
import { registerBillTools } from "./tools/bills.js";
import { registerContactTools, registerItemTools } from "./tools/contactsAndItems.js";
import { registerLearnTools } from "./tools/zohoLearn.js";

// ─── Server Init ─────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "zoho-mcp-server",
  version: "1.0.0",
});

// ─── Register All Tools ───────────────────────────────────────────────────────

registerInvoiceTools(server);
registerSalesOrderTools(server);
registerPurchaseOrderTools(server);
registerDropshipmentTools(server);
registerBillTools(server);
registerContactTools(server);
registerItemTools(server);
registerLearnTools(server);

// ─── Transport ────────────────────────────────────────────────────────────────

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "zoho-mcp-server", version: "1.0.0" });
  });

  app.get("/mcp", (_req, res) => {
  // Streamable HTTP transport uses POST for requests.
  // This is just to avoid confusion when hitting /mcp in a browser.
  res.status(200).send("MCP endpoint is up. Use POST /mcp (Streamable HTTP).");
});

  // ─── eBay Proxy ───────────────────────────────────────────────────────────
  let ebayTokenCache: { token: string; expiresAt: number } | null = null;

  async function getEbayAccessToken(): Promise<string> {
    if (ebayTokenCache && Date.now() < ebayTokenCache.expiresAt) {
      return ebayTokenCache.token;
    }
    const appId = process.env.EBAY_APP_ID;
    const certId = process.env.EBAY_CERT_ID;
    const refreshToken = process.env.EBAY_REFRESH_TOKEN;
    if (!appId || !certId || !refreshToken) {
      throw new Error("Missing EBAY_APP_ID, EBAY_CERT_ID, or EBAY_REFRESH_TOKEN");
    }
    const scope =
      process.env.EBAY_SCOPES ??
      "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment";
    const basic = Buffer.from(`${appId}:${certId}`).toString("base64");
    const params = new URLSearchParams();
    params.set("grant_type", "refresh_token");
    params.set("refresh_token", refreshToken);
    params.set("scope", scope);
    const resp = await axios.post(
      "https://api.ebay.com/identity/v1/oauth2/token",
      params.toString(),
      {
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = resp.data.access_token as string;
    const expiresIn = (resp.data.expires_in as number) ?? 7200;
    ebayTokenCache = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
    return token;
  }

  app.post("/ebay", async (req, res) => {
    try {
      const { method, path, body } = req.body ?? {};
      if (!method || !path) {
        res.status(400).json({ error: "method and path are required" });
        return;
      }
      const token = await getEbayAccessToken();
      const resp = await axios.request({
        method,
        url: `https://api.ebay.com${path}`,
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      });
      res.status(resp.status).json(resp.data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      res
        .status(e.response?.status ?? 500)
        .json(e.response?.data ?? { error: e.message ?? "Unknown error" });
    }
  });

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

const port = parseInt(process.env.PORT ?? "3000", 10);
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.error(`Zoho MCP server running on http://${host}:${port}/mcp`);
});
}

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zoho MCP server running on stdio");
}

// Choose transport based on environment variable
const transport = process.env.TRANSPORT ?? "http";
if (transport === "http") {
  runHTTP().catch((error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error: unknown) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
