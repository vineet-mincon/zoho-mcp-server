export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Zoho MCP Server",
    version: "1.0.0",
    description:
      "MCP (Model Context Protocol) server exposing Zoho Books, Zoho Inventory, Zoho Learn, and eBay integrations. " +
      "The primary interface is the MCP Streamable HTTP transport at `POST /mcp`. " +
      "Direct REST proxies for eBay are also available.",
    contact: {
      email: "vineet@mctoolsusa.com",
    },
  },
  servers: [
    {
      url: "https://zoho-mcp-server-production.up.railway.app",
      description: "Production (Railway)",
    },
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "System", description: "Health and status endpoints" },
    { name: "MCP", description: "Model Context Protocol transport endpoint" },
    { name: "eBay", description: "eBay REST and Trading API proxies" },
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
                    version: { type: "string", example: "1.0.0" },
                  },
                },
              },
            },
          },
        },
      },
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
                schema: { type: "string", example: "MCP endpoint is up. Use POST /mcp (Streamable HTTP)." },
              },
            },
          },
        },
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport",
        description:
          "Primary endpoint for all MCP tool calls. Claude and other MCP clients send JSON-RPC requests here. " +
          "Each request creates a fresh stateless session.\n\n" +
          "**Available MCP tools (38 total):**\n\n" +
          "**Invoices (Zoho Books):** `zoho_list_invoices`, `zoho_get_invoice`, `zoho_create_invoice`, `zoho_update_invoice`, `zoho_mark_invoice_sent`, `zoho_void_invoice`\n\n" +
          "**Sales Orders (Zoho Inventory):** `zoho_list_salesorders`, `zoho_get_salesorder`, `zoho_create_salesorder`, `zoho_update_salesorder`, `zoho_confirm_salesorder`\n\n" +
          "**Purchase Orders (Zoho Inventory):** `zoho_list_purchaseorders`, `zoho_get_purchaseorder`, `zoho_create_purchaseorder`, `zoho_update_purchaseorder`, `zoho_issue_purchaseorder`, `zoho_convert_po_to_bill`\n\n" +
          "**Dropshipments (Zoho Inventory):** `zoho_list_dropshipments`, `zoho_create_dropshipment`, `zoho_get_dropshipment`, `zoho_link_po_to_salesorder`\n\n" +
          "**Bills (Zoho Books):** `zoho_list_bills`, `zoho_get_bill`, `zoho_create_bill`, `zoho_update_bill`\n\n" +
          "**Contacts & Items:** `zoho_list_contacts`, `zoho_get_contact`, `zoho_create_contact`, `zoho_update_contact`, `zoho_list_items`, `zoho_get_item`, `zoho_create_item`, `zoho_update_item`\n\n" +
          "**Zoho Learn:** `zoho_learn_list_courses`, `zoho_learn_get_course`, `zoho_learn_create_course`, `zoho_learn_update_course`, `zoho_learn_publish_course`, `zoho_learn_delete_course`, `zoho_learn_list_enrollments`, `zoho_learn_enroll_user`, `zoho_learn_remove_enrollment`, `zoho_learn_get_user_progress`, `zoho_learn_list_all_progress`, `zoho_learn_get_course_report`, `zoho_learn_list_learners`, `zoho_learn_list_categories`, `zoho_learn_create_category`, `zoho_learn_list_lessons`, `zoho_learn_create_lesson`, `zoho_learn_update_lesson`, `zoho_learn_create_quiz`, `zoho_learn_add_quiz_question`, `zoho_learn_list_quiz_questions`\n\n" +
          "**eBay (via MCP):** `ebay_api`, `ebay_trading_api`",
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
                    enum: ["initialize", "tools/list", "tools/call"],
                  },
                  params: {
                    type: "object",
                    description: "Method parameters",
                    example: {
                      name: "zoho_list_invoices",
                      arguments: { status: "unpaid", page: 1 },
                    },
                  },
                },
                required: ["jsonrpc", "method"],
              },
            },
          },
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
                    result: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ebay": {
      post: {
        tags: ["eBay"],
        summary: "eBay REST API proxy",
        description:
          "Proxies any eBay REST API call. The server handles OAuth token refresh automatically using `EBAY_REFRESH_TOKEN`. " +
          "Equivalent to the `ebay_api` MCP tool.",
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
                    example: "GET",
                  },
                  path: {
                    type: "string",
                    description: "eBay API path starting with /",
                    example: "/sell/account/v1/privilege",
                  },
                  body: {
                    type: "object",
                    description: "Optional JSON body for POST/PUT requests",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "eBay API response (status and data forwarded as-is)",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          "400": {
            description: "Missing required fields (method or path)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/ebay-trading": {
      post: {
        tags: ["eBay"],
        summary: "eBay Trading API proxy (XML/SOAP)",
        description:
          "Proxies any eBay Trading API call. Automatically wraps params into the XML SOAP envelope and uses the access token from `EBAY_REFRESH_TOKEN`. " +
          "Equivalent to the `ebay_trading_api` MCP tool.",
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
                    example: "GetMyeBaySelling",
                  },
                  params: {
                    type: "object",
                    description: "Request body fields matching the Trading API XML schema",
                    example: {
                      ActiveList: {
                        Include: true,
                        Pagination: { EntriesPerPage: 200, PageNumber: 1 },
                      },
                      DetailLevel: "ReturnAll",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Parsed XML response from eBay Trading API",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          "400": {
            description: "Missing callName",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
};
