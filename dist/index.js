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
    description: "MCP server exposing workflow and auxiliary tools not covered by native Zoho MCP integrations. 27 tools across three groups: workflow (SO/PO/invoice), Zoho Learn, and eBay. Also exposes a `/sync` webhook router and direct eBay HTTP proxies.",
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
    { name: "System", description: "Health and status" },
    { name: "MCP", description: "Model Context Protocol transport (all 27 tools)" },
    { name: "Webhook", description: "POST /sync \u2014 trigger workflow events via HTTP" },
    { name: "eBay", description: "Direct eBay REST and Trading API proxies" }
  ],
  paths: {
    // ── System ────────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check \u2014 returns server name, version, and full tool manifest",
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
                    tools_count: { type: "number", example: 27 },
                    tools: {
                      type: "object",
                      properties: {
                        workflow: {
                          type: "array",
                          items: { type: "string" },
                          example: [
                            "zoho_confirm_salesorder",
                            "zoho_link_po_to_salesorder",
                            "zoho_convert_po_to_bill",
                            "zoho_create_invoice_from_salesorder"
                          ]
                        },
                        zoho_learn: {
                          type: "array",
                          items: { type: "string" },
                          example: [
                            "zoho_learn_list_courses",
                            "zoho_learn_get_course",
                            "zoho_learn_create_course",
                            "zoho_learn_update_course",
                            "zoho_learn_publish_course",
                            "zoho_learn_delete_course",
                            "zoho_learn_list_enrollments",
                            "zoho_learn_enroll_user",
                            "zoho_learn_remove_enrollment",
                            "zoho_learn_get_user_progress",
                            "zoho_learn_list_all_progress",
                            "zoho_learn_get_course_report",
                            "zoho_learn_list_learners",
                            "zoho_learn_list_categories",
                            "zoho_learn_create_category",
                            "zoho_learn_list_lessons",
                            "zoho_learn_create_lesson",
                            "zoho_learn_update_lesson",
                            "zoho_learn_create_quiz",
                            "zoho_learn_add_quiz_question",
                            "zoho_learn_list_quiz_questions"
                          ]
                        },
                        ebay: {
                          type: "array",
                          items: { type: "string" },
                          example: ["ebay_api", "ebay_trading_api"]
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
        summary: "Raw OpenAPI 3.0 spec",
        operationId: "openApiSpec",
        responses: {
          "200": {
            description: "OpenAPI JSON",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    // ── MCP ───────────────────────────────────────────────────────────────────
    "/mcp": {
      get: {
        tags: ["MCP"],
        summary: "MCP endpoint info",
        operationId: "mcpInfo",
        responses: {
          "200": {
            description: "Confirmation the MCP endpoint is up",
            content: { "text/plain": { schema: { type: "string" } } }
          }
        }
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport \u2014 all 27 tools",
        description: "JSON-RPC 2.0 endpoint for all MCP tool calls.\n\n### Workflow tools (4)\n| Tool | Description |\n|---|---|\n| `zoho_confirm_salesorder` | Change a Sales Order from draft \u2192 confirmed |\n| `zoho_link_po_to_salesorder` | Link an existing PO to a Sales Order |\n| `zoho_convert_po_to_bill` | Convert an issued PO into a Zoho Books Bill |\n| `zoho_create_invoice_from_salesorder` | Create a Books Invoice from a confirmed SO |\n\n### Zoho Learn tools (21)\n| Tool | Description |\n|---|---|\n| `zoho_learn_list_courses` | List / search courses |\n| `zoho_learn_get_course` | Get full course details |\n| `zoho_learn_create_course` | Create a new course |\n| `zoho_learn_update_course` | Update course metadata |\n| `zoho_learn_publish_course` | Publish or unpublish a course |\n| `zoho_learn_delete_course` | Delete a course |\n| `zoho_learn_list_enrollments` | List learners enrolled in a course |\n| `zoho_learn_enroll_user` | Enroll one or more users in a course |\n| `zoho_learn_remove_enrollment` | Unenroll a user from a course |\n| `zoho_learn_get_user_progress` | Get a learner's progress in a course |\n| `zoho_learn_list_all_progress` | All learner progress across a course |\n| `zoho_learn_get_course_report` | Completion rates and scores for a course |\n| `zoho_learn_list_learners` | List all learners in the portal |\n| `zoho_learn_list_categories` | List all course categories |\n| `zoho_learn_create_category` | Create a new course category |\n| `zoho_learn_list_lessons` | List all lessons in a course |\n| `zoho_learn_create_lesson` | Create a new lesson in a course |\n| `zoho_learn_update_lesson` | Update lesson title or content |\n| `zoho_learn_create_quiz` | Create a quiz chapter in a course |\n| `zoho_learn_add_quiz_question` | Add a question to a quiz |\n| `zoho_learn_list_quiz_questions` | List all questions in a quiz |\n\n### eBay tools (2)\n| Tool | Description |\n|---|---|\n| `ebay_api` | Proxy any eBay REST API call (auto OAuth refresh) |\n| `ebay_trading_api` | Proxy any eBay Trading XML/SOAP call |",
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
                  summary: "List all tools",
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
                    params: { name: "zoho_link_po_to_salesorder", arguments: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" } }
                  }
                },
                convert_po_to_bill: {
                  summary: "Convert PO to Bill",
                  value: {
                    jsonrpc: "2.0",
                    id: "4",
                    method: "tools/call",
                    params: { name: "zoho_convert_po_to_bill", arguments: { purchaseorder_id: "PO-00001" } }
                  }
                },
                invoice_from_so: {
                  summary: "Create Invoice from Sales Order",
                  value: {
                    jsonrpc: "2.0",
                    id: "5",
                    method: "tools/call",
                    params: { name: "zoho_create_invoice_from_salesorder", arguments: { salesorder_id: "SO-00001" } }
                  }
                },
                ebay_call: {
                  summary: "eBay REST API call",
                  value: {
                    jsonrpc: "2.0",
                    id: "6",
                    method: "tools/call",
                    params: { name: "ebay_api", arguments: { method: "GET", path: "/sell/account/v1/privilege" } }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "JSON-RPC response",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    // ── Webhook ───────────────────────────────────────────────────────────────
    "/sync": {
      post: {
        tags: ["Webhook"],
        summary: "Trigger a Zoho workflow event via HTTP",
        description: "Accepts `event` + `payload` and executes the corresponding Zoho API call.\n\n**Supported events:** `confirm_salesorder`, `link_po_to_salesorder`",
        operationId: "syncWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["event", "payload"],
                properties: {
                  event: { type: "string", enum: ["confirm_salesorder", "link_po_to_salesorder"] },
                  payload: { type: "object" }
                }
              },
              examples: {
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: { event: "confirm_salesorder", payload: { salesorder_id: "SO-00001" } }
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: { event: "link_po_to_salesorder", payload: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" } }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Event handled",
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
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } }
          }
        }
      }
    },
    // ── eBay proxies ──────────────────────────────────────────────────────────
    "/ebay": {
      post: {
        tags: ["eBay"],
        summary: "eBay REST API proxy",
        description: "Proxies any eBay REST API call with automatic OAuth token refresh from `EBAY_REFRESH_TOKEN`.",
        operationId: "ebayProxy",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["method", "path"],
                properties: {
                  method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"], example: "GET" },
                  path: { type: "string", description: "eBay API path starting with /", example: "/sell/account/v1/privilege" },
                  body: { type: "object", description: "Optional JSON body for POST/PUT" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "eBay response forwarded as-is", content: { "application/json": { schema: { type: "object" } } } },
          "400": { description: "Missing method or path", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } }
        }
      }
    },
    "/ebay-trading": {
      post: {
        tags: ["eBay"],
        summary: "eBay Trading API proxy (XML/SOAP)",
        description: "Proxies any eBay Trading API call. Wraps params into XML SOAP envelope automatically.",
        operationId: "ebayTradingProxy",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["callName"],
                properties: {
                  callName: { type: "string", example: "GetMyeBaySelling" },
                  params: { type: "object", example: { ActiveList: { Include: true, Pagination: { EntriesPerPage: 200, PageNumber: 1 } }, DetailLevel: "ReturnAll" } }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Parsed eBay Trading API response", content: { "application/json": { schema: { type: "object" } } } },
          "400": { description: "Missing callName", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } }
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
  server2.registerTool(
    "zoho_convert_po_to_bill",
    {
      title: "Convert Purchase Order to Bill",
      description: `Convert an issued Purchase Order into a vendor Bill in Zoho Books. Use when you receive goods and need to record the vendor invoice.

Args:
  - purchaseorder_id (string): The PO ID to convert
  - bill_date (string, optional): Bill date YYYY-MM-DD (defaults to today)
  - due_date (string, optional): Bill due date YYYY-MM-DD
  - bill_number (string, optional): Vendor's invoice/bill number

Returns: Created bill with bill_id`,
      inputSchema: import_zod.z.object({
        purchaseorder_id: import_zod.z.string(),
        bill_date: import_zod.z.string().optional(),
        due_date: import_zod.z.string().optional(),
        bill_number: import_zod.z.string().optional().describe("Vendor's invoice number")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ purchaseorder_id, bill_date, due_date, bill_number }) => {
      try {
        const poRes = await inventoryClient.get(`/purchaseorders/${purchaseorder_id}`);
        const po = poRes.data.purchaseorder;
        const billPayload = {
          vendor_id: po.vendor_id,
          line_items: po.line_items,
          purchaseorder_ids: [purchaseorder_id],
          ...bill_date && { date: bill_date },
          ...due_date && { due_date },
          ...bill_number && { bill_number }
        };
        const billRes = await booksClient.post("/bills", billPayload);
        return { content: [{ type: "text", text: formatSuccess(billRes.data.bill) }] };
      } catch (e) {
        handleApiError(e, "zoho_convert_po_to_bill");
      }
    }
  );
  server2.registerTool(
    "zoho_create_invoice_from_salesorder",
    {
      title: "Create Invoice from Sales Order",
      description: `Create a Zoho Books invoice directly from a confirmed Sales Order. Copies line items, customer, and addresses automatically.

Args:
  - salesorder_id (string): The confirmed SO to invoice
  - invoice_date (string, optional): Invoice date YYYY-MM-DD (defaults to today)
  - due_date (string, optional): Payment due date YYYY-MM-DD
  - invoice_number (string, optional): Custom invoice number
  - notes (string, optional): Notes visible to customer

Returns: Created invoice with invoice_id and invoice_number`,
      inputSchema: import_zod.z.object({
        salesorder_id: import_zod.z.string().describe("Confirmed Sales Order ID"),
        invoice_date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        due_date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        invoice_number: import_zod.z.string().optional(),
        notes: import_zod.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ salesorder_id, invoice_date, due_date, invoice_number, notes }) => {
      try {
        const soRes = await inventoryClient.get(`/salesorders/${salesorder_id}`);
        const so = soRes.data.salesorder;
        const invoicePayload = {
          customer_id: so.customer_id,
          salesorder_id,
          line_items: so.line_items,
          ...invoice_date && { date: invoice_date },
          ...due_date && { due_date },
          ...invoice_number && { invoice_number },
          ...notes && { notes }
        };
        const invRes = await booksClient.post("/invoices", invoicePayload);
        return { content: [{ type: "text", text: formatSuccess(invRes.data.invoice) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_invoice_from_salesorder");
      }
    }
  );
}

// src/tools/zohoLearn.ts
var import_zod2 = require("zod");
function registerLearnTools(server2) {
  server2.registerTool(
    "zoho_learn_list_courses",
    {
      title: "List / Search Courses",
      description: `Search and list courses from Zoho Learn.

Args:
  - search (string, optional): Filter courses by name/keyword
  - status (string, optional): published, draft, archived
  - page (number, optional): Page number, default 1

Returns: List of courses with course_id, title, description, status, enrollment_count`,
      inputSchema: import_zod2.z.object({
        search: import_zod2.z.string().optional(),
        status: import_zod2.z.enum(["published", "draft", "archived"]).optional()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ search, status }) => {
      try {
        const params = { view: "author" };
        if (search)
          params.search = search;
        if (status)
          params.status = status;
        const res = await learnClient.get("/course", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_courses");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_get_course",
    {
      title: "Get Course Details",
      description: `Get full details of a specific course in Zoho Learn.

Args:
  - course_id (string): The Zoho Learn course ID

Returns: Complete course with modules, chapters, enrollment settings, and metadata`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_get_course");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_create_course",
    {
      title: "Create Course",
      description: `Create a new course in Zoho Learn.

Args:
  - title (string): Course title
  - description (string, optional): Course description
  - cover_image_url (string, optional): URL of the course cover image
  - category_id (string, optional): Course category ID
  - duration (number, optional): Estimated duration in minutes
  - tags (array, optional): List of tag strings

Returns: Created course with course_id`,
      inputSchema: import_zod2.z.object({
        title: import_zod2.z.string(),
        description: import_zod2.z.string().optional(),
        cover_image_url: import_zod2.z.string().optional(),
        category_id: import_zod2.z.string().optional(),
        duration: import_zod2.z.number().int().positive().optional().describe("Estimated duration in minutes"),
        tags: import_zod2.z.array(import_zod2.z.string()).optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await learnClient.post("/course", params);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_create_course");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_update_course",
    {
      title: "Update Course",
      description: `Update an existing course in Zoho Learn. Only provide fields to change.

Args:
  - course_id (string): The course ID to update
  - title (string, optional): New course title
  - description (string, optional): New description
  - category_id (string, optional): New category ID
  - duration (number, optional): Estimated duration in minutes
  - tags (array, optional): Replacement list of tags

Returns: Updated course`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        title: import_zod2.z.string().optional(),
        description: import_zod2.z.string().optional(),
        category_id: import_zod2.z.string().optional(),
        duration: import_zod2.z.number().int().positive().optional(),
        tags: import_zod2.z.array(import_zod2.z.string()).optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, ...body }) => {
      try {
        const res = await learnClient.put(`/course/${course_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_update_course");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_publish_course",
    {
      title: "Publish or Unpublish Course",
      description: `Change the published status of a course in Zoho Learn.

Args:
  - course_id (string): The course ID
  - action (string): "publish" to make the course live, "unpublish" to revert to draft

Returns: Updated course status`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        action: import_zod2.z.enum(["publish", "unpublish"])
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, action }) => {
      try {
        const res = await learnClient.post(`/course/${course_id}/${action}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_publish_course");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_enrollments",
    {
      title: "List Course Enrollments",
      description: `List learners enrolled in a specific course.

Args:
  - course_id (string): The course ID
  - status (string, optional): active, completed, not_started
  - page (number, optional): Page number, default 1

Returns: List of enrollments with user info, progress percentage, and completion date`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        status: import_zod2.z.enum(["active", "completed", "not_started"]).optional(),
        page: import_zod2.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, status, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (status)
          params.status = status;
        const res = await learnClient.get(`/course/${course_id}/member`, { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_enrollments");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_enroll_user",
    {
      title: "Enroll User in Course",
      description: `Enroll one or more users in a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - user_emails (array): List of user email addresses to enroll
  - due_date (string, optional): Completion due date YYYY-MM-DD

Returns: Enrollment result with success/failure per user`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        user_emails: import_zod2.z.array(import_zod2.z.string().email()).min(1),
        due_date: import_zod2.z.string().optional().describe("Completion due date YYYY-MM-DD")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ course_id, user_emails, due_date }) => {
      try {
        const body = { user_emails };
        if (due_date)
          body.due_date = due_date;
        const res = await learnClient.post(`/course/${course_id}/enrollments`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_enroll_user");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_get_user_progress",
    {
      title: "Get User Progress in Course",
      description: `Get a specific learner's progress in a course.

Args:
  - course_id (string): The course ID
  - user_email (string): The learner's email address

Returns: Progress details including completion percentage, time spent, module-level completion, and quiz scores`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        user_email: import_zod2.z.string().email()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, user_email }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/progress`, {
          params: { user_email }
        });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_get_user_progress");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_categories",
    {
      title: "List Course Categories",
      description: `List all course categories available in Zoho Learn.

Returns: List of categories with category_id, name, and course count`,
      inputSchema: import_zod2.z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async () => {
      try {
        const res = await learnClient.get("/categories");
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_categories");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_learners",
    {
      title: "List Learners",
      description: `List all learners (users) in the Zoho Learn portal.

Args:
  - search (string, optional): Filter by name or email
  - page (number, optional): Page number, default 1

Returns: List of learners with user_id, name, email, enrolled course count, and last active date`,
      inputSchema: import_zod2.z.object({
        search: import_zod2.z.string().optional(),
        page: import_zod2.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ search, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (search)
          params.search = search;
        const res = await learnClient.get("/learners", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_learners");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_create_quiz",
    {
      title: "Create Quiz",
      description: `Create a new quiz/assessment inside a Zoho Learn course. In Zoho Learn, a quiz is a chapter with type QUIZ. The returned chapter_id is what you pass to zoho_learn_add_quiz_question and zoho_learn_list_quiz_questions.

Args:
  - course_id (string): The course ID to add the quiz to
  - title (string): Quiz title
  - description (string, optional): Quiz description
  - module_id (string, optional): Module/section to place the quiz in
  - pass_percentage (number, optional): Minimum score percentage to pass (0-100)
  - max_attempts (number, optional): Maximum number of attempts allowed
  - time_limit (number, optional): Time limit in minutes

Returns: Created quiz chapter with chapter_id`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        title: import_zod2.z.string(),
        description: import_zod2.z.string().optional(),
        module_id: import_zod2.z.string().optional(),
        pass_percentage: import_zod2.z.number().min(0).max(100).optional(),
        max_attempts: import_zod2.z.number().int().positive().optional(),
        time_limit: import_zod2.z.number().int().positive().optional().describe("Time limit in minutes")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ course_id, title, description, module_id, pass_percentage, max_attempts, time_limit }) => {
      try {
        const body = { title };
        if (description)
          body.description = description;
        if (module_id)
          body.module_id = module_id;
        if (pass_percentage !== void 0)
          body.pass_percentage = pass_percentage;
        if (max_attempts)
          body.max_attempts = max_attempts;
        if (time_limit)
          body.time_limit = time_limit;
        const res = await learnClient.post(`/course/${course_id}/lesson`, { ...body, type: "QUIZ" });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_create_quiz");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_add_quiz_question",
    {
      title: "Add Quiz Question",
      description: `Add a question to a quiz in a Zoho Learn course. In Zoho Learn, a quiz is a chapter \u2014 pass the chapter_id of the quiz chapter here.

Args:
  - course_id (string): The course ID
  - chapter_id (string): The chapter ID of the quiz (returned by zoho_learn_create_quiz or zoho_learn_list_lessons)
  - question (string): The question text
  - question_type (string): single_choice, multiple_choice, true_false, fill_in_the_blank
  - options (array, optional): Answer options, each with text and is_correct flag. Required for choice-based questions.
  - explanation (string, optional): Explanation shown after answering
  - marks (number, optional): Points awarded for correct answer

Returns: Created question with question_id`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        chapter_id: import_zod2.z.string(),
        question: import_zod2.z.string(),
        question_type: import_zod2.z.enum(["single_choice", "multiple_choice", "true_false", "fill_in_the_blank"]),
        options: import_zod2.z.array(import_zod2.z.object({
          text: import_zod2.z.string(),
          is_correct: import_zod2.z.boolean()
        })).optional(),
        explanation: import_zod2.z.string().optional(),
        marks: import_zod2.z.number().positive().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ course_id, chapter_id, question, question_type, options, explanation, marks }) => {
      try {
        const body = { question, question_type };
        if (options)
          body.options = options;
        if (explanation)
          body.explanation = explanation;
        if (marks)
          body.marks = marks;
        const res = await learnClient.post(`/course/${course_id}/chapter/${chapter_id}/question`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_add_quiz_question");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_quiz_questions",
    {
      title: "List Quiz Questions",
      description: `List all questions in a quiz within a Zoho Learn course. In Zoho Learn, a quiz is a chapter \u2014 pass the chapter_id of the quiz chapter here.

Args:
  - course_id (string): The course ID
  - chapter_id (string): The chapter ID of the quiz (returned by zoho_learn_list_lessons)

Returns: List of questions with question_id, text, type, options, and marks`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        chapter_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, chapter_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/chapter/${chapter_id}/question`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_quiz_questions");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_lessons",
    {
      title: "List Lessons in a Course",
      description: `List all lessons in a Zoho Learn course with their IDs and metadata.

Args:
  - course_id (string): The course ID

Returns: List of lessons with lesson_id, title, type, module, and order`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/lesson`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_lessons");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_create_lesson",
    {
      title: "Create Text Lesson",
      description: `Create a new lesson inside a Zoho Learn course.

Args:
  - course_id (string): The course ID to add the lesson to
  - name (string): Lesson title
  - type (string, optional): TEXT (default), DOCUMENT, VIDEO, IMAGE, BLOCK, ASSIGNMENT

Returns: Created lesson with lesson id`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        name: import_zod2.z.string(),
        type: import_zod2.z.enum(["TEXT", "DOCUMENT", "VIDEO", "IMAGE", "BLOCK", "ASSIGNMENT"]).default("TEXT")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ course_id, name, type }) => {
      try {
        const body = { name, type };
        const res = await learnClient.post(`/course/${course_id}/lesson`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_create_lesson");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_update_lesson",
    {
      title: "Update Lesson Content",
      description: `Edit the content or title of an existing lesson in a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - lesson_id (string): The lesson ID to update
  - title (string, optional): New lesson title
  - content (string, optional): New HTML or plain text content

Returns: Updated lesson`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        lesson_id: import_zod2.z.string(),
        title: import_zod2.z.string().optional(),
        content: import_zod2.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, lesson_id, title, content }) => {
      try {
        const body = {};
        if (title)
          body.title = title;
        if (content)
          body.content = content;
        const res = await learnClient.put(`/course/${course_id}/chapter/${lesson_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_update_lesson");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_get_course_report",
    {
      title: "Get Course Completion Report",
      description: `Get completion rates, scores, and time spent for a course.

Args:
  - course_id (string): The course ID

Returns: Completion rate, average score, average time spent, pass/fail counts`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/report`, { params: { isMemberView: false } });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_get_course_report");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_list_all_progress",
    {
      title: "List All Learner Progress in a Course",
      description: `Get progress of all enrolled learners across a course \u2014 not just one user.

Args:
  - course_id (string): The course ID
  - status (string, optional): completed, in_progress, not_started

Returns: List of learners with completion percentage, score, time spent, and completion date`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        status: import_zod2.z.enum(["completed", "in_progress", "not_started"]).optional()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, status }) => {
      try {
        const params = {};
        if (status)
          params.status = status;
        const res = await learnClient.get(`/course/${course_id}/report`, { params: { ...params, isMemberView: true } });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_list_all_progress");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_remove_enrollment",
    {
      title: "Remove Enrollment",
      description: `Unenroll a user from a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - user_email (string): Email of the learner to unenroll

Returns: Confirmation of removal`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string(),
        user_email: import_zod2.z.string().email()
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
    },
    async ({ course_id, user_email }) => {
      try {
        const res = await learnClient.delete(`/course/${course_id}/enrollments`, {
          data: { user_email }
        });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_remove_enrollment");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_create_category",
    {
      title: "Create Course Category",
      description: `Create a new category to organize courses in Zoho Learn.

Args:
  - name (string): Category name
  - description (string, optional): Category description

Returns: Created category with category_id`,
      inputSchema: import_zod2.z.object({
        name: import_zod2.z.string(),
        description: import_zod2.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ name, description }) => {
      try {
        const body = { name };
        if (description)
          body.description = description;
        const res = await learnClient.post("/category", body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_create_category");
      }
    }
  );
  server2.registerTool(
    "zoho_learn_delete_course",
    {
      title: "Delete Course",
      description: `Permanently delete a course from Zoho Learn. This action cannot be undone.

Args:
  - course_id (string): The course ID to delete

Returns: Confirmation of deletion`,
      inputSchema: import_zod2.z.object({
        course_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.delete(`/course/${course_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_learn_delete_course");
      }
    }
  );
}

// src/tools/ebay.ts
var import_zod3 = require("zod");

// src/services/ebayClient.ts
var import_axios2 = __toESM(require("axios"));
var import_fast_xml_parser = require("fast-xml-parser");
var tokenCache = null;
async function getAccessToken2() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  const refreshToken = process.env.EBAY_REFRESH_TOKEN;
  if (!appId || !certId || !refreshToken) {
    throw new Error("Missing EBAY_APP_ID, EBAY_CERT_ID, or EBAY_REFRESH_TOKEN");
  }
  const scope = process.env.EBAY_SCOPES ?? "https://api.ebay.com/oauth/api_scope";
  const basic = Buffer.from(`${appId}:${certId}`).toString("base64");
  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", refreshToken);
  params.set("scope", scope);
  const resp = await import_axios2.default.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    params.toString(),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  const token = resp.data.access_token;
  const expiresIn = resp.data.expires_in ?? 7200;
  tokenCache = { token, expiresAt: Date.now() + (expiresIn - 60) * 1e3 };
  return token;
}
async function callEbayApi(method, path, body) {
  const token = await getAccessToken2();
  const resp = await import_axios2.default.request({
    method,
    url: `https://api.ebay.com${path}`,
    data: body,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    validateStatus: () => true
  });
  return { status: resp.status, data: resp.data };
}
async function callEbayTradingApi(callName, params = {}) {
  const token = await getAccessToken2();
  const rootName = `${callName}Request`;
  const requestObj = {
    [rootName]: {
      "@_xmlns": "urn:ebay:apis:eBLBaseComponents",
      RequesterCredentials: { eBayAuthToken: token },
      ...params
    }
  };
  const builder = new import_fast_xml_parser.XMLBuilder({
    ignoreAttributes: false,
    format: false,
    suppressEmptyNode: false
  });
  const xmlBody = '<?xml version="1.0" encoding="utf-8"?>\n' + builder.build(requestObj);
  const resp = await import_axios2.default.post("https://api.ebay.com/ws/api.dll", xmlBody, {
    headers: {
      "X-EBAY-API-SITEID": "0",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
      "X-EBAY-API-CALL-NAME": callName,
      "X-EBAY-API-IAF-TOKEN": token,
      "Content-Type": "text/xml"
    },
    responseType: "text",
    transformResponse: (x) => x,
    validateStatus: () => true
  });
  const parser = new import_fast_xml_parser.XMLParser({
    ignoreAttributes: true,
    parseTagValue: true,
    trimValues: true
  });
  const parsed = parser.parse(resp.data);
  const unwrapped = parsed && typeof parsed === "object" && `${callName}Response` in parsed ? parsed[`${callName}Response`] : parsed;
  return { status: resp.status, data: unwrapped };
}

// src/tools/ebay.ts
function registerEbayTools(server2) {
  server2.registerTool(
    "ebay_api",
    {
      title: "eBay API Proxy",
      description: `Call any eBay API endpoint via the proxy. Uses a cached OAuth access token that is auto-refreshed from EBAY_REFRESH_TOKEN.

Args:
  - method (string): HTTP method \u2014 GET, POST, PUT, or DELETE
  - path (string): eBay API path starting with "/" (e.g. /sell/account/v1/privilege)
  - body (object, optional): JSON body for POST/PUT requests

Returns: { status, data } \u2014 the eBay response status code and parsed body as-is`,
      inputSchema: import_zod3.z.object({
        method: import_zod3.z.enum(["GET", "POST", "PUT", "DELETE"]),
        path: import_zod3.z.string().regex(/^\//, "path must start with /"),
        body: import_zod3.z.record(import_zod3.z.unknown()).optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
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
  server2.registerTool(
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

Returns: { status, data } \u2014 HTTP status and the parsed XML response (unwrapped from the {callName}Response envelope)`,
      inputSchema: import_zod3.z.object({
        callName: import_zod3.z.string().min(1),
        params: import_zod3.z.record(import_zod3.z.unknown()).optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true }
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

// src/index.ts
var server = new import_mcp.McpServer({
  name: "zoho-common-endpoints",
  version: "1.0.0"
});
registerCommonTools(server);
registerLearnTools(server);
registerEbayTools(server);
var TOOLS = {
  workflow: [
    "zoho_confirm_salesorder",
    "zoho_link_po_to_salesorder",
    "zoho_convert_po_to_bill",
    "zoho_create_invoice_from_salesorder"
  ],
  zoho_learn: [
    "zoho_learn_list_courses",
    "zoho_learn_get_course",
    "zoho_learn_create_course",
    "zoho_learn_update_course",
    "zoho_learn_publish_course",
    "zoho_learn_delete_course",
    "zoho_learn_list_enrollments",
    "zoho_learn_enroll_user",
    "zoho_learn_remove_enrollment",
    "zoho_learn_get_user_progress",
    "zoho_learn_list_all_progress",
    "zoho_learn_get_course_report",
    "zoho_learn_list_learners",
    "zoho_learn_list_categories",
    "zoho_learn_create_category",
    "zoho_learn_list_lessons",
    "zoho_learn_create_lesson",
    "zoho_learn_update_lesson",
    "zoho_learn_create_quiz",
    "zoho_learn_add_quiz_question",
    "zoho_learn_list_quiz_questions"
  ],
  ebay: [
    "ebay_api",
    "ebay_trading_api"
  ]
};
var TOOLS_COUNT = Object.values(TOOLS).reduce((n, arr) => n + arr.length, 0);
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
  app.post("/ebay", async (req, res) => {
    try {
      const { method, path, body } = req.body ?? {};
      if (!method || !path) {
        res.status(400).json({ error: "method and path are required" });
        return;
      }
      const result = await callEbayApi(method, path, body);
      res.status(result.status).json(result.data);
    } catch (err) {
      const e = err;
      res.status(e.response?.status ?? 500).json(e.response?.data ?? { error: e.message ?? "Unknown error" });
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
    } catch (err) {
      const e = err;
      res.status(e.response?.status ?? 500).json(e.response?.data ?? { error: e.message ?? "Unknown error" });
    }
  });
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
