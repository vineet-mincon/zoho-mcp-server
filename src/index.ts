import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger.js";

import { registerInvoiceTools } from "./tools/invoices.js";
import { registerSalesOrderTools } from "./tools/salesOrders.js";
import { registerPurchaseOrderTools } from "./tools/purchaseOrders.js";
import { registerDropshipmentTools } from "./tools/dropshipments.js";
import { registerBillTools } from "./tools/bills.js";
import { registerContactTools, registerItemTools } from "./tools/contactsAndItems.js";
import { registerLearnTools } from "./tools/zohoLearn.js";
import { registerEbayTools } from "./tools/ebay.js";
import { callEbayApi, callEbayTradingApi } from "./services/ebayClient.js";

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
registerEbayTools(server);

// ─── Transport ────────────────────────────────────────────────────────────────

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "zoho-mcp-server", version: "1.0.0" });
  });

  app.get("/mcp", (_req, res) => {
  // Streamable HTTP transport uses POST for requests.
  // This is just to avoid confusion when hitting /mcp in a browser.
  res.status(200).send("MCP endpoint is up. Use POST /mcp (Streamable HTTP).");
});

  app.post("/ebay", async (req, res) => {
    try {
      const { method, path, body } = req.body ?? {};
      if (!method || !path) {
        res.status(400).json({ error: "method and path are required" });
        return;
      }
      const result = await callEbayApi(method, path, body);
      res.status(result.status).json(result.data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      res
        .status(e.response?.status ?? 500)
        .json(e.response?.data ?? { error: e.message ?? "Unknown error" });
    }
  });

  app.post("/ebay-trading", async (req, res) => {
    try {
      const { callName, params } = req.body ?? {};
      if (!callName || typeof callName !== "string") {
        res.status(400).json({ error: "callName is required" });
        return;
      }
      const result = await callEbayTradingApi(callName, params ?? {});
      res.status(result.status).json(result.data);
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
