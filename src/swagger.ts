export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "zoho-common-endpoints",
    version: "1.0.0",
    description:
      "MCP server exposing workflow and auxiliary tools not covered by native Zoho MCP integrations. " +
      "27 tools across three groups: workflow (SO/PO/invoice), Zoho Learn, and eBay. " +
      "Also exposes a `/sync` webhook router and direct eBay HTTP proxies.",
    contact: { email: "vineet@mctoolsusa.com" },
  },
  servers: [
    {
      url: "https://zoho-mcp-server-production-bb70.up.railway.app",
      description: "Production (Railway)",
    },
    { url: "http://localhost:3000", description: "Local development" },
  ],
  tags: [
    { name: "System",   description: "Health and status" },
    { name: "MCP",      description: "Model Context Protocol transport (all 27 tools)" },
    { name: "Webhook",  description: "POST /sync — trigger workflow events via HTTP" },
    { name: "eBay",     description: "Direct eBay REST and Trading API proxies" },
  ],
  paths: {

    // ── System ────────────────────────────────────────────────────────────────

    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check — returns server name, version, and full tool manifest",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status:      { type: "string", example: "ok" },
                    server:      { type: "string", example: "zoho-common-endpoints" },
                    version:     { type: "string", example: "1.0.0" },
                    tools_count: { type: "number", example: 27 },
                    tools: {
                      type: "object",
                      properties: {
                        workflow: {
                          type: "array", items: { type: "string" },
                          example: [
                            "zoho_confirm_salesorder",
                            "zoho_link_po_to_salesorder",
                            "zoho_convert_po_to_bill",
                            "zoho_create_invoice_from_salesorder",
                          ],
                        },
                        zoho_learn: {
                          type: "array", items: { type: "string" },
                          example: [
                            "zoho_learn_list_courses","zoho_learn_get_course",
                            "zoho_learn_create_course","zoho_learn_update_course",
                            "zoho_learn_publish_course","zoho_learn_delete_course",
                            "zoho_learn_list_enrollments","zoho_learn_enroll_user",
                            "zoho_learn_remove_enrollment","zoho_learn_get_user_progress",
                            "zoho_learn_list_all_progress","zoho_learn_get_course_report",
                            "zoho_learn_list_learners","zoho_learn_list_categories",
                            "zoho_learn_create_category","zoho_learn_list_lessons",
                            "zoho_learn_create_lesson","zoho_learn_update_lesson",
                            "zoho_learn_create_quiz","zoho_learn_add_quiz_question",
                            "zoho_learn_list_quiz_questions",
                          ],
                        },
                        ebay: {
                          type: "array", items: { type: "string" },
                          example: ["ebay_api", "ebay_trading_api"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/openapi.json": {
      get: {
        tags: ["System"],
        summary: "Raw OpenAPI 3.0 spec",
        operationId: "openApiSpec",
        responses: {
          "200": {
            description: "OpenAPI JSON",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
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
            content: { "text/plain": { schema: { type: "string" } } },
          },
        },
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport — all 27 tools",
        description:
          "JSON-RPC 2.0 endpoint for all MCP tool calls.\n\n" +

          "### Workflow tools (4)\n" +
          "| Tool | Description |\n" +
          "|---|---|\n" +
          "| `zoho_confirm_salesorder` | Change a Sales Order from draft → confirmed |\n" +
          "| `zoho_link_po_to_salesorder` | Link an existing PO to a Sales Order |\n" +
          "| `zoho_convert_po_to_bill` | Convert an issued PO into a Zoho Books Bill |\n" +
          "| `zoho_create_invoice_from_salesorder` | Create a Books Invoice from a confirmed SO |\n\n" +

          "### Zoho Learn tools (21)\n" +
          "| Tool | Description |\n" +
          "|---|---|\n" +
          "| `zoho_learn_list_courses` | List / search courses |\n" +
          "| `zoho_learn_get_course` | Get full course details |\n" +
          "| `zoho_learn_create_course` | Create a new course |\n" +
          "| `zoho_learn_update_course` | Update course metadata |\n" +
          "| `zoho_learn_publish_course` | Publish or unpublish a course |\n" +
          "| `zoho_learn_delete_course` | Delete a course |\n" +
          "| `zoho_learn_list_enrollments` | List learners enrolled in a course |\n" +
          "| `zoho_learn_enroll_user` | Enroll one or more users in a course |\n" +
          "| `zoho_learn_remove_enrollment` | Unenroll a user from a course |\n" +
          "| `zoho_learn_get_user_progress` | Get a learner's progress in a course |\n" +
          "| `zoho_learn_list_all_progress` | All learner progress across a course |\n" +
          "| `zoho_learn_get_course_report` | Completion rates and scores for a course |\n" +
          "| `zoho_learn_list_learners` | List all learners in the portal |\n" +
          "| `zoho_learn_list_categories` | List all course categories |\n" +
          "| `zoho_learn_create_category` | Create a new course category |\n" +
          "| `zoho_learn_list_lessons` | List all lessons in a course |\n" +
          "| `zoho_learn_create_lesson` | Create a new lesson in a course |\n" +
          "| `zoho_learn_update_lesson` | Update lesson title or content |\n" +
          "| `zoho_learn_create_quiz` | Create a quiz chapter in a course |\n" +
          "| `zoho_learn_add_quiz_question` | Add a question to a quiz |\n" +
          "| `zoho_learn_list_quiz_questions` | List all questions in a quiz |\n\n" +

          "### eBay tools (2)\n" +
          "| Tool | Description |\n" +
          "|---|---|\n" +
          "| `ebay_api` | Proxy any eBay REST API call (auto OAuth refresh) |\n" +
          "| `ebay_trading_api` | Proxy any eBay Trading XML/SOAP call |",
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
                  id:      { type: "string", example: "1" },
                  method:  { type: "string", enum: ["initialize", "tools/list", "tools/call"] },
                  params:  { type: "object" },
                },
              },
              examples: {
                list_tools: {
                  summary: "List all tools",
                  value: { jsonrpc: "2.0", id: "1", method: "tools/list", params: {} },
                },
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: { jsonrpc: "2.0", id: "2", method: "tools/call",
                    params: { name: "zoho_confirm_salesorder", arguments: { salesorder_id: "SO-00001" } } },
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: { jsonrpc: "2.0", id: "3", method: "tools/call",
                    params: { name: "zoho_link_po_to_salesorder", arguments: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" } } },
                },
                convert_po_to_bill: {
                  summary: "Convert PO to Bill",
                  value: { jsonrpc: "2.0", id: "4", method: "tools/call",
                    params: { name: "zoho_convert_po_to_bill", arguments: { purchaseorder_id: "PO-00001" } } },
                },
                invoice_from_so: {
                  summary: "Create Invoice from Sales Order",
                  value: { jsonrpc: "2.0", id: "5", method: "tools/call",
                    params: { name: "zoho_create_invoice_from_salesorder", arguments: { salesorder_id: "SO-00001" } } },
                },
                ebay_call: {
                  summary: "eBay REST API call",
                  value: { jsonrpc: "2.0", id: "6", method: "tools/call",
                    params: { name: "ebay_api", arguments: { method: "GET", path: "/sell/account/v1/privilege" } } },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "JSON-RPC response",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },

    // ── Webhook ───────────────────────────────────────────────────────────────

    "/sync": {
      post: {
        tags: ["Webhook"],
        summary: "Trigger a Zoho workflow event via HTTP",
        description:
          "Accepts `event` + `payload` and executes the corresponding Zoho API call.\n\n" +
          "**Supported events:** `confirm_salesorder`, `link_po_to_salesorder`",
        operationId: "syncWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["event", "payload"],
                properties: {
                  event:   { type: "string", enum: ["confirm_salesorder", "link_po_to_salesorder"] },
                  payload: { type: "object" },
                },
              },
              examples: {
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: { event: "confirm_salesorder", payload: { salesorder_id: "SO-00001" } },
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: { event: "link_po_to_salesorder", payload: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" } },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Event handled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event:  { type: "string" },
                    status: { type: "string", example: "ok" },
                    data:   { type: "object" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing or invalid fields",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
          },
        },
      },
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
                  path:   { type: "string", description: "eBay API path starting with /", example: "/sell/account/v1/privilege" },
                  body:   { type: "object", description: "Optional JSON body for POST/PUT" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "eBay response forwarded as-is", content: { "application/json": { schema: { type: "object" } } } },
          "400": { description: "Missing method or path",        content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
        },
      },
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
                  params:   { type: "object", example: { ActiveList: { Include: true, Pagination: { EntriesPerPage: 200, PageNumber: 1 } }, DetailLevel: "ReturnAll" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Parsed eBay Trading API response", content: { "application/json": { schema: { type: "object" } } } },
          "400": { description: "Missing callName",                 content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } } },
        },
      },
    },
  },
};
