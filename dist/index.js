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
var import_express = __toESM(require("express"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));

// src/swagger.ts
var swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Zoho MCP Server",
    version: "1.0.0",
    description: "MCP (Model Context Protocol) server exposing Zoho Books, Zoho Inventory, Zoho Learn, and eBay integrations. The primary interface is the MCP Streamable HTTP transport at `POST /mcp`. Direct REST proxies for eBay are also available.",
    contact: {
      email: "vineet@mctoolsusa.com"
    }
  },
  servers: [
    {
      url: "https://zoho-mcp-server-production.up.railway.app",
      description: "Production (Railway)"
    },
    {
      url: "http://localhost:3000",
      description: "Local development"
    }
  ],
  tags: [
    { name: "System", description: "Health and status endpoints" },
    { name: "MCP", description: "Model Context Protocol transport endpoint" },
    { name: "eBay", description: "eBay REST and Trading API proxies" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description: "Returns server status. Used by Railway to verify the container is running.",
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
                    server: { type: "string", example: "zoho-mcp-server" },
                    version: { type: "string", example: "1.0.0" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/mcp": {
      get: {
        tags: ["MCP"],
        summary: "MCP endpoint info",
        description: "Returns a human-readable message confirming the MCP endpoint is reachable. Actual MCP communication uses POST.",
        operationId: "mcpInfo",
        responses: {
          "200": {
            description: "MCP endpoint is up",
            content: {
              "text/plain": {
                schema: { type: "string", example: "MCP endpoint is up. Use POST /mcp (Streamable HTTP)." }
              }
            }
          }
        }
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport",
        description: "Primary endpoint for all MCP tool calls. Claude and other MCP clients send JSON-RPC requests here. Each request creates a fresh stateless session.\n\n**Available MCP tools (38 total):**\n\n**Invoices (Zoho Books):** `zoho_list_invoices`, `zoho_get_invoice`, `zoho_create_invoice`, `zoho_update_invoice`, `zoho_mark_invoice_sent`, `zoho_void_invoice`\n\n**Sales Orders (Zoho Inventory):** `zoho_list_salesorders`, `zoho_get_salesorder`, `zoho_create_salesorder`, `zoho_update_salesorder`, `zoho_confirm_salesorder`\n\n**Purchase Orders (Zoho Inventory):** `zoho_list_purchaseorders`, `zoho_get_purchaseorder`, `zoho_create_purchaseorder`, `zoho_update_purchaseorder`, `zoho_issue_purchaseorder`, `zoho_convert_po_to_bill`\n\n**Dropshipments (Zoho Inventory):** `zoho_list_dropshipments`, `zoho_create_dropshipment`, `zoho_get_dropshipment`, `zoho_link_po_to_salesorder`\n\n**Bills (Zoho Books):** `zoho_list_bills`, `zoho_get_bill`, `zoho_create_bill`, `zoho_update_bill`\n\n**Contacts & Items:** `zoho_list_contacts`, `zoho_get_contact`, `zoho_create_contact`, `zoho_update_contact`, `zoho_list_items`, `zoho_get_item`, `zoho_create_item`, `zoho_update_item`\n\n**Zoho Learn:** `zoho_learn_list_courses`, `zoho_learn_get_course`, `zoho_learn_create_course`, `zoho_learn_update_course`, `zoho_learn_publish_course`, `zoho_learn_delete_course`, `zoho_learn_list_enrollments`, `zoho_learn_enroll_user`, `zoho_learn_remove_enrollment`, `zoho_learn_get_user_progress`, `zoho_learn_list_all_progress`, `zoho_learn_get_course_report`, `zoho_learn_list_learners`, `zoho_learn_list_categories`, `zoho_learn_create_category`, `zoho_learn_list_lessons`, `zoho_learn_create_lesson`, `zoho_learn_update_lesson`, `zoho_learn_create_quiz`, `zoho_learn_add_quiz_question`, `zoho_learn_list_quiz_questions`\n\n**eBay (via MCP):** `ebay_api`, `ebay_trading_api`",
        operationId: "mcpRequest",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "JSON-RPC 2.0 MCP request",
                properties: {
                  jsonrpc: { type: "string", enum: ["2.0"], example: "2.0" },
                  id: { type: "string", example: "1" },
                  method: {
                    type: "string",
                    description: "MCP method name",
                    example: "tools/call",
                    enum: ["initialize", "tools/list", "tools/call"]
                  },
                  params: {
                    type: "object",
                    description: "Method parameters",
                    example: {
                      name: "zoho_list_invoices",
                      arguments: { status: "unpaid", page: 1 }
                    }
                  }
                },
                required: ["jsonrpc", "method"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "JSON-RPC response with tool result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string", example: "2.0" },
                    id: { type: "string", example: "1" },
                    result: { type: "object" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/ebay": {
      post: {
        tags: ["eBay"],
        summary: "eBay REST API proxy",
        description: "Proxies any eBay REST API call. The server handles OAuth token refresh automatically using `EBAY_REFRESH_TOKEN`. Equivalent to the `ebay_api` MCP tool.",
        operationId: "ebayProxy",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["method", "path"],
                properties: {
                  method: {
                    type: "string",
                    enum: ["GET", "POST", "PUT", "DELETE"],
                    description: "HTTP method for the eBay API call",
                    example: "GET"
                  },
                  path: {
                    type: "string",
                    description: "eBay API path starting with /",
                    example: "/sell/account/v1/privilege"
                  },
                  body: {
                    type: "object",
                    description: "Optional JSON body for POST/PUT requests"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "eBay API response (status and data forwarded as-is)",
            content: {
              "application/json": {
                schema: { type: "object" }
              }
            }
          },
          "400": {
            description: "Missing required fields (method or path)",
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
    },
    "/ebay-trading": {
      post: {
        tags: ["eBay"],
        summary: "eBay Trading API proxy (XML/SOAP)",
        description: "Proxies any eBay Trading API call. Automatically wraps params into the XML SOAP envelope and uses the access token from `EBAY_REFRESH_TOKEN`. Equivalent to the `ebay_trading_api` MCP tool.",
        operationId: "ebayTradingProxy",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["callName"],
                properties: {
                  callName: {
                    type: "string",
                    description: "Trading API operation name",
                    example: "GetMyeBaySelling"
                  },
                  params: {
                    type: "object",
                    description: "Request body fields matching the Trading API XML schema",
                    example: {
                      ActiveList: {
                        Include: true,
                        Pagination: { EntriesPerPage: 200, PageNumber: 1 }
                      },
                      DetailLevel: "ReturnAll"
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Parsed XML response from eBay Trading API",
            content: {
              "application/json": {
                schema: { type: "object" }
              }
            }
          },
          "400": {
            description: "Missing callName",
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

// src/tools/invoices.ts
var import_zod = require("zod");

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

// src/tools/invoices.ts
var LineItemSchema = import_zod.z.object({
  item_id: import_zod.z.string().optional().describe("Zoho item ID"),
  name: import_zod.z.string().optional().describe("Item name (if no item_id)"),
  description: import_zod.z.string().optional(),
  quantity: import_zod.z.number().positive(),
  rate: import_zod.z.number().nonnegative(),
  unit: import_zod.z.string().optional(),
  tax_id: import_zod.z.string().optional(),
  hsn_or_sac: import_zod.z.string().optional().describe("HSN/SAC code for GST")
});
function registerInvoiceTools(server2) {
  server2.registerTool(
    "zoho_list_invoices",
    {
      title: "List / Search Invoices",
      description: `Search and list invoices from Zoho Books.

Args:
  - customer_name (string, optional): Filter by customer name (partial match)
  - status (string, optional): Filter by status: draft, sent, overdue, paid, void, unpaid, partially_paid
  - from_date (string, optional): Start date filter YYYY-MM-DD
  - to_date (string, optional): End date filter YYYY-MM-DD
  - page (number, optional): Page number for pagination (default: 1)

Returns: List of invoices with invoice_id, invoice_number, customer_name, date, total, status, balance`,
      inputSchema: import_zod.z.object({
        customer_name: import_zod.z.string().optional(),
        status: import_zod.z.enum(["draft", "sent", "overdue", "paid", "void", "unpaid", "partially_paid"]).optional(),
        from_date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        to_date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        page: import_zod.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ customer_name, status, from_date, to_date, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (customer_name)
          params.customer_name_contains = customer_name;
        if (status)
          params.status = status;
        if (from_date)
          params.date_start = from_date;
        if (to_date)
          params.date_end = to_date;
        const res = await booksClient.get("/invoices", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_invoices");
      }
    }
  );
  server2.registerTool(
    "zoho_get_invoice",
    {
      title: "Get Invoice Details",
      description: `Get full details of a specific invoice including all line items, payment history, and totals.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Complete invoice object with line items, totals, customer info, payment terms`,
      inputSchema: import_zod.z.object({
        invoice_id: import_zod.z.string().describe("Zoho invoice ID")
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.get(`/invoices/${invoice_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_invoice");
      }
    }
  );
  server2.registerTool(
    "zoho_create_invoice",
    {
      title: "Create Invoice",
      description: `Create a new invoice in Zoho Books.

Args:
  - customer_id (string): Zoho customer/contact ID
  - line_items (array): Array of line items with quantity, rate, item_id or name
  - date (string, optional): Invoice date YYYY-MM-DD (defaults to today)
  - due_date (string, optional): Due date YYYY-MM-DD
  - invoice_number (string, optional): Custom invoice number
  - notes (string, optional): Notes visible to customer
  - terms (string, optional): Terms and conditions
  - shipping_charge (number, optional): Shipping charge amount
  - salesorder_id (string, optional): Link to a sales order

Returns: Created invoice with invoice_id and invoice_number`,
      inputSchema: import_zod.z.object({
        customer_id: import_zod.z.string().describe("Zoho contact/customer ID"),
        line_items: import_zod.z.array(LineItemSchema).min(1),
        date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        due_date: import_zod.z.string().optional().describe("YYYY-MM-DD"),
        invoice_number: import_zod.z.string().optional(),
        notes: import_zod.z.string().optional(),
        terms: import_zod.z.string().optional(),
        shipping_charge: import_zod.z.number().nonnegative().optional(),
        salesorder_id: import_zod.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await booksClient.post("/invoices", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_invoice");
      }
    }
  );
  server2.registerTool(
    "zoho_update_invoice",
    {
      title: "Update Invoice",
      description: `Update an existing invoice in Zoho Books. Only provide fields you want to change.

Args:
  - invoice_id (string): The Zoho invoice ID to update
  - line_items / date / due_date / notes / terms / shipping_charge: Fields to update

Returns: Updated invoice object`,
      inputSchema: import_zod.z.object({
        invoice_id: import_zod.z.string(),
        customer_id: import_zod.z.string().optional(),
        line_items: import_zod.z.array(LineItemSchema).optional(),
        date: import_zod.z.string().optional(),
        due_date: import_zod.z.string().optional(),
        notes: import_zod.z.string().optional(),
        terms: import_zod.z.string().optional(),
        shipping_charge: import_zod.z.number().nonnegative().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ invoice_id, ...body }) => {
      try {
        const res = await booksClient.put(`/invoices/${invoice_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_invoice");
      }
    }
  );
  server2.registerTool(
    "zoho_mark_invoice_sent",
    {
      title: "Mark Invoice as Sent",
      description: `Mark an invoice status as 'sent'. Use after creating a draft invoice.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Success confirmation`,
      inputSchema: import_zod.z.object({
        invoice_id: import_zod.z.string()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.post(`/invoices/${invoice_id}/status/sent`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_mark_invoice_sent");
      }
    }
  );
  server2.registerTool(
    "zoho_void_invoice",
    {
      title: "Void Invoice",
      description: `Void/cancel an invoice. This cannot be undone easily.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Success confirmation`,
      inputSchema: import_zod.z.object({
        invoice_id: import_zod.z.string()
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.post(`/invoices/${invoice_id}/status/void`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_void_invoice");
      }
    }
  );
}

// src/tools/salesOrders.ts
var import_zod2 = require("zod");
var LineItemSchema2 = import_zod2.z.object({
  item_id: import_zod2.z.string().optional(),
  name: import_zod2.z.string().optional(),
  description: import_zod2.z.string().optional(),
  quantity: import_zod2.z.number().positive(),
  rate: import_zod2.z.number().nonnegative(),
  unit: import_zod2.z.string().optional(),
  tax_id: import_zod2.z.string().optional(),
  hsn_or_sac: import_zod2.z.string().optional()
});
var AddressSchema = import_zod2.z.object({
  address: import_zod2.z.string().optional(),
  city: import_zod2.z.string().optional(),
  state: import_zod2.z.string().optional(),
  zip: import_zod2.z.string().optional(),
  country: import_zod2.z.string().optional()
});
function registerSalesOrderTools(server2) {
  server2.registerTool(
    "zoho_list_salesorders",
    {
      title: "List / Search Sales Orders",
      description: `Search and list sales orders from Zoho Inventory.

Args:
  - customer_name (string, optional): Filter by customer name
  - status (string, optional): draft, confirmed, closed, void, invoiced, partially_invoiced
  - from_date / to_date (string, optional): Date range YYYY-MM-DD
  - page (number, optional): Page number (default: 1)

Returns: List of sales orders with salesorder_id, salesorder_number, customer_name, date, status, total`,
      inputSchema: import_zod2.z.object({
        customer_name: import_zod2.z.string().optional(),
        status: import_zod2.z.enum(["draft", "confirmed", "closed", "void", "invoiced", "partially_invoiced"]).optional(),
        from_date: import_zod2.z.string().optional(),
        to_date: import_zod2.z.string().optional(),
        page: import_zod2.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ customer_name, status, from_date, to_date, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (customer_name)
          params.customer_name_contains = customer_name;
        if (status)
          params.status = status;
        if (from_date)
          params.date_start = from_date;
        if (to_date)
          params.date_end = to_date;
        const res = await inventoryClient.get("/salesorders", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_salesorders");
      }
    }
  );
  server2.registerTool(
    "zoho_get_salesorder",
    {
      title: "Get Sales Order Details",
      description: `Get full details of a specific sales order including line items, dropshipment info, and linked documents.

Args:
  - salesorder_id (string): The Zoho sales order ID

Returns: Complete sales order object`,
      inputSchema: import_zod2.z.object({
        salesorder_id: import_zod2.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ salesorder_id }) => {
      try {
        const res = await inventoryClient.get(`/salesorders/${salesorder_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_salesorder");
      }
    }
  );
  server2.registerTool(
    "zoho_create_salesorder",
    {
      title: "Create Sales Order",
      description: `Create a new sales order in Zoho Inventory.

Args:
  - customer_id (string): Zoho customer/contact ID
  - line_items (array): Items with quantity, rate, item_id or name
  - date (string, optional): Order date YYYY-MM-DD
  - shipment_date (string, optional): Expected shipment date YYYY-MM-DD
  - salesorder_number (string, optional): Custom SO number
  - notes / terms (string, optional)
  - billing_address / shipping_address (object, optional)

Returns: Created sales order with salesorder_id`,
      inputSchema: import_zod2.z.object({
        customer_id: import_zod2.z.string(),
        line_items: import_zod2.z.array(LineItemSchema2).min(1),
        date: import_zod2.z.string().optional(),
        shipment_date: import_zod2.z.string().optional(),
        salesorder_number: import_zod2.z.string().optional(),
        notes: import_zod2.z.string().optional(),
        terms: import_zod2.z.string().optional(),
        billing_address: AddressSchema.optional(),
        shipping_address: AddressSchema.optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/salesorders", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_salesorder");
      }
    }
  );
  server2.registerTool(
    "zoho_update_salesorder",
    {
      title: "Update Sales Order",
      description: `Update an existing sales order. Only confirmed (not closed/invoiced) orders can be updated.

Args:
  - salesorder_id (string): The SO ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated sales order`,
      inputSchema: import_zod2.z.object({
        salesorder_id: import_zod2.z.string(),
        customer_id: import_zod2.z.string().optional(),
        line_items: import_zod2.z.array(LineItemSchema2).optional(),
        date: import_zod2.z.string().optional(),
        shipment_date: import_zod2.z.string().optional(),
        notes: import_zod2.z.string().optional(),
        terms: import_zod2.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ salesorder_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/salesorders/${salesorder_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_salesorder");
      }
    }
  );
  server2.registerTool(
    "zoho_confirm_salesorder",
    {
      title: "Confirm Sales Order",
      description: `Change a Sales Order status from draft to confirmed. Required before creating dropshipments.

Args:
  - salesorder_id (string): The SO ID to confirm

Returns: Success confirmation`,
      inputSchema: import_zod2.z.object({
        salesorder_id: import_zod2.z.string()
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
}

// src/tools/purchaseOrders.ts
var import_zod3 = require("zod");
var LineItemSchema3 = import_zod3.z.object({
  item_id: import_zod3.z.string().optional(),
  name: import_zod3.z.string().optional(),
  description: import_zod3.z.string().optional(),
  quantity: import_zod3.z.number().positive(),
  rate: import_zod3.z.number().nonnegative(),
  unit: import_zod3.z.string().optional(),
  tax_id: import_zod3.z.string().optional(),
  hsn_or_sac: import_zod3.z.string().optional()
});
function registerPurchaseOrderTools(server2) {
  server2.registerTool(
    "zoho_list_purchaseorders",
    {
      title: "List / Search Purchase Orders",
      description: `Search and list purchase orders from Zoho Inventory.

Args:
  - vendor_name (string, optional): Filter by vendor name
  - status (string, optional): draft, issued, billed, cancelled
  - from_date / to_date (string, optional): Date range YYYY-MM-DD
  - page (number, optional): Default 1

Returns: List of POs with purchaseorder_id, purchaseorder_number, vendor_name, date, status, total`,
      inputSchema: import_zod3.z.object({
        vendor_name: import_zod3.z.string().optional(),
        status: import_zod3.z.enum(["draft", "issued", "billed", "cancelled"]).optional(),
        from_date: import_zod3.z.string().optional(),
        to_date: import_zod3.z.string().optional(),
        page: import_zod3.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ vendor_name, status, from_date, to_date, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (vendor_name)
          params.vendor_name_contains = vendor_name;
        if (status)
          params.status = status;
        if (from_date)
          params.date_start = from_date;
        if (to_date)
          params.date_end = to_date;
        const res = await inventoryClient.get("/purchaseorders", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_purchaseorders");
      }
    }
  );
  server2.registerTool(
    "zoho_get_purchaseorder",
    {
      title: "Get Purchase Order Details",
      description: `Get full details of a specific purchase order.

Args:
  - purchaseorder_id (string): The Zoho PO ID

Returns: Complete PO with line items, vendor info, linked sales order, status`,
      inputSchema: import_zod3.z.object({
        purchaseorder_id: import_zod3.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ purchaseorder_id }) => {
      try {
        const res = await inventoryClient.get(`/purchaseorders/${purchaseorder_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_purchaseorder");
      }
    }
  );
  server2.registerTool(
    "zoho_create_purchaseorder",
    {
      title: "Create Purchase Order",
      description: `Create a new purchase order in Zoho Inventory. Can be linked to a Sales Order for dropship workflows.

Args:
  - vendor_id (string): Zoho vendor/contact ID
  - line_items (array): Items with quantity, rate
  - date (string, optional): PO date YYYY-MM-DD
  - delivery_date (string, optional): Expected delivery date YYYY-MM-DD
  - purchaseorder_number (string, optional): Custom PO number
  - salesorder_id (string, optional): Link to a Sales Order (for dropshipment)
  - notes (string, optional)

Returns: Created PO with purchaseorder_id`,
      inputSchema: import_zod3.z.object({
        vendor_id: import_zod3.z.string(),
        line_items: import_zod3.z.array(LineItemSchema3).min(1),
        date: import_zod3.z.string().optional(),
        delivery_date: import_zod3.z.string().optional(),
        purchaseorder_number: import_zod3.z.string().optional(),
        salesorder_id: import_zod3.z.string().optional().describe("Link to Sales Order for dropship"),
        notes: import_zod3.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/purchaseorders", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_purchaseorder");
      }
    }
  );
  server2.registerTool(
    "zoho_update_purchaseorder",
    {
      title: "Update Purchase Order",
      description: `Update an existing purchase order. Only draft/issued POs can be updated.

Args:
  - purchaseorder_id (string): The PO ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated PO`,
      inputSchema: import_zod3.z.object({
        purchaseorder_id: import_zod3.z.string(),
        vendor_id: import_zod3.z.string().optional(),
        line_items: import_zod3.z.array(LineItemSchema3).optional(),
        date: import_zod3.z.string().optional(),
        delivery_date: import_zod3.z.string().optional(),
        notes: import_zod3.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ purchaseorder_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/purchaseorders/${purchaseorder_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_purchaseorder");
      }
    }
  );
  server2.registerTool(
    "zoho_issue_purchaseorder",
    {
      title: "Issue / Approve Purchase Order",
      description: `Mark a Purchase Order as 'issued' (approved). This sends the PO to the vendor.

Args:
  - purchaseorder_id (string): The PO ID to issue

Returns: Success confirmation`,
      inputSchema: import_zod3.z.object({
        purchaseorder_id: import_zod3.z.string()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ purchaseorder_id }) => {
      try {
        const res = await inventoryClient.post(`/purchaseorders/${purchaseorder_id}/status/issued`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_issue_purchaseorder");
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
      inputSchema: import_zod3.z.object({
        purchaseorder_id: import_zod3.z.string(),
        bill_date: import_zod3.z.string().optional(),
        due_date: import_zod3.z.string().optional(),
        bill_number: import_zod3.z.string().optional().describe("Vendor's invoice number")
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
}

// src/tools/dropshipments.ts
var import_zod4 = require("zod");
function registerDropshipmentTools(server2) {
  server2.registerTool(
    "zoho_list_dropshipments",
    {
      title: "List Dropshipments",
      description: `List all dropshipments, optionally filtered by sales order or vendor.

Args:
  - salesorder_id (string, optional): Filter by linked sales order
  - page (number, optional): Default 1

Returns: List of dropshipments with status, linked SO and PO IDs`,
      inputSchema: import_zod4.z.object({
        salesorder_id: import_zod4.z.string().optional(),
        page: import_zod4.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ salesorder_id, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (salesorder_id)
          params.salesorder_id = salesorder_id;
        const res = await inventoryClient.get("/dropshipments", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_dropshipments");
      }
    }
  );
  server2.registerTool(
    "zoho_create_dropshipment",
    {
      title: "Create Dropshipment from Sales Order",
      description: `Create a dropshipment from a confirmed Sales Order. This automatically creates a Purchase Order to the supplier and links it to the customer's Sales Order.

IMPORTANT REQUIREMENTS before calling this:
1. Sales Order must be in 'confirmed' status (not draft or closed)
2. Line items must have a preferred vendor assigned in item settings
3. Items must be inventory type (not service items)

Use zoho_confirm_salesorder first if the SO is in draft status.

Args:
  - salesorder_id (string): The confirmed Sales Order ID to dropship
  - vendor_id (string, optional): Override vendor for all items
  - date (string, optional): Dropshipment date YYYY-MM-DD

Returns: Created dropshipment with dropshipment_id and linked purchaseorder_id`,
      inputSchema: import_zod4.z.object({
        salesorder_id: import_zod4.z.string().describe("Must be a confirmed Sales Order"),
        vendor_id: import_zod4.z.string().optional().describe("Override default vendor"),
        date: import_zod4.z.string().optional().describe("YYYY-MM-DD")
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ salesorder_id, vendor_id, date }) => {
      try {
        const soRes = await inventoryClient.get(`/salesorders/${salesorder_id}`);
        const so = soRes.data.salesorder;
        if (so.status === "draft") {
          return {
            content: [{
              type: "text",
              text: `Error: Sales Order ${so.salesorder_number} is in 'draft' status. Please confirm it first using zoho_confirm_salesorder before creating a dropshipment.`
            }]
          };
        }
        if (so.status === "closed" || so.status === "void") {
          return {
            content: [{
              type: "text",
              text: `Error: Sales Order ${so.salesorder_number} is '${so.status}'. Dropshipments can only be created from confirmed orders. If closed, use zoho_update_salesorder or create a new SO.`
            }]
          };
        }
        const payload = {
          salesorder_id,
          ...vendor_id && { vendor_id },
          ...date && { date }
        };
        const res = await inventoryClient.post("/dropshipments", payload);
        return { content: [{ type: "text", text: formatSuccess(res.data.dropshipment ?? res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_dropshipment");
      }
    }
  );
  server2.registerTool(
    "zoho_get_dropshipment",
    {
      title: "Get Dropshipment Details",
      description: `Get full details of a dropshipment including linked SO and PO.

Args:
  - dropshipment_id (string): The Zoho dropshipment ID

Returns: Complete dropshipment object with linked document IDs`,
      inputSchema: import_zod4.z.object({
        dropshipment_id: import_zod4.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ dropshipment_id }) => {
      try {
        const res = await inventoryClient.get(`/dropshipments/${dropshipment_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.dropshipment) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_dropshipment");
      }
    }
  );
  server2.registerTool(
    "zoho_link_po_to_salesorder",
    {
      title: "Link Purchase Order to Sales Order",
      description: `Link an existing Purchase Order to a Sales Order. Use this when you have already created a PO manually and want to associate it with a customer's Sales Order for tracking.

Args:
  - purchaseorder_id (string): Existing PO to link
  - salesorder_id (string): The customer's Sales Order to link to

Returns: Updated PO with salesorder reference`,
      inputSchema: import_zod4.z.object({
        purchaseorder_id: import_zod4.z.string(),
        salesorder_id: import_zod4.z.string()
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

// src/tools/bills.ts
var import_zod5 = require("zod");
var LineItemSchema4 = import_zod5.z.object({
  item_id: import_zod5.z.string().optional(),
  account_id: import_zod5.z.string().optional(),
  name: import_zod5.z.string().optional(),
  description: import_zod5.z.string().optional(),
  quantity: import_zod5.z.number().positive(),
  rate: import_zod5.z.number().nonnegative(),
  unit: import_zod5.z.string().optional(),
  tax_id: import_zod5.z.string().optional(),
  hsn_or_sac: import_zod5.z.string().optional()
});
function registerBillTools(server2) {
  server2.registerTool(
    "zoho_list_bills",
    {
      title: "List / Search Bills",
      description: `Search and list vendor bills from Zoho Books.

Args:
  - vendor_name (string, optional): Filter by vendor name
  - status (string, optional): open, overdue, paid, void, partially_paid
  - from_date / to_date (string, optional): Date range YYYY-MM-DD
  - page (number, optional): Default 1

Returns: List of bills with bill_id, bill_number, vendor_name, date, total, status, balance`,
      inputSchema: import_zod5.z.object({
        vendor_name: import_zod5.z.string().optional(),
        status: import_zod5.z.enum(["open", "overdue", "paid", "void", "partially_paid"]).optional(),
        from_date: import_zod5.z.string().optional(),
        to_date: import_zod5.z.string().optional(),
        page: import_zod5.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ vendor_name, status, from_date, to_date, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (vendor_name)
          params.vendor_name_contains = vendor_name;
        if (status)
          params.status = status;
        if (from_date)
          params.date_start = from_date;
        if (to_date)
          params.date_end = to_date;
        const res = await booksClient.get("/bills", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_bills");
      }
    }
  );
  server2.registerTool(
    "zoho_get_bill",
    {
      title: "Get Bill Details",
      description: `Get full details of a specific vendor bill.

Args:
  - bill_id (string): The Zoho bill ID

Returns: Complete bill with line items, vendor info, payment history`,
      inputSchema: import_zod5.z.object({
        bill_id: import_zod5.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ bill_id }) => {
      try {
        const res = await booksClient.get(`/bills/${bill_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_bill");
      }
    }
  );
  server2.registerTool(
    "zoho_create_bill",
    {
      title: "Create Vendor Bill",
      description: `Create a new vendor bill (accounts payable) in Zoho Books. Use when recording a vendor invoice.

Args:
  - vendor_id (string): Zoho vendor/contact ID
  - line_items (array): Items/services with quantity and rate
  - date (string, optional): Bill date YYYY-MM-DD
  - due_date (string, optional): Payment due date YYYY-MM-DD
  - bill_number (string, optional): Vendor's invoice reference number
  - purchaseorder_ids (array, optional): Link to existing POs
  - notes (string, optional)

Returns: Created bill with bill_id`,
      inputSchema: import_zod5.z.object({
        vendor_id: import_zod5.z.string(),
        line_items: import_zod5.z.array(LineItemSchema4).min(1),
        date: import_zod5.z.string().optional(),
        due_date: import_zod5.z.string().optional(),
        bill_number: import_zod5.z.string().optional().describe("Vendor's own invoice number"),
        purchaseorder_ids: import_zod5.z.array(import_zod5.z.string()).optional().describe("Link to PO(s)"),
        notes: import_zod5.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await booksClient.post("/bills", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_bill");
      }
    }
  );
  server2.registerTool(
    "zoho_update_bill",
    {
      title: "Update Bill",
      description: `Update an existing vendor bill. Only open/draft bills can be updated.

Args:
  - bill_id (string): The bill ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated bill`,
      inputSchema: import_zod5.z.object({
        bill_id: import_zod5.z.string(),
        vendor_id: import_zod5.z.string().optional(),
        line_items: import_zod5.z.array(LineItemSchema4).optional(),
        date: import_zod5.z.string().optional(),
        due_date: import_zod5.z.string().optional(),
        bill_number: import_zod5.z.string().optional(),
        notes: import_zod5.z.string().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ bill_id, ...body }) => {
      try {
        const res = await booksClient.put(`/bills/${bill_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_bill");
      }
    }
  );
}

// src/tools/contactsAndItems.ts
var import_zod6 = require("zod");
var AddressSchema2 = import_zod6.z.object({
  address: import_zod6.z.string().optional(),
  city: import_zod6.z.string().optional(),
  state: import_zod6.z.string().optional(),
  zip: import_zod6.z.string().optional(),
  country: import_zod6.z.string().optional()
});
function registerContactTools(server2) {
  server2.registerTool(
    "zoho_list_contacts",
    {
      title: "List / Search Contacts",
      description: `Search customers and vendors in Zoho Books.

Args:
  - contact_name (string, optional): Partial name search
  - contact_type (string, optional): customer, vendor
  - page (number, optional): Default 1

Returns: List of contacts with contact_id, contact_name, email, phone, contact_type`,
      inputSchema: import_zod6.z.object({
        contact_name: import_zod6.z.string().optional(),
        contact_type: import_zod6.z.enum(["customer", "vendor"]).optional(),
        page: import_zod6.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ contact_name, contact_type, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (contact_name)
          params.contact_name_contains = contact_name;
        if (contact_type)
          params.contact_type = contact_type;
        const res = await booksClient.get("/contacts", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_contacts");
      }
    }
  );
  server2.registerTool(
    "zoho_get_contact",
    {
      title: "Get Contact Details",
      description: `Get full details of a customer or vendor contact.

Args:
  - contact_id (string): The Zoho contact ID

Returns: Complete contact with addresses, payment terms, GST, outstanding balances`,
      inputSchema: import_zod6.z.object({
        contact_id: import_zod6.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ contact_id }) => {
      try {
        const res = await booksClient.get(`/contacts/${contact_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_contact");
      }
    }
  );
  server2.registerTool(
    "zoho_create_contact",
    {
      title: "Create Contact (Customer or Vendor)",
      description: `Create a new customer or vendor in Zoho Books.

Args:
  - contact_name (string): Display name
  - contact_type (string): 'customer' or 'vendor'
  - company_name (string, optional)
  - email / phone (string, optional)
  - billing_address / shipping_address (object, optional)
  - gst_no (string, optional): GST registration number
  - currency_code (string, optional): e.g. USD, INR
  - payment_terms (number, optional): Days (e.g. 30 for Net 30)

Returns: Created contact with contact_id`,
      inputSchema: import_zod6.z.object({
        contact_name: import_zod6.z.string(),
        contact_type: import_zod6.z.enum(["customer", "vendor"]),
        company_name: import_zod6.z.string().optional(),
        email: import_zod6.z.string().email().optional(),
        phone: import_zod6.z.string().optional(),
        billing_address: AddressSchema2.optional(),
        shipping_address: AddressSchema2.optional(),
        gst_no: import_zod6.z.string().optional(),
        currency_code: import_zod6.z.string().optional(),
        payment_terms: import_zod6.z.number().int().nonnegative().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await booksClient.post("/contacts", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_contact");
      }
    }
  );
  server2.registerTool(
    "zoho_update_contact",
    {
      title: "Update Contact",
      description: `Update an existing customer or vendor contact.

Args:
  - contact_id (string): The contact ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated contact`,
      inputSchema: import_zod6.z.object({
        contact_id: import_zod6.z.string(),
        contact_name: import_zod6.z.string().optional(),
        company_name: import_zod6.z.string().optional(),
        email: import_zod6.z.string().email().optional(),
        phone: import_zod6.z.string().optional(),
        billing_address: AddressSchema2.optional(),
        shipping_address: AddressSchema2.optional(),
        gst_no: import_zod6.z.string().optional(),
        currency_code: import_zod6.z.string().optional(),
        payment_terms: import_zod6.z.number().int().nonnegative().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ contact_id, ...body }) => {
      try {
        const res = await booksClient.put(`/contacts/${contact_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_contact");
      }
    }
  );
}
function registerItemTools(server2) {
  server2.registerTool(
    "zoho_list_items",
    {
      title: "List / Search Inventory Items",
      description: `Search and list items/products from Zoho Inventory.

Args:
  - name (string, optional): Partial name search
  - sku (string, optional): Filter by SKU
  - page (number, optional): Default 1

Returns: List of items with item_id, name, sku, rate, stock_on_hand, vendor info`,
      inputSchema: import_zod6.z.object({
        name: import_zod6.z.string().optional(),
        sku: import_zod6.z.string().optional(),
        page: import_zod6.z.number().int().min(1).default(1)
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async ({ name, sku, page }) => {
      try {
        const params = { page, per_page: 25 };
        if (name)
          params.name_contains = name;
        if (sku)
          params.sku = sku;
        const res = await inventoryClient.get("/items", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) {
        handleApiError(e, "zoho_list_items");
      }
    }
  );
  server2.registerTool(
    "zoho_get_item",
    {
      title: "Get Item Details",
      description: `Get full details of an inventory item including stock levels, vendor, pricing.

Args:
  - item_id (string): The Zoho item ID

Returns: Complete item with stock, pricing, vendor, HSN code`,
      inputSchema: import_zod6.z.object({
        item_id: import_zod6.z.string()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ item_id }) => {
      try {
        const res = await inventoryClient.get(`/items/${item_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) {
        handleApiError(e, "zoho_get_item");
      }
    }
  );
  server2.registerTool(
    "zoho_create_item",
    {
      title: "Create Inventory Item",
      description: `Create a new product/item in Zoho Inventory.

Args:
  - name (string): Product name
  - rate (number): Selling price
  - purchase_rate (number, optional): Purchase/cost price
  - unit (string, optional): e.g. Pcs, Kg, Box
  - sku (string, optional): Stock keeping unit code
  - description (string, optional)
  - hsn_or_sac (string, optional): HSN code for GST
  - vendor_id (string, optional): Preferred vendor (required for dropshipment)
  - reorder_level (number, optional): Stock reorder trigger level

Returns: Created item with item_id`,
      inputSchema: import_zod6.z.object({
        name: import_zod6.z.string(),
        rate: import_zod6.z.number().nonnegative(),
        purchase_rate: import_zod6.z.number().nonnegative().optional(),
        unit: import_zod6.z.string().optional(),
        sku: import_zod6.z.string().optional(),
        description: import_zod6.z.string().optional(),
        hsn_or_sac: import_zod6.z.string().optional(),
        vendor_id: import_zod6.z.string().optional().describe("Preferred vendor \u2014 required for dropshipment"),
        reorder_level: import_zod6.z.number().nonnegative().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/items", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) {
        handleApiError(e, "zoho_create_item");
      }
    }
  );
  server2.registerTool(
    "zoho_update_item",
    {
      title: "Update Inventory Item",
      description: `Update an existing inventory item. Also use this to assign/change a preferred vendor (needed for dropshipment).

Args:
  - item_id (string): The item ID to update
  - vendor_id (string, optional): Set/change preferred vendor for dropshipment
  - Other fields: Same as create

Returns: Updated item`,
      inputSchema: import_zod6.z.object({
        item_id: import_zod6.z.string(),
        name: import_zod6.z.string().optional(),
        rate: import_zod6.z.number().nonnegative().optional(),
        purchase_rate: import_zod6.z.number().nonnegative().optional(),
        unit: import_zod6.z.string().optional(),
        sku: import_zod6.z.string().optional(),
        description: import_zod6.z.string().optional(),
        hsn_or_sac: import_zod6.z.string().optional(),
        vendor_id: import_zod6.z.string().optional().describe("Set preferred vendor for dropshipment"),
        reorder_level: import_zod6.z.number().nonnegative().optional()
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ item_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/items/${item_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) {
        handleApiError(e, "zoho_update_item");
      }
    }
  );
}

// src/tools/zohoLearn.ts
var import_zod7 = require("zod");
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
      inputSchema: import_zod7.z.object({
        search: import_zod7.z.string().optional(),
        status: import_zod7.z.enum(["published", "draft", "archived"]).optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string()
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
      inputSchema: import_zod7.z.object({
        title: import_zod7.z.string(),
        description: import_zod7.z.string().optional(),
        cover_image_url: import_zod7.z.string().optional(),
        category_id: import_zod7.z.string().optional(),
        duration: import_zod7.z.number().int().positive().optional().describe("Estimated duration in minutes"),
        tags: import_zod7.z.array(import_zod7.z.string()).optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        title: import_zod7.z.string().optional(),
        description: import_zod7.z.string().optional(),
        category_id: import_zod7.z.string().optional(),
        duration: import_zod7.z.number().int().positive().optional(),
        tags: import_zod7.z.array(import_zod7.z.string()).optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        action: import_zod7.z.enum(["publish", "unpublish"])
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        status: import_zod7.z.enum(["active", "completed", "not_started"]).optional(),
        page: import_zod7.z.number().int().min(1).default(1)
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        user_emails: import_zod7.z.array(import_zod7.z.string().email()).min(1),
        due_date: import_zod7.z.string().optional().describe("Completion due date YYYY-MM-DD")
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        user_email: import_zod7.z.string().email()
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
      inputSchema: import_zod7.z.object({}),
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
      inputSchema: import_zod7.z.object({
        search: import_zod7.z.string().optional(),
        page: import_zod7.z.number().int().min(1).default(1)
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        title: import_zod7.z.string(),
        description: import_zod7.z.string().optional(),
        module_id: import_zod7.z.string().optional(),
        pass_percentage: import_zod7.z.number().min(0).max(100).optional(),
        max_attempts: import_zod7.z.number().int().positive().optional(),
        time_limit: import_zod7.z.number().int().positive().optional().describe("Time limit in minutes")
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        chapter_id: import_zod7.z.string(),
        question: import_zod7.z.string(),
        question_type: import_zod7.z.enum(["single_choice", "multiple_choice", "true_false", "fill_in_the_blank"]),
        options: import_zod7.z.array(import_zod7.z.object({
          text: import_zod7.z.string(),
          is_correct: import_zod7.z.boolean()
        })).optional(),
        explanation: import_zod7.z.string().optional(),
        marks: import_zod7.z.number().positive().optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        chapter_id: import_zod7.z.string()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        name: import_zod7.z.string(),
        type: import_zod7.z.enum(["TEXT", "DOCUMENT", "VIDEO", "IMAGE", "BLOCK", "ASSIGNMENT"]).default("TEXT")
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        lesson_id: import_zod7.z.string(),
        title: import_zod7.z.string().optional(),
        content: import_zod7.z.string().optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        status: import_zod7.z.enum(["completed", "in_progress", "not_started"]).optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string(),
        user_email: import_zod7.z.string().email()
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
      inputSchema: import_zod7.z.object({
        name: import_zod7.z.string(),
        description: import_zod7.z.string().optional()
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
      inputSchema: import_zod7.z.object({
        course_id: import_zod7.z.string()
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
var import_zod8 = require("zod");

// src/services/ebayClient.ts
var import_axios2 = __toESM(require("axios"));

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}
var DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  "hasOwnProperty",
  "toString",
  "valueOf",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
];
var criticalProperties = ["__proto__", "constructor", "prototype"];

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err)
        return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err)
                return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  jPath: true,
  // if true, pass jPath string to callbacks; if false, pass matcher instance
  onDangerousProperty: defaultOnDangerousProperty
};
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== "string") {
    return;
  }
  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
  if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}
function normalizeProcessEntities(value) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      // true or false
      maxEntitySize: 1e4,
      maxExpansionDepth: 10,
      maxTotalExpansions: 1e3,
      maxExpandedLength: 1e5,
      maxEntityCount: 100,
      allowedTags: null,
      tagFilter: null
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions2, options);
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
    { value: built.attributesGroupName, name: "attributesGroupName" },
    { value: built.textNodeName, name: "textNodeName" },
    { value: built.cdataPropName, name: "cdataPropName" },
    { value: built.commentPropName, name: "commentPropName" }
  ];
  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }
  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }
  built.processEntities = normalizeProcessEntities(built.processEntities);
  built.unpairedTagsSet = new Set(built.unpairedTags);
  if (built.stopNodes && Array.isArray(built.stopNodes)) {
    built.stopNodes = built.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  return built;
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__")
      key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__")
      node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(options) {
    this.suppressValidationErr = !options;
    this.options = options;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                throw new Error(
                  `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                );
              }
              const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              entities[entityName] = {
                regx: RegExp(`&${escaped};`, "g"),
                val
              };
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i))
            comment = true;
          else
            throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      i++;
    }
    let entityName = xmlData.substring(startIndex, i);
    validateEntityName(entityName);
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
      throw new Error(
        `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
      );
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let notationName = xmlData.substring(startIndex, i);
    !this.suppressValidationErr && validateEntityName(notationName);
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    const startIndex = i;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      i++;
    }
    identifierVal = xmlData.substring(startIndex, i);
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    if (!this.suppressValidationErr && !isName(elementName)) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i))
      i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i))
      i += 2;
    else if (xmlData[i] === "(") {
      i++;
      const startIndex2 = i;
      while (i < xmlData.length && xmlData[i] !== ")") {
        i++;
      }
      contentModel = xmlData.substring(startIndex2, i);
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    validateEntityName(elementName);
    i = skipWhitespace(xmlData, i);
    startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let attributeName = xmlData.substring(startIndex, i);
    if (!validateEntityName(attributeName)) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        const startIndex2 = i;
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          i++;
        }
        let notation = xmlData.substring(startIndex2, i);
        notation = notation.trim();
        if (!validateEntityName(notation)) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      const startIndex2 = i;
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        i++;
      }
      attributeType += xmlData.substring(startIndex2, i);
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1])
      return false;
  }
  return true;
}
function validateEntityName(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  // oct: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  //skipLike: /regex/,
  infinity: "original"
  // "null", "infinity" (Infinity type), "string" ("Infinity" (the string literal))
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string")
    return str;
  let trimmedStr = str.trim();
  if (trimmedStr.length === 0)
    return str;
  else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr))
    return str;
  else if (trimmedStr === "0")
    return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0)
          return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation)
            return num;
          else
            return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0")
            return num;
          else if (parsedStr === numTrimmedByZeros)
            return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`)
            return num;
          else
            return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation)
    return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros)
      return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (leadingZeros.length > 0) {
      if (options.leadingZeros && !eAdjacentToLeadingZeros) {
        trimmedStr = (notation[1] || "") + notation[3];
        return Number(trimmedStr);
      } else
        return str;
    } else {
      return Number(trimmedStr);
    }
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".")
      numStr = "0";
    else if (numStr[0] === ".")
      numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".")
      numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  if (parseInt)
    return parseInt(numStr, base);
  else if (Number.parseInt)
    return Number.parseInt(numStr, base);
  else if (window && window.parseInt)
    return window.parseInt(numStr, base);
  else
    throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/path-expression-matcher/src/Expression.js
var Expression = class {
  /**
   * Create a new Expression
   * @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
   * @param {Object} options - Configuration options
   * @param {string} options.separator - Path separator (default: '.')
   */
  constructor(pattern, options = {}, data) {
    this.pattern = pattern;
    this.separator = options.separator || ".";
    this.segments = this._parse(pattern);
    this.data = data;
    this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
    this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
    this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
  }
  /**
   * Parse pattern string into segments
   * @private
   * @param {string} pattern - Pattern to parse
   * @returns {Array} Array of segment objects
   */
  _parse(pattern) {
    const segments = [];
    let i = 0;
    let currentPart = "";
    while (i < pattern.length) {
      if (pattern[i] === this.separator) {
        if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
            currentPart = "";
          }
          segments.push({ type: "deep-wildcard" });
          i += 2;
        } else {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
          }
          currentPart = "";
          i++;
        }
      } else {
        currentPart += pattern[i];
        i++;
      }
    }
    if (currentPart.trim()) {
      segments.push(this._parseSegment(currentPart.trim()));
    }
    return segments;
  }
  /**
   * Parse a single segment
   * @private
   * @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
   * @returns {Object} Segment object
   */
  _parseSegment(part) {
    const segment = { type: "tag" };
    let bracketContent = null;
    let withoutBrackets = part;
    const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
    if (bracketMatch) {
      withoutBrackets = bracketMatch[1] + bracketMatch[3];
      if (bracketMatch[2]) {
        const content = bracketMatch[2].slice(1, -1);
        if (content) {
          bracketContent = content;
        }
      }
    }
    let namespace = void 0;
    let tagAndPosition = withoutBrackets;
    if (withoutBrackets.includes("::")) {
      const nsIndex = withoutBrackets.indexOf("::");
      namespace = withoutBrackets.substring(0, nsIndex).trim();
      tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
      if (!namespace) {
        throw new Error(`Invalid namespace in pattern: ${part}`);
      }
    }
    let tag = void 0;
    let positionMatch = null;
    if (tagAndPosition.includes(":")) {
      const colonIndex = tagAndPosition.lastIndexOf(":");
      const tagPart = tagAndPosition.substring(0, colonIndex).trim();
      const posPart = tagAndPosition.substring(colonIndex + 1).trim();
      const isPositionKeyword = ["first", "last", "odd", "even"].includes(posPart) || /^nth\(\d+\)$/.test(posPart);
      if (isPositionKeyword) {
        tag = tagPart;
        positionMatch = posPart;
      } else {
        tag = tagAndPosition;
      }
    } else {
      tag = tagAndPosition;
    }
    if (!tag) {
      throw new Error(`Invalid segment pattern: ${part}`);
    }
    segment.tag = tag;
    if (namespace) {
      segment.namespace = namespace;
    }
    if (bracketContent) {
      if (bracketContent.includes("=")) {
        const eqIndex = bracketContent.indexOf("=");
        segment.attrName = bracketContent.substring(0, eqIndex).trim();
        segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
      } else {
        segment.attrName = bracketContent.trim();
      }
    }
    if (positionMatch) {
      const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
      if (nthMatch) {
        segment.position = "nth";
        segment.positionValue = parseInt(nthMatch[1], 10);
      } else {
        segment.position = positionMatch;
      }
    }
    return segment;
  }
  /**
   * Get the number of segments
   * @returns {number}
   */
  get length() {
    return this.segments.length;
  }
  /**
   * Check if expression contains deep wildcard
   * @returns {boolean}
   */
  hasDeepWildcard() {
    return this._hasDeepWildcard;
  }
  /**
   * Check if expression has attribute conditions
   * @returns {boolean}
   */
  hasAttributeCondition() {
    return this._hasAttributeCondition;
  }
  /**
   * Check if expression has position selectors
   * @returns {boolean}
   */
  hasPositionSelector() {
    return this._hasPositionSelector;
  }
  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.pattern;
  }
};

// node_modules/path-expression-matcher/src/ExpressionSet.js
var ExpressionSet = class {
  constructor() {
    this._byDepthAndTag = /* @__PURE__ */ new Map();
    this._wildcardByDepth = /* @__PURE__ */ new Map();
    this._deepWildcards = [];
    this._patterns = /* @__PURE__ */ new Set();
    this._sealed = false;
  }
  /**
   * Add an Expression to the set.
   * Duplicate patterns (same pattern string) are silently ignored.
   *
   * @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
   * @returns {this} for chaining
   * @throws {TypeError} if called after seal()
   *
   * @example
   * set.add(new Expression('root.users.user'));
   * set.add(new Expression('..script'));
   */
  add(expression) {
    if (this._sealed) {
      throw new TypeError(
        "ExpressionSet is sealed. Create a new ExpressionSet to add more expressions."
      );
    }
    if (this._patterns.has(expression.pattern))
      return this;
    this._patterns.add(expression.pattern);
    if (expression.hasDeepWildcard()) {
      this._deepWildcards.push(expression);
      return this;
    }
    const depth = expression.length;
    const lastSeg = expression.segments[expression.segments.length - 1];
    const tag = lastSeg?.tag;
    if (!tag || tag === "*") {
      if (!this._wildcardByDepth.has(depth))
        this._wildcardByDepth.set(depth, []);
      this._wildcardByDepth.get(depth).push(expression);
    } else {
      const key = `${depth}:${tag}`;
      if (!this._byDepthAndTag.has(key))
        this._byDepthAndTag.set(key, []);
      this._byDepthAndTag.get(key).push(expression);
    }
    return this;
  }
  /**
   * Add multiple expressions at once.
   *
   * @param {import('./Expression.js').default[]} expressions - Array of Expression instances
   * @returns {this} for chaining
   *
   * @example
   * set.addAll([
   *   new Expression('root.users.user'),
   *   new Expression('root.config.setting'),
   * ]);
   */
  addAll(expressions) {
    for (const expr of expressions)
      this.add(expr);
    return this;
  }
  /**
   * Check whether a pattern string is already present in the set.
   *
   * @param {import('./Expression.js').default} expression
   * @returns {boolean}
   */
  has(expression) {
    return this._patterns.has(expression.pattern);
  }
  /**
   * Number of expressions in the set.
   * @type {number}
   */
  get size() {
    return this._patterns.size;
  }
  /**
   * Seal the set against further modifications.
   * Useful to prevent accidental mutations after config is built.
   * Calling add() or addAll() on a sealed set throws a TypeError.
   *
   * @returns {this}
   */
  seal() {
    this._sealed = true;
    return this;
  }
  /**
   * Whether the set has been sealed.
   * @type {boolean}
   */
  get isSealed() {
    return this._sealed;
  }
  /**
   * Test whether the matcher's current path matches any expression in the set.
   *
   * Evaluation order (cheapest → most expensive):
   *  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
   *  2. Depth-only wildcard bucket — O(1) lookup, rare
   *  3. Deep-wildcard list         — always checked, but usually small
   *
   * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
   * @returns {boolean} true if any expression matches the current path
   *
   * @example
   * if (stopNodes.matchesAny(matcher)) {
   *   // handle stop node
   * }
   */
  matchesAny(matcher) {
    return this.findMatch(matcher) !== null;
  }
  /**
  * Find and return the first Expression that matches the matcher's current path.
  *
  * Uses the same evaluation order as matchesAny (cheapest → most expensive):
  *  1. Exact depth + tag bucket
  *  2. Depth-only wildcard bucket
  *  3. Deep-wildcard list
  *
  * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
  * @returns {import('./Expression.js').default | null} the first matching Expression, or null
  *
  * @example
  * const expr = stopNodes.findMatch(matcher);
  * if (expr) {
  *   // access expr.config, expr.pattern, etc.
  * }
  */
  findMatch(matcher) {
    const depth = matcher.getDepth();
    const tag = matcher.getCurrentTag();
    const exactKey = `${depth}:${tag}`;
    const exactBucket = this._byDepthAndTag.get(exactKey);
    if (exactBucket) {
      for (let i = 0; i < exactBucket.length; i++) {
        if (matcher.matches(exactBucket[i]))
          return exactBucket[i];
      }
    }
    const wildcardBucket = this._wildcardByDepth.get(depth);
    if (wildcardBucket) {
      for (let i = 0; i < wildcardBucket.length; i++) {
        if (matcher.matches(wildcardBucket[i]))
          return wildcardBucket[i];
      }
    }
    for (let i = 0; i < this._deepWildcards.length; i++) {
      if (matcher.matches(this._deepWildcards[i]))
        return this._deepWildcards[i];
    }
    return null;
  }
};

// node_modules/path-expression-matcher/src/Matcher.js
var MatcherView = class {
  /**
   * @param {Matcher} matcher - The parent Matcher instance to read from.
   */
  constructor(matcher) {
    this._matcher = matcher;
  }
  /**
   * Get the path separator used by the parent matcher.
   * @returns {string}
   */
  get separator() {
    return this._matcher.separator;
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    const path = this._matcher.path;
    if (path.length === 0)
      return void 0;
    return path[path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    const path = this._matcher.path;
    if (path.length === 0)
      return false;
    const current = path[path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    const path = this._matcher.path;
    if (path.length === 0)
      return -1;
    return path[path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    const path = this._matcher.path;
    if (path.length === 0)
      return -1;
    return path[path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this._matcher.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    return this._matcher.toString(separator, includeNamespace);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this._matcher.path.map((n) => n.tag);
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    return this._matcher.matches(expression);
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this._matcher);
  }
};
var Matcher = class {
  /**
   * Create a new Matcher.
   * @param {Object} [options={}]
   * @param {string} [options.separator='.'] - Default path separator
   */
  constructor(options = {}) {
    this.separator = options.separator || ".";
    this.path = [];
    this.siblingStacks = [];
    this._pathStringCache = null;
    this._view = new MatcherView(this);
  }
  /**
   * Push a new tag onto the path.
   * @param {string} tagName
   * @param {Object|null} [attrValues=null]
   * @param {string|null} [namespace=null]
   */
  push(tagName, attrValues = null, namespace = null) {
    this._pathStringCache = null;
    if (this.path.length > 0) {
      this.path[this.path.length - 1].values = void 0;
    }
    const currentLevel = this.path.length;
    if (!this.siblingStacks[currentLevel]) {
      this.siblingStacks[currentLevel] = /* @__PURE__ */ new Map();
    }
    const siblings = this.siblingStacks[currentLevel];
    const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
    const counter = siblings.get(siblingKey) || 0;
    let position = 0;
    for (const count of siblings.values()) {
      position += count;
    }
    siblings.set(siblingKey, counter + 1);
    const node = {
      tag: tagName,
      position,
      counter
    };
    if (namespace !== null && namespace !== void 0) {
      node.namespace = namespace;
    }
    if (attrValues !== null && attrValues !== void 0) {
      node.values = attrValues;
    }
    this.path.push(node);
  }
  /**
   * Pop the last tag from the path.
   * @returns {Object|undefined} The popped node
   */
  pop() {
    if (this.path.length === 0)
      return void 0;
    this._pathStringCache = null;
    const node = this.path.pop();
    if (this.siblingStacks.length > this.path.length + 1) {
      this.siblingStacks.length = this.path.length + 1;
    }
    return node;
  }
  /**
   * Update current node's attribute values.
   * Useful when attributes are parsed after push.
   * @param {Object} attrValues
   */
  updateCurrent(attrValues) {
    if (this.path.length > 0) {
      const current = this.path[this.path.length - 1];
      if (attrValues !== null && attrValues !== void 0) {
        current.values = attrValues;
      }
    }
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    if (this.path.length === 0)
      return void 0;
    return this.path[this.path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    if (this.path.length === 0)
      return false;
    const current = this.path[this.path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    if (this.path.length === 0)
      return -1;
    return this.path[this.path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    if (this.path.length === 0)
      return -1;
    return this.path[this.path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    const sep = separator || this.separator;
    const isDefault = sep === this.separator && includeNamespace === true;
    if (isDefault) {
      if (this._pathStringCache !== null) {
        return this._pathStringCache;
      }
      const result = this.path.map(
        (n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag
      ).join(sep);
      this._pathStringCache = result;
      return result;
    }
    return this.path.map(
      (n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag
    ).join(sep);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this.path.map((n) => n.tag);
  }
  /**
   * Reset the path to empty.
   */
  reset() {
    this._pathStringCache = null;
    this.path = [];
    this.siblingStacks = [];
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    const segments = expression.segments;
    if (segments.length === 0) {
      return false;
    }
    if (expression.hasDeepWildcard()) {
      return this._matchWithDeepWildcard(segments);
    }
    return this._matchSimple(segments);
  }
  /**
   * @private
   */
  _matchSimple(segments) {
    if (this.path.length !== segments.length) {
      return false;
    }
    for (let i = 0; i < segments.length; i++) {
      if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) {
        return false;
      }
    }
    return true;
  }
  /**
   * @private
   */
  _matchWithDeepWildcard(segments) {
    let pathIdx = this.path.length - 1;
    let segIdx = segments.length - 1;
    while (segIdx >= 0 && pathIdx >= 0) {
      const segment = segments[segIdx];
      if (segment.type === "deep-wildcard") {
        segIdx--;
        if (segIdx < 0) {
          return true;
        }
        const nextSeg = segments[segIdx];
        let found = false;
        for (let i = pathIdx; i >= 0; i--) {
          if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
            pathIdx = i - 1;
            segIdx--;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      } else {
        if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) {
          return false;
        }
        pathIdx--;
        segIdx--;
      }
    }
    return segIdx < 0;
  }
  /**
   * @private
   */
  _matchSegment(segment, node, isCurrentNode) {
    if (segment.tag !== "*" && segment.tag !== node.tag) {
      return false;
    }
    if (segment.namespace !== void 0) {
      if (segment.namespace !== "*" && segment.namespace !== node.namespace) {
        return false;
      }
    }
    if (segment.attrName !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      if (!node.values || !(segment.attrName in node.values)) {
        return false;
      }
      if (segment.attrValue !== void 0) {
        if (String(node.values[segment.attrName]) !== String(segment.attrValue)) {
          return false;
        }
      }
    }
    if (segment.position !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      const counter = node.counter ?? 0;
      if (segment.position === "first" && counter !== 0) {
        return false;
      } else if (segment.position === "odd" && counter % 2 !== 1) {
        return false;
      } else if (segment.position === "even" && counter % 2 !== 0) {
        return false;
      } else if (segment.position === "nth" && counter !== segment.positionValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this);
  }
  /**
   * Create a snapshot of current state.
   * @returns {Object}
   */
  snapshot() {
    return {
      path: this.path.map((node) => ({ ...node })),
      siblingStacks: this.siblingStacks.map((map) => new Map(map))
    };
  }
  /**
   * Restore state from snapshot.
   * @param {Object} snapshot
   */
  restore(snapshot) {
    this._pathStringCache = null;
    this.path = snapshot.path.map((node) => ({ ...node }));
    this.siblingStacks = snapshot.siblingStacks.map((map) => new Map(map));
  }
  /**
   * Return the read-only {@link MatcherView} for this matcher.
   *
   * The same instance is returned on every call — no allocation occurs.
   * It always reflects the current parser state and is safe to pass to
   * user callbacks without risk of accidental mutation.
   *
   * @returns {MatcherView}
   *
   * @example
   * const view = matcher.readOnly();
   * // pass view to callbacks — it stays in sync automatically
   * view.matches(expr);       // ✓
   * view.getCurrentTag();     // ✓
   * // view.push(...)         // ✗ method does not exist — caught by TypeScript
   */
  readOnly() {
    return this._view;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function extractRawAttributes(prefixedAttrs, options) {
  if (!prefixedAttrs)
    return {};
  const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
  if (!attrs)
    return {};
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(options.attributeNamePrefix)) {
      const rawName = key.substring(options.attributeNamePrefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function extractNamespace(rawTagName) {
  if (!rawTagName || typeof rawTagName !== "string")
    return void 0;
  const colonIndex = rawTagName.indexOf(":");
  if (colonIndex !== -1 && colonIndex > 0) {
    const ns = rawTagName.substring(0, colonIndex);
    if (ns !== "xmlns") {
      return ns;
    }
  }
  return void 0;
}
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
      "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
      "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
      "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
      "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
      "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
      "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => fromCodePoint(str, 10, "&#") },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => fromCodePoint(str, 16, "&#x") }
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    this.matcher = new Matcher();
    this.readonlyMatcher = this.matcher.readOnly();
    this.isCurrentNodeStopNode = false;
    this.stopNodeExpressionsSet = new ExpressionSet();
    const stopNodesOpts = this.options.stopNodes;
    if (stopNodesOpts && stopNodesOpts.length > 0) {
      for (let i = 0; i < stopNodesOpts.length; i++) {
        const stopNodeExp = stopNodesOpts[i];
        if (typeof stopNodeExp === "string") {
          this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
        } else if (stopNodeExp instanceof Expression) {
          this.stopNodeExpressionsSet.add(stopNodeExp);
        }
      }
      this.stopNodeExpressionsSet.seal();
    }
  }
};
function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    const escaped = ent.replace(/[.\-+*:]/g, "\\.");
    this.lastEntities[ent] = {
      regex: new RegExp("&" + escaped + ";", "g"),
      val: externalEntities[ent]
    };
  }
}
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  const options = this.options;
  if (val !== void 0) {
    if (options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities)
        val = this.replaceEntitiesValue(val, tagName, jPath);
      const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
      const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (options.trimValues) {
        return parseValue(val, options.parseTagValue, options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, options.parseTagValue, options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName) {
  const options = this.options;
  if (options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    const processedVals = new Array(len);
    let hasRawAttrs = false;
    const rawAttrsForMatcher = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      const oldVal = matches[i][4];
      if (attrName.length && oldVal !== void 0) {
        let val = oldVal;
        if (options.trimValues)
          val = val.trim();
        val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
        processedVals[i] = val;
        rawAttrsForMatcher[attrName] = val;
        hasRawAttrs = true;
      }
    }
    if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) {
      jPath.updateCurrent(rawAttrsForMatcher);
    }
    const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
    let hasAttrs = false;
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPathStr))
        continue;
      let aName = options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (options.transformAttributeName) {
          aName = options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, options);
        if (matches[i][4] !== void 0) {
          const oldVal = processedVals[i];
          const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(oldVal, options.parseAttributeValue, options.numberParseOptions);
          }
          hasAttrs = true;
        } else if (options.allowBooleanAttributes) {
          attrs[aName] = true;
          hasAttrs = true;
        }
      }
    }
    if (!hasAttrs)
      return;
    if (options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  this.matcher.reset();
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  this.docTypeEntitiesKeys = [];
  this.lastEntitiesKeys = Object.keys(this.lastEntities);
  this.htmlEntitiesKeys = this.options.htmlEntities ? Object.keys(this.htmlEntities) : [];
  const options = this.options;
  const docTypeReader = new DocTypeReader(options.processEntities);
  const xmlLen = xmlData.length;
  for (let i = 0; i < xmlLen; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        }
        const lastTagName = this.matcher.getCurrentTag();
        if (tagName && options.unpairedTagsSet.has(tagName)) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
          this.matcher.pop();
          this.tagsNodeStack.pop();
        }
        this.matcher.pop();
        this.isCurrentNodeStopNode = false;
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (c1 === 63) {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData)
          throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName);
          }
          this.addChild(currentNode, childNode, this.readonlyMatcher, i);
        }
        i = tagData.closeIndex + 1;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
          currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
        const result = docTypeReader.readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        this.docTypeEntitiesKeys = Object.keys(this.docTypeEntities) || [];
        i = result.i;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
        if (val == void 0)
          val = "";
        if (options.cdataPropName) {
          currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, options.removeNSPrefix);
        if (!result) {
          const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
          throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
        }
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
        if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
          currentNode = this.tagsNodeStack.pop();
          this.matcher.pop();
        }
        let isSelfClosing = false;
        if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
          isSelfClosing = true;
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          } else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }
          attrExpPresent = tagName !== tagExp;
        }
        let prefixedAttrs = null;
        let rawAttrs = {};
        let namespace = void 0;
        namespace = extractNamespace(rawTagName);
        if (tagName !== xmlObj.tagname) {
          this.matcher.push(tagName, {}, namespace);
        }
        if (tagName !== tagExp && attrExpPresent) {
          prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
          if (prefixedAttrs) {
            rawAttrs = extractRawAttributes(prefixedAttrs, options);
          }
        }
        if (tagName !== xmlObj.tagname) {
          this.isCurrentNodeStopNode = this.isItStopNode();
        }
        const startIndex = i;
        if (this.isCurrentNodeStopNode) {
          let tagContent = "";
          if (isSelfClosing) {
            i = result.closeIndex;
          } else if (options.unpairedTagsSet.has(tagName)) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2)
              throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (prefixedAttrs) {
            childNode[":@"] = prefixedAttrs;
          }
          childNode.add(options.textNodeName, tagContent);
          this.matcher.pop();
          this.isCurrentNodeStopNode = false;
          this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
        } else {
          if (isSelfClosing) {
            ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
          } else if (options.unpairedTagsSet.has(tagName)) {
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
  if (!this.options.captureMetaData)
    startIndex = void 0;
  const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
  const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
function replaceEntitiesValue(val, tagName, jPath) {
  const entityConfig = this.options.processEntities;
  if (!entityConfig || !entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    const allowed = Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher);
    if (!allowed) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) {
      return val;
    }
  }
  for (const entityName of this.docTypeEntitiesKeys) {
    const entity = this.docTypeEntities[entityName];
    const matches = val.match(entity.regx);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
      const lengthBefore = val.length;
      val = val.replace(entity.regx, entity.val);
      if (entityConfig.maxExpandedLength) {
        this.currentExpandedLength += val.length - lengthBefore;
        if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
          throw new Error(
            `Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`
          );
        }
      }
    }
  }
  if (val.indexOf("&") === -1)
    return val;
  for (const entityName of this.lastEntitiesKeys) {
    const entity = this.lastEntities[entityName];
    const matches = val.match(entity.regex);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
    }
    val = val.replace(entity.regex, entity.val);
  }
  if (val.indexOf("&") === -1)
    return val;
  for (const entityName of this.htmlEntitiesKeys) {
    const entity = this.htmlEntities[entityName];
    const matches = val.match(entity.regex);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
    }
    val = val.replace(entity.regex, entity.val);
  }
  val = val.replace(this.ampEntity.regex, this.ampEntity.val);
  return val;
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0)
      isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      parentNode.tagname,
      matcher,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode() {
  if (this.stopNodeExpressionsSet.size === 0)
    return false;
  return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary = 0;
  const chars = [];
  const len = xmlData.length;
  const closeCode0 = closingChar.charCodeAt(0);
  const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
  for (let index = i; index < len; index++) {
    const code = xmlData.charCodeAt(index);
    if (attrBoundary) {
      if (code === attrBoundary)
        attrBoundary = 0;
    } else if (code === 34 || code === 39) {
      attrBoundary = code;
    } else if (code === closeCode0) {
      if (closeCode1 !== -1) {
        if (xmlData.charCodeAt(index + 1) === closeCode1) {
          return { data: String.fromCharCode(...chars), index };
        }
      } else {
        return { data: String.fromCharCode(...chars), index };
      }
    } else if (code === 9) {
      chars.push(32);
      continue;
    }
    chars.push(code);
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function findClosingChar(xmlData, char, i, errMsg) {
  const closingIndex = xmlData.indexOf(char, i);
  if (closingIndex === -1)
    throw new Error(errMsg);
  return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result)
    return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  const xmllen = xmlData.length;
  for (; i < xmllen; i++) {
    if (xmlData[i] === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (c1 === 63) {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true")
      return true;
    else if (newval === "false")
      return false;
    else
      return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function fromCodePoint(str, base, prefix) {
  const codePoint = Number.parseInt(str, base);
  if (codePoint >= 0 && codePoint <= 1114111) {
    return String.fromCodePoint(codePoint);
  } else {
    return prefix + str + ";";
  }
}
function transformTagName(fn, tagName, tagExp, options) {
  if (fn) {
    const newTagName = fn(tagName);
    if (tagExp === tagName) {
      tagExp = newTagName;
    }
    tagName = newTagName;
  }
  tagName = sanitizeName(tagName, options);
  return { tagName, tagExp };
}
function sanitizeName(name, options) {
  if (criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function stripAttributePrefix(attrs, prefix) {
  if (!attrs || typeof attrs !== "object")
    return {};
  if (!prefix)
    return attrs;
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(prefix)) {
      const rawName = key.substring(prefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function prettify(node, options, matcher, readonlyMatcher) {
  return compress(node, options, matcher, readonlyMatcher);
}
function compress(arr, options, matcher, readonlyMatcher) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    if (property !== void 0 && property !== options.textNodeName) {
      const rawAttrs = stripAttributePrefix(
        tagObj[":@"] || {},
        options.attributeNamePrefix
      );
      matcher.push(property, rawAttrs);
    }
    if (property === options.textNodeName) {
      if (text === void 0)
        text = tagObj[property];
      else
        text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, matcher, readonlyMatcher);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode)
          val[options.textNodeName] = "";
        else
          val = "";
      }
      if (tagObj[METADATA_SYMBOL2] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
        if (options.isArray(property, jPathOrMatcher, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
      if (property !== void 0 && property !== options.textNodeName) {
        matcher.pop();
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0)
      compressedObj[options.textNodeName] = text;
  } else if (text !== void 0)
    compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@")
      return key;
  }
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
      const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
      if (options.isArray(atrrName, jPathOrMatcher, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true)
        validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.addExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0)
      return orderedResult;
    else
      return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// node_modules/fast-xml-builder/src/orderedJs2Xml.js
var EOL = "\n";
function toXml(jArray, options) {
  let indentation = "";
  if (options.format && options.indentBy.length > 0) {
    indentation = EOL;
  }
  const stopNodeExpressions = [];
  if (options.stopNodes && Array.isArray(options.stopNodes)) {
    for (let i = 0; i < options.stopNodes.length; i++) {
      const node = options.stopNodes[i];
      if (typeof node === "string") {
        stopNodeExpressions.push(new Expression(node));
      } else if (node instanceof Expression) {
        stopNodeExpressions.push(node);
      }
    }
  }
  const matcher = new Matcher();
  return arrToStr(jArray, options, indentation, matcher, stopNodeExpressions);
}
function arrToStr(arr, options, indentation, matcher, stopNodeExpressions) {
  let xmlStr = "";
  let isPreviousElementTag = false;
  if (options.maxNestedTags && matcher.getDepth() > options.maxNestedTags) {
    throw new Error("Maximum nested tags exceeded");
  }
  if (!Array.isArray(arr)) {
    if (arr !== void 0 && arr !== null) {
      let text = arr.toString();
      text = replaceEntitiesValue2(text, options);
      return text;
    }
    return "";
  }
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const tagName = propName2(tagObj);
    if (tagName === void 0)
      continue;
    const attrValues = extractAttributeValues(tagObj[":@"], options);
    matcher.push(tagName, attrValues);
    const isStopNode = checkStopNode(matcher, stopNodeExpressions);
    if (tagName === options.textNodeName) {
      let tagText = tagObj[tagName];
      if (!isStopNode) {
        tagText = options.tagValueProcessor(tagName, tagText);
        tagText = replaceEntitiesValue2(tagText, options);
      }
      if (isPreviousElementTag) {
        xmlStr += indentation;
      }
      xmlStr += tagText;
      isPreviousElementTag = false;
      matcher.pop();
      continue;
    } else if (tagName === options.cdataPropName) {
      if (isPreviousElementTag) {
        xmlStr += indentation;
      }
      xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
      isPreviousElementTag = false;
      matcher.pop();
      continue;
    } else if (tagName === options.commentPropName) {
      xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
      isPreviousElementTag = true;
      matcher.pop();
      continue;
    } else if (tagName[0] === "?") {
      const attStr2 = attr_to_str(tagObj[":@"], options, isStopNode);
      const tempInd = tagName === "?xml" ? "" : indentation;
      let piTextNodeName = tagObj[tagName][0][options.textNodeName];
      piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
      xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
      isPreviousElementTag = true;
      matcher.pop();
      continue;
    }
    let newIdentation = indentation;
    if (newIdentation !== "") {
      newIdentation += options.indentBy;
    }
    const attStr = attr_to_str(tagObj[":@"], options, isStopNode);
    const tagStart = indentation + `<${tagName}${attStr}`;
    let tagValue;
    if (isStopNode) {
      tagValue = getRawContent(tagObj[tagName], options);
    } else {
      tagValue = arrToStr(tagObj[tagName], options, newIdentation, matcher, stopNodeExpressions);
    }
    if (options.unpairedTags.indexOf(tagName) !== -1) {
      if (options.suppressUnpairedNode)
        xmlStr += tagStart + ">";
      else
        xmlStr += tagStart + "/>";
    } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
      xmlStr += tagStart + "/>";
    } else if (tagValue && tagValue.endsWith(">")) {
      xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
    } else {
      xmlStr += tagStart + ">";
      if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
        xmlStr += indentation + options.indentBy + tagValue + indentation;
      } else {
        xmlStr += tagValue;
      }
      xmlStr += `</${tagName}>`;
    }
    isPreviousElementTag = true;
    matcher.pop();
  }
  return xmlStr;
}
function extractAttributeValues(attrMap, options) {
  if (!attrMap || options.ignoreAttributes)
    return null;
  const attrValues = {};
  let hasAttrs = false;
  for (let attr in attrMap) {
    if (!Object.prototype.hasOwnProperty.call(attrMap, attr))
      continue;
    const cleanAttrName = attr.startsWith(options.attributeNamePrefix) ? attr.substr(options.attributeNamePrefix.length) : attr;
    attrValues[cleanAttrName] = attrMap[attr];
    hasAttrs = true;
  }
  return hasAttrs ? attrValues : null;
}
function getRawContent(arr, options) {
  if (!Array.isArray(arr)) {
    if (arr !== void 0 && arr !== null) {
      return arr.toString();
    }
    return "";
  }
  let content = "";
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const tagName = propName2(item);
    if (tagName === options.textNodeName) {
      content += item[tagName];
    } else if (tagName === options.cdataPropName) {
      content += item[tagName][0][options.textNodeName];
    } else if (tagName === options.commentPropName) {
      content += item[tagName][0][options.textNodeName];
    } else if (tagName && tagName[0] === "?") {
      continue;
    } else if (tagName) {
      const attStr = attr_to_str_raw(item[":@"], options);
      const nestedContent = getRawContent(item[tagName], options);
      if (!nestedContent || nestedContent.length === 0) {
        content += `<${tagName}${attStr}/>`;
      } else {
        content += `<${tagName}${attStr}>${nestedContent}</${tagName}>`;
      }
    }
  }
  return content;
}
function attr_to_str_raw(attrMap, options) {
  let attrStr = "";
  if (attrMap && !options.ignoreAttributes) {
    for (let attr in attrMap) {
      if (!Object.prototype.hasOwnProperty.call(attrMap, attr))
        continue;
      let attrVal = attrMap[attr];
      if (attrVal === true && options.suppressBooleanAttributes) {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
      } else {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
      }
    }
  }
  return attrStr;
}
function propName2(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(obj, key))
      continue;
    if (key !== ":@")
      return key;
  }
}
function attr_to_str(attrMap, options, isStopNode) {
  let attrStr = "";
  if (attrMap && !options.ignoreAttributes) {
    for (let attr in attrMap) {
      if (!Object.prototype.hasOwnProperty.call(attrMap, attr))
        continue;
      let attrVal;
      if (isStopNode) {
        attrVal = attrMap[attr];
      } else {
        attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
        attrVal = replaceEntitiesValue2(attrVal, options);
      }
      if (attrVal === true && options.suppressBooleanAttributes) {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
      } else {
        attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
      }
    }
  }
  return attrStr;
}
function checkStopNode(matcher, stopNodeExpressions) {
  if (!stopNodeExpressions || stopNodeExpressions.length === 0)
    return false;
  for (let i = 0; i < stopNodeExpressions.length; i++) {
    if (matcher.matches(stopNodeExpressions[i])) {
      return true;
    }
  }
  return false;
}
function replaceEntitiesValue2(textValue, options) {
  if (textValue && textValue.length > 0 && options.processEntities) {
    for (let i = 0; i < options.entities.length; i++) {
      const entity = options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
}

// node_modules/fast-xml-builder/src/ignoreAttributes.js
function getIgnoreAttributesFn2(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/fast-xml-builder/src/fxb.js
var defaultOptions3 = {
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  cdataPropName: false,
  format: false,
  indentBy: "  ",
  suppressEmptyNode: false,
  suppressUnpairedNode: true,
  suppressBooleanAttributes: true,
  tagValueProcessor: function(key, a) {
    return a;
  },
  attributeValueProcessor: function(attrName, a) {
    return a;
  },
  preserveOrder: false,
  commentPropName: false,
  unpairedTags: [],
  entities: [
    { regex: new RegExp("&", "g"), val: "&amp;" },
    //it must be on top
    { regex: new RegExp(">", "g"), val: "&gt;" },
    { regex: new RegExp("<", "g"), val: "&lt;" },
    { regex: new RegExp("'", "g"), val: "&apos;" },
    { regex: new RegExp('"', "g"), val: "&quot;" }
  ],
  processEntities: true,
  stopNodes: [],
  // transformTagName: false,
  // transformAttributeName: false,
  oneListGroup: false,
  maxNestedTags: 100,
  jPath: true
  // When true, callbacks receive string jPath; when false, receive Matcher instance
};
function Builder(options) {
  this.options = Object.assign({}, defaultOptions3, options);
  if (this.options.stopNodes && Array.isArray(this.options.stopNodes)) {
    this.options.stopNodes = this.options.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  this.stopNodeExpressions = [];
  if (this.options.stopNodes && Array.isArray(this.options.stopNodes)) {
    for (let i = 0; i < this.options.stopNodes.length; i++) {
      const node = this.options.stopNodes[i];
      if (typeof node === "string") {
        this.stopNodeExpressions.push(new Expression(node));
      } else if (node instanceof Expression) {
        this.stopNodeExpressions.push(node);
      }
    }
  }
  if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
    this.isAttribute = function() {
      return false;
    };
  } else {
    this.ignoreAttributesFn = getIgnoreAttributesFn2(this.options.ignoreAttributes);
    this.attrPrefixLen = this.options.attributeNamePrefix.length;
    this.isAttribute = isAttribute;
  }
  this.processTextOrObjNode = processTextOrObjNode;
  if (this.options.format) {
    this.indentate = indentate;
    this.tagEndChar = ">\n";
    this.newLine = "\n";
  } else {
    this.indentate = function() {
      return "";
    };
    this.tagEndChar = ">";
    this.newLine = "";
  }
}
Builder.prototype.build = function(jObj) {
  if (this.options.preserveOrder) {
    return toXml(jObj, this.options);
  } else {
    if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
      jObj = {
        [this.options.arrayNodeName]: jObj
      };
    }
    const matcher = new Matcher();
    return this.j2x(jObj, 0, matcher).val;
  }
};
Builder.prototype.j2x = function(jObj, level, matcher) {
  let attrStr = "";
  let val = "";
  if (this.options.maxNestedTags && matcher.getDepth() >= this.options.maxNestedTags) {
    throw new Error("Maximum nested tags exceeded");
  }
  const jPath = this.options.jPath ? matcher.toString() : matcher;
  const isCurrentStopNode = this.checkStopNode(matcher);
  for (let key in jObj) {
    if (!Object.prototype.hasOwnProperty.call(jObj, key))
      continue;
    if (typeof jObj[key] === "undefined") {
      if (this.isAttribute(key)) {
        val += "";
      }
    } else if (jObj[key] === null) {
      if (this.isAttribute(key)) {
        val += "";
      } else if (key === this.options.cdataPropName) {
        val += "";
      } else if (key[0] === "?") {
        val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
      } else {
        val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
      }
    } else if (jObj[key] instanceof Date) {
      val += this.buildTextValNode(jObj[key], key, "", level, matcher);
    } else if (typeof jObj[key] !== "object") {
      const attr = this.isAttribute(key);
      if (attr && !this.ignoreAttributesFn(attr, jPath)) {
        attrStr += this.buildAttrPairStr(attr, "" + jObj[key], isCurrentStopNode);
      } else if (!attr) {
        if (key === this.options.textNodeName) {
          let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
          val += this.replaceEntitiesValue(newval);
        } else {
          matcher.push(key);
          const isStopNode = this.checkStopNode(matcher);
          matcher.pop();
          if (isStopNode) {
            const textValue = "" + jObj[key];
            if (textValue === "") {
              val += this.indentate(level) + "<" + key + this.closeTag(key) + this.tagEndChar;
            } else {
              val += this.indentate(level) + "<" + key + ">" + textValue + "</" + key + this.tagEndChar;
            }
          } else {
            val += this.buildTextValNode(jObj[key], key, "", level, matcher);
          }
        }
      }
    } else if (Array.isArray(jObj[key])) {
      const arrLen = jObj[key].length;
      let listTagVal = "";
      let listTagAttr = "";
      for (let j = 0; j < arrLen; j++) {
        const item = jObj[key][j];
        if (typeof item === "undefined") {
        } else if (item === null) {
          if (key[0] === "?")
            val += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
          else
            val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
        } else if (typeof item === "object") {
          if (this.options.oneListGroup) {
            matcher.push(key);
            const result = this.j2x(item, level + 1, matcher);
            matcher.pop();
            listTagVal += result.val;
            if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
              listTagAttr += result.attrStr;
            }
          } else {
            listTagVal += this.processTextOrObjNode(item, key, level, matcher);
          }
        } else {
          if (this.options.oneListGroup) {
            let textValue = this.options.tagValueProcessor(key, item);
            textValue = this.replaceEntitiesValue(textValue);
            listTagVal += textValue;
          } else {
            matcher.push(key);
            const isStopNode = this.checkStopNode(matcher);
            matcher.pop();
            if (isStopNode) {
              const textValue = "" + item;
              if (textValue === "") {
                listTagVal += this.indentate(level) + "<" + key + this.closeTag(key) + this.tagEndChar;
              } else {
                listTagVal += this.indentate(level) + "<" + key + ">" + textValue + "</" + key + this.tagEndChar;
              }
            } else {
              listTagVal += this.buildTextValNode(item, key, "", level, matcher);
            }
          }
        }
      }
      if (this.options.oneListGroup) {
        listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
      }
      val += listTagVal;
    } else {
      if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
        const Ks = Object.keys(jObj[key]);
        const L = Ks.length;
        for (let j = 0; j < L; j++) {
          attrStr += this.buildAttrPairStr(Ks[j], "" + jObj[key][Ks[j]], isCurrentStopNode);
        }
      } else {
        val += this.processTextOrObjNode(jObj[key], key, level, matcher);
      }
    }
  }
  return { attrStr, val };
};
Builder.prototype.buildAttrPairStr = function(attrName, val, isStopNode) {
  if (!isStopNode) {
    val = this.options.attributeValueProcessor(attrName, "" + val);
    val = this.replaceEntitiesValue(val);
  }
  if (this.options.suppressBooleanAttributes && val === "true") {
    return " " + attrName;
  } else
    return " " + attrName + '="' + val + '"';
};
function processTextOrObjNode(object, key, level, matcher) {
  const attrValues = this.extractAttributes(object);
  matcher.push(key, attrValues);
  const isStopNode = this.checkStopNode(matcher);
  if (isStopNode) {
    const rawContent = this.buildRawContent(object);
    const attrStr = this.buildAttributesForStopNode(object);
    matcher.pop();
    return this.buildObjectNode(rawContent, key, attrStr, level);
  }
  const result = this.j2x(object, level + 1, matcher);
  matcher.pop();
  if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
    return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level, matcher);
  } else {
    return this.buildObjectNode(result.val, key, result.attrStr, level);
  }
}
Builder.prototype.extractAttributes = function(obj) {
  if (!obj || typeof obj !== "object")
    return null;
  const attrValues = {};
  let hasAttrs = false;
  if (this.options.attributesGroupName && obj[this.options.attributesGroupName]) {
    const attrGroup = obj[this.options.attributesGroupName];
    for (let attrKey in attrGroup) {
      if (!Object.prototype.hasOwnProperty.call(attrGroup, attrKey))
        continue;
      const cleanKey = attrKey.startsWith(this.options.attributeNamePrefix) ? attrKey.substring(this.options.attributeNamePrefix.length) : attrKey;
      attrValues[cleanKey] = attrGroup[attrKey];
      hasAttrs = true;
    }
  } else {
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key))
        continue;
      const attr = this.isAttribute(key);
      if (attr) {
        attrValues[attr] = obj[key];
        hasAttrs = true;
      }
    }
  }
  return hasAttrs ? attrValues : null;
};
Builder.prototype.buildRawContent = function(obj) {
  if (typeof obj === "string") {
    return obj;
  }
  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }
  if (obj[this.options.textNodeName] !== void 0) {
    return obj[this.options.textNodeName];
  }
  let content = "";
  for (let key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key))
      continue;
    if (this.isAttribute(key))
      continue;
    if (this.options.attributesGroupName && key === this.options.attributesGroupName)
      continue;
    const value = obj[key];
    if (key === this.options.textNodeName) {
      content += value;
    } else if (Array.isArray(value)) {
      for (let item of value) {
        if (typeof item === "string" || typeof item === "number") {
          content += `<${key}>${item}</${key}>`;
        } else if (typeof item === "object" && item !== null) {
          const nestedContent = this.buildRawContent(item);
          const nestedAttrs = this.buildAttributesForStopNode(item);
          if (nestedContent === "") {
            content += `<${key}${nestedAttrs}/>`;
          } else {
            content += `<${key}${nestedAttrs}>${nestedContent}</${key}>`;
          }
        }
      }
    } else if (typeof value === "object" && value !== null) {
      const nestedContent = this.buildRawContent(value);
      const nestedAttrs = this.buildAttributesForStopNode(value);
      if (nestedContent === "") {
        content += `<${key}${nestedAttrs}/>`;
      } else {
        content += `<${key}${nestedAttrs}>${nestedContent}</${key}>`;
      }
    } else {
      content += `<${key}>${value}</${key}>`;
    }
  }
  return content;
};
Builder.prototype.buildAttributesForStopNode = function(obj) {
  if (!obj || typeof obj !== "object")
    return "";
  let attrStr = "";
  if (this.options.attributesGroupName && obj[this.options.attributesGroupName]) {
    const attrGroup = obj[this.options.attributesGroupName];
    for (let attrKey in attrGroup) {
      if (!Object.prototype.hasOwnProperty.call(attrGroup, attrKey))
        continue;
      const cleanKey = attrKey.startsWith(this.options.attributeNamePrefix) ? attrKey.substring(this.options.attributeNamePrefix.length) : attrKey;
      const val = attrGroup[attrKey];
      if (val === true && this.options.suppressBooleanAttributes) {
        attrStr += " " + cleanKey;
      } else {
        attrStr += " " + cleanKey + '="' + val + '"';
      }
    }
  } else {
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key))
        continue;
      const attr = this.isAttribute(key);
      if (attr) {
        const val = obj[key];
        if (val === true && this.options.suppressBooleanAttributes) {
          attrStr += " " + attr;
        } else {
          attrStr += " " + attr + '="' + val + '"';
        }
      }
    }
  }
  return attrStr;
};
Builder.prototype.buildObjectNode = function(val, key, attrStr, level) {
  if (val === "") {
    if (key[0] === "?")
      return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
    else {
      return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
    }
  } else {
    let tagEndExp = "</" + key + this.tagEndChar;
    let piClosingChar = "";
    if (key[0] === "?") {
      piClosingChar = "?";
      tagEndExp = "";
    }
    if ((attrStr || attrStr === "") && val.indexOf("<") === -1) {
      return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val + tagEndExp;
    } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
      return this.indentate(level) + `<!--${val}-->` + this.newLine;
    } else {
      return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val + this.indentate(level) + tagEndExp;
    }
  }
};
Builder.prototype.closeTag = function(key) {
  let closeTag = "";
  if (this.options.unpairedTags.indexOf(key) !== -1) {
    if (!this.options.suppressUnpairedNode)
      closeTag = "/";
  } else if (this.options.suppressEmptyNode) {
    closeTag = "/";
  } else {
    closeTag = `></${key}`;
  }
  return closeTag;
};
Builder.prototype.checkStopNode = function(matcher) {
  if (!this.stopNodeExpressions || this.stopNodeExpressions.length === 0)
    return false;
  for (let i = 0; i < this.stopNodeExpressions.length; i++) {
    if (matcher.matches(this.stopNodeExpressions[i])) {
      return true;
    }
  }
  return false;
};
Builder.prototype.buildTextValNode = function(val, key, attrStr, level, matcher) {
  if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
    return this.indentate(level) + `<![CDATA[${val}]]>` + this.newLine;
  } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
    return this.indentate(level) + `<!--${val}-->` + this.newLine;
  } else if (key[0] === "?") {
    return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
  } else {
    let textValue = this.options.tagValueProcessor(key, val);
    textValue = this.replaceEntitiesValue(textValue);
    if (textValue === "") {
      return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
    } else {
      return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
    }
  }
};
Builder.prototype.replaceEntitiesValue = function(textValue) {
  if (textValue && textValue.length > 0 && this.options.processEntities) {
    for (let i = 0; i < this.options.entities.length; i++) {
      const entity = this.options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
};
function indentate(level) {
  return this.options.indentBy.repeat(level);
}
function isAttribute(name) {
  if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
    return name.substr(this.attrPrefixLen);
  } else {
    return false;
  }
}

// node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
var json2xml_default = Builder;

// src/services/ebayClient.ts
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
  const builder = new json2xml_default({
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
  const parser = new XMLParser({
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
      inputSchema: import_zod8.z.object({
        method: import_zod8.z.enum(["GET", "POST", "PUT", "DELETE"]),
        path: import_zod8.z.string().regex(/^\//, "path must start with /"),
        body: import_zod8.z.record(import_zod8.z.unknown()).optional()
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
      inputSchema: import_zod8.z.object({
        callName: import_zod8.z.string().min(1),
        params: import_zod8.z.record(import_zod8.z.unknown()).optional()
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
  name: "zoho-mcp-server",
  version: "1.0.0"
});
registerInvoiceTools(server);
registerSalesOrderTools(server);
registerPurchaseOrderTools(server);
registerDropshipmentTools(server);
registerBillTools(server);
registerContactTools(server);
registerItemTools(server);
registerLearnTools(server);
registerEbayTools(server);
async function runHTTP() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use("/docs", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(swaggerDocument));
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "zoho-mcp-server", version: "1.0.0" });
  });
  app.get("/mcp", (_req, res) => {
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
    console.error(`Zoho MCP server running on http://${host}:${port}/mcp`);
  });
}
async function runStdio() {
  const transport2 = new import_stdio.StdioServerTransport();
  await server.connect(transport2);
  console.error("Zoho MCP server running on stdio");
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
