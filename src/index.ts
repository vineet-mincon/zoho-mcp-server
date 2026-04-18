import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { swaggerDocument } from "./swagger.js";
import { syncRouter } from "./routes/sync.js";
import { registerCommonTools } from "./tools/common.js";

// ─── Server Init ─────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "zoho-common-endpoints",
  version: "1.0.0",
});

// ─── Register Tools ───────────────────────────────────────────────────────────

registerCommonTools(server);

// ─── Tool Manifest ────────────────────────────────────────────────────────────

const TOOLS = {
  common: [
    "zoho_confirm_salesorder",
    "zoho_link_po_to_salesorder",
  ],
};

const TOOLS_COUNT = TOOLS.common.length;

// ─── HTTP Transport ───────────────────────────────────────────────────────────

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  // ── GET /health ───────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "zoho-common-endpoints",
      version: "1.0.0",
      tools_count: TOOLS_COUNT,
      tools: TOOLS,
    });
  });

  // ── GET /openapi.json ─────────────────────────────────────────────────────
  app.get("/openapi.json", (_req, res) => {
    res.json(swaggerDocument);
  });

  // ── GET /docs ─────────────────────────────────────────────────────────────
  app.get("/docs", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>zoho-common-endpoints — API Docs</title>
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

  // ── GET /mcp ─────────────────────────────────────────────────────────────
  app.get("/mcp", (_req, res) => {
    res.status(200).send("zoho-common-endpoints MCP is up. Use POST /mcp (Streamable HTTP).");
  });

  // ── POST /sync ─── webhook router ─────────────────────────────────────────
  app.use("/sync", syncRouter);

  // ── POST /mcp ─── MCP Streamable HTTP ─────────────────────────────────────
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
    console.error(`zoho-common-endpoints running on http://${host}:${port}`);
  });
}

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("zoho-common-endpoints running on stdio");
}

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
