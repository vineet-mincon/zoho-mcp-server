"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
var import_express2 = __toESM(require("express"));

// src/swagger.ts
var swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "zoho-common-endpoints",
    version: "1.0.0",
    description: "Lightweight MCP server exposing workflow tools NOT covered by native Zoho MCP integrations. Provides two MCP tools (`zoho_confirm_salesorder`, `zoho_link_po_to_salesorder`) plus a `/sync` webhook router for triggering the same operations via HTTP events.",
    contact: { email: "vineet@mctoolsusa.com" }
  },
  servers: [
    {
      url: "https://zoho-mcp-server-production-bb70.up.railway.app",
      description: "Production (Railway)"
    },
    { url: "http://localhost:3000", description: "Local development" }
  ],
  tags: [
    { name: "System", description: "Health and status endpoints" },
    { name: "MCP", description: "Model Context Protocol transport" },
    { name: "Webhook", description: "Sync webhook router for Zoho workflow events" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    server: { type: "string", example: "zoho-common-endpoints" },
                    version: { type: "string", example: "1.0.0" },
                    tools_count: { type: "number", example: 2 },
                    tools: {
                      type: "object",
                      properties: {
                        common: {
                          type: "array",
                          items: { type: "string" },
                          example: ["zoho_confirm_salesorder", "zoho_link_po_to_salesorder"]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/openapi.json": {
      get: {
        tags: ["System"],
        summary: "Raw OpenAPI spec",
        operationId: "openApiSpec",
        responses: {
          "200": {
            description: "OpenAPI 3.0 JSON spec",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    "/mcp": {
      get: {
        tags: ["MCP"],
        summary: "MCP endpoint info",
        operationId: "mcpInfo",
        responses: {
          "200": {
            description: "Confirmation the MCP endpoint is reachable",
            content: { "text/plain": { schema: { type: "string" } } }
          }
        }
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport",
        description: "Primary endpoint for MCP tool calls (JSON-RPC 2.0).\n\n**Available tools (2):**\n\n- `zoho_confirm_salesorder` \u2014 change a Sales Order from draft \u2192 confirmed\n- `zoho_link_po_to_salesorder` \u2014 link an existing Purchase Order to a Sales Order",
        operationId: "mcpRequest",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["jsonrpc", "method"],
                properties: {
                  jsonrpc: { type: "string", enum: ["2.0"] },
                  id: { type: "string", example: "1" },
                  method: { type: "string", enum: ["initialize", "tools/list", "tools/call"] },
                  params: { type: "object" }
                }
              },
              examples: {
                list_tools: {
                  summary: "List available tools",
                  value: { jsonrpc: "2.0", id: "1", method: "tools/list", params: {} }
                },
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: {
                    jsonrpc: "2.0",
                    id: "2",
                    method: "tools/call",
                    params: { name: "zoho_confirm_salesorder", arguments: { salesorder_id: "SO-00001" } }
                  }
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: {
                    jsonrpc: "2.0",
                    id: "3",
                    method: "tools/call",
                    params: {
                      name: "zoho_link_po_to_salesorder",
                      arguments: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "JSON-RPC response with tool result",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    "/sync": {
      post: {
        tags: ["Webhook"],
        summary: "Sync webhook \u2014 trigger Zoho workflow events via HTTP",
        description: "Accepts a JSON payload with an `event` name and `payload` object. Executes the corresponding Zoho API call and returns the result.\n\n**Supported events:**\n\n- `confirm_salesorder` \u2014 confirms a draft SO\n- `link_po_to_salesorder` \u2014 links a PO to a SO",
        operationId: "syncWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["event", "payload"],
                properties: {
                  event: {
                    type: "string",
                    enum: ["confirm_salesorder", "link_po_to_salesorder"],
                    description: "The workflow event to trigger"
                  },
                  payload: {
                    type: "object",
                    description: "Event-specific data"
                  }
                }
              },
              examples: {
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: { event: "confirm_salesorder", payload: { salesorder_id: "SO-00001" } }
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: {
                    event: "link_po_to_salesorder",
                    payload: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Event handled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { type: "string" },
                    status: { type: "string", example: "ok" },
                    data: { type: "object" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Missing or invalid fields",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } }
                }
              }
            }
          }
        }
      }
    }
  }
};

// src/routes/sync.ts
var import_express = require("express");

// src/services/zohoClient.ts
var import_axios = __toESM(require("axios"));

// src/constants.ts
var ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
var ZOHO_BOOKS_URL = "https://www.zohoapis.in/books/v3";
var ZOHO_INVENTORY_URL = "https://www.zohoapis.in/inventory/v1";
var ZOHO_LEARN_URL = "https://learn.zoho.in/learn/api/v1/portal/rmt";
var TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1e3;

// src/services/zohoClient.ts
var authState = null;
function getConfig() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const organizationId = process.env.ZOHO_ORGANIZATION_ID;
  if (!clientId || !clientSecret || !refreshToken || !organizationId) {
    throw new Error(
      "Missing required environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID"
    );
  }
  return { clientId, clientSecret, refreshToken, organizationId };
}
async function refreshAccessToken() {
  const { clientId, clientSecret, refreshToken } = getConfig();
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken
  });
  const response = await import_axios.default.post(
    `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const { access_token, expires_in } = response.data;
  authState = {
    accessToken: access_token,
    expiresAt: Date.now() + expires_in * 1e3
  };
  return access_token;
}
async function getAccessToken() {
  if (authState && Date.now() < authState.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return authState.accessToken;
  }
  return refreshAccessToken();
}
function createApiClient(baseURL, addOrgId = true) {
  const client = import_axios.default.create({ baseURL });
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    const { organizationId } = getConfig();
    config.headers["Authorization"] = `Zoho-oauthtoken ${token}`;
    config.headers["Content-Type"] = "application/json";
    if (addOrgId) {
      config.params = { ...config.params, organization_id: organizationId };
    }
    return config;
  });
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        authState = null;
        const token = await getAccessToken();
        if (error.config) {
          error.config.headers["Authorization"] = `Zoho-oauthtoken ${token}`;
          return (0, import_axios.default)(error.config);
        }
      }
      return Promise.reject(error);
    }
  );
  return client;
}
var booksClient = createApiClient(ZOHO_BOOKS_URL);
var inventoryClient = createApiClient(ZOHO_INVENTORY_URL);
var learnClient = createApiClient(ZOHO_LEARN_URL, false);
learnClient.interceptors.request.use((config) => {
  const params = new URLSearchParams(config.params).toString();
  const url = `${config.baseURL}${config.url}${params ? "?" + params : ""}`;
  console.error(`[learnClient] ${config.method?.toUpperCase()} ${url}`);
  if (config.data)
    console.error(`[learnClient] body: ${JSON.stringify(config.data)}`);
  return config;
});
learnClient.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error(`[learnClient] ERROR ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
    return Promise.reject(error);
  }
);
function handleApiError(error, context) {
  if (import_axios.default.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message ?? error.message;
    if (status === 401) {
      throw new Error(`Authentication failed for ${context}. Check your ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.`);
    }
    if (status === 403) {
      throw new Error(`Permission denied for ${context}. Ensure your OAuth scope includes the required permissions.`);
    }
    if (status === 404) {
      throw new Error(`Resource not found in ${context}. Verify the ID is correct.`);
    }
    if (status === 429) {
      throw new Error(`Rate limit exceeded for ${context}. Zoho allows 2500-5000 requests/day. Try again later.`);
    }
    throw new Error(`Zoho API error in ${context} (HTTP ${status}): ${message}`);
  }
  throw new Error(`Unexpected error in ${context}: ${String(error)}`);
}
function formatSuccess(data) {
  return JSON.stringify(data, null, 2);
}

// src/routes/sync.ts
var router = (0, import_express.Router)();
router.post("/", async (req, res) => {
  const { event, payload } = req.body ?? {};
  if (!event || typeof event !== "string") {
    res.status(400).json({ error: "Missing or invalid 'event' field" });
    return;
  }
  if (!payload || typeof payload !== "object") {
    res.status(400).json({ error: "Missing or invalid 'payload' field" });
    return;
  }
  try {
    switch (event) {
      case "confirm_salesorder": {
        const { salesorder_id } = payload;
        if (!salesorder_id) {
          res.status(400).json({ error: "payload.salesorder_id is required" });
          return;
        }
        const result = await inventoryClient.post(
          `/salesorders/${salesorder_id}/status/confirmed`
        );
        res.json({ event, status: "ok", data: result.data });
        break;
      }
      case "link_po_to_salesorder": {
        const { purchaseorder_id, salesorder_id } = payload;
        if (!purchaseorder_id || !salesorder_id) {
          res.status(400).json({
            error: "payload.purchaseorder_id and payload.salesorder_id are required"
          });
          return;
        }
        const result = await inventoryClient.put(
          `/purchaseorders/${purchaseorder_id}`,
          { salesorder_id }
        );
        res.json({ event, status: "ok", data: result.data.purchaseorder });
        break;
      }
      default:
        res.status(400).json({ error: `Unknown event: '${event}'` });
    }
  } catch (err) {
    const e = err;
    res.status(e.response?.status ?? 500).json({ event, status: "error", error: e.response?.data ?? e.message ?? "Unknown error" });
  }
});

// src/tools/common.ts
var import_zod = require("zod");
function registerCommonTools(server2) {
  server2.registerTool(
    "zoho_confirm_salesorder",
    {
      title: "Confirm Sales Order",
      description: `Change a Sales Order status from draft to confirmed. Required before creating dropshipments or purchase orders against it.

Args:
  - salesorder_id (string): The SO ID to confirm

Returns: Success confirmation`,
      inputSchema: import_zod.z.object({
        salesorder_id: import_zod.z.string().describe("Zoho Sales Order ID to confirm")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ salesorder_id }) => {
      try {
        const res = await inventoryClient.post(`/salesorders/${salesorder_id}/status/confirmed`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_confirm_salesorder");
      }
    }
  );
  server2.registerTool(
    "zoho_link_po_to_salesorder",
    {
      title: "Link Purchase Order to Sales Order",
      description: `Link an existing Purchase Order to a Sales Order. Use this when a PO has already been created manually and needs to be associated with a customer's Sales Order for tracking and dropship workflows.

Args:
  - purchaseorder_id (string): Existing PO to link
  - salesorder_id (string): The customer's Sales Order to link to

Returns: Updated PO with salesorder reference`,
      inputSchema: import_zod.z.object({
        purchaseorder_id: import_zod.z.string().describe("Existing Purchase Order ID"),
        salesorder_id: import_zod.z.string().describe("Sales Order ID to link to")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ purchaseorder_id, salesorder_id }) => {
      try {
        const res = await inventoryClient.put(`/purchaseorders/${purchaseorder_id}`, {
          salesorder_id
        });
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_link_po_to_salesorder");
      }
    }
  );
}

// src/index.ts
var server = new import_mcp.McpServer({
  name: "zoho-common-endpoints",
  version: "1.0.0"
});
registerCommonTools(server);
var TOOLS = {
  common: [
    "zoho_confirm_salesorder",
    "zoho_link_po_to_salesorder"
  ]
};
var TOOLS_COUNT = TOOLS.common.length;
async function runHTTP() {
  const app = (0, import_express2.default)();
  app.use(import_express2.default.json());
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "zoho-common-endpoints",
      version: "1.0.0",
      tools_count: TOOLS_COUNT,
      tools: TOOLS
    });
  });
  app.get("/openapi.json", (_req, res) => {
    res.json(swaggerDocument);
  });
  app.get("/docs", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>zoho-common-endpoints \u2014 API Docs</title>
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
  app.get("/mcp", (_req, res) => {
    res.status(200).send("zoho-common-endpoints MCP is up. Use POST /mcp (Streamable HTTP).");
  });
  app.use("/sync", router);
  app.post("/mcp", async (req, res) => {
    const transport2 = new import_streamableHttp.StreamableHTTPServerTransport({
      sessionIdGenerator: void 0,
      enableJsonResponse: true
    });
    res.on("close", () => transport2.close());
    await server.connect(transport2);
    await transport2.handleRequest(req, res, req.body);
  });
  const port = parseInt(process.env.PORT ?? "3000", 10);
  const host = "0.0.0.0";
  app.listen(port, host, () => {
    console.error(`zoho-common-endpoints running on http://${host}:${port}`);
  });
}
async function runStdio() {
  const transport2 = new import_stdio.StdioServerTransport();
  await server.connect(transport2);
  console.error("zoho-common-endpoints running on stdio");
}
var transport = process.env.TRANSPORT ?? "http";
if (transport === "http") {
  runHTTP().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
