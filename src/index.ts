import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
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

// ─── Tool Manifest (mirrors registered tools for /health) ────────────────────

const TOOLS = {
  invoices:       ["zoho_list_invoices","zoho_get_invoice","zoho_create_invoice","zoho_update_invoice","zoho_mark_invoice_sent","zoho_void_invoice"],
  sales_orders:   ["zoho_list_salesorders","zoho_get_salesorder","zoho_create_salesorder","zoho_update_salesorder","zoho_confirm_salesorder"],
  purchase_orders:["zoho_list_purchaseorders","zoho_get_purchaseorder","zoho_create_purchaseorder","zoho_update_purchaseorder","zoho_issue_purchaseorder","zoho_convert_po_to_bill"],
  dropshipments:  ["zoho_list_dropshipments","zoho_create_dropshipment","zoho_get_dropshipment","zoho_link_po_to_salesorder"],
  bills:          ["zoho_list_bills","zoho_get_bill","zoho_create_bill","zoho_update_bill"],
  contacts:       ["zoho_list_contacts","zoho_get_contact","zoho_create_contact","zoho_update_contact"],
  items:          ["zoho_list_items","zoho_get_item","zoho_create_item","zoho_update_item"],
  zoho_learn:     ["zoho_learn_list_courses","zoho_learn_get_course","zoho_learn_create_course","zoho_learn_update_course","zoho_learn_publish_course","zoho_learn_delete_course","zoho_learn_list_enrollments","zoho_learn_enroll_user","zoho_learn_remove_enrollment","zoho_learn_get_user_progress","zoho_learn_list_all_progress","zoho_learn_get_course_report","zoho_learn_list_learners","zoho_learn_list_categories","zoho_learn_create_category","zoho_learn_list_lessons","zoho_learn_create_lesson","zoho_learn_update_lesson","zoho_learn_create_quiz","zoho_learn_add_quiz_question","zoho_learn_list_quiz_questions"],
  ebay:           ["ebay_api","ebay_trading_api"],
};

const TOOLS_COUNT = Object.values(TOOLS).reduce((n, arr) => n + arr.length, 0);

// ─── Transport ────────────────────────────────────────────────────────────────

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  // ── GET /openapi.json ── raw OpenAPI spec
  app.get("/openapi.json", (_req, res) => {
    res.json(swaggerDocument);
  });

  // ── GET /docs/swagger.json ── alias kept for backwards compat
  app.get("/docs/swagger.json", (_req, res) => {
    res.redirect("/openapi.json");
  });

  // ── GET /docs ── Swagger UI loaded from CDN
  app.get("/docs", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Zoho MCP Server — API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      deepLinking: true,
    });
  </script>
</body>
</html>`);
  });

  // ── GET /health ── includes full tool manifest
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "zoho-mcp-server",
      version: "1.0.0",
      tools_count: TOOLS_COUNT,
      tools: TOOLS,
    });
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
