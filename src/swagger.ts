export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "zoho-common-endpoints",
    version: "1.0.0",
    description:
      "Lightweight MCP server exposing workflow tools NOT covered by native Zoho MCP integrations. " +
      "Provides two MCP tools (`zoho_confirm_salesorder`, `zoho_link_po_to_salesorder`) " +
      "plus a `/sync` webhook router for triggering the same operations via HTTP events.",
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
    { name: "System",  description: "Health and status endpoints" },
    { name: "MCP",    description: "Model Context Protocol transport" },
    { name: "Webhook", description: "Sync webhook router for Zoho workflow events" },
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
                    status:       { type: "string", example: "ok" },
                    server:       { type: "string", example: "zoho-common-endpoints" },
                    version:      { type: "string", example: "1.0.0" },
                    tools_count:  { type: "number", example: 2 },
                    tools: {
                      type: "object",
                      properties: {
                        common: {
                          type: "array",
                          items: { type: "string" },
                          example: ["zoho_confirm_salesorder", "zoho_link_po_to_salesorder"],
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
        summary: "Raw OpenAPI spec",
        operationId: "openApiSpec",
        responses: {
          "200": {
            description: "OpenAPI 3.0 JSON spec",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/mcp": {
      get: {
        tags: ["MCP"],
        summary: "MCP endpoint info",
        operationId: "mcpInfo",
        responses: {
          "200": {
            description: "Confirmation the MCP endpoint is reachable",
            content: { "text/plain": { schema: { type: "string" } } },
          },
        },
      },
      post: {
        tags: ["MCP"],
        summary: "MCP Streamable HTTP transport",
        description:
          "Primary endpoint for MCP tool calls (JSON-RPC 2.0).\n\n" +
          "**Available tools (2):**\n\n" +
          "- `zoho_confirm_salesorder` — change a Sales Order from draft → confirmed\n" +
          "- `zoho_link_po_to_salesorder` — link an existing Purchase Order to a Sales Order",
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
                  summary: "List available tools",
                  value: { jsonrpc: "2.0", id: "1", method: "tools/list", params: {} },
                },
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: {
                    jsonrpc: "2.0", id: "2", method: "tools/call",
                    params: { name: "zoho_confirm_salesorder", arguments: { salesorder_id: "SO-00001" } },
                  },
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: {
                    jsonrpc: "2.0", id: "3", method: "tools/call",
                    params: {
                      name: "zoho_link_po_to_salesorder",
                      arguments: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "JSON-RPC response with tool result",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/sync": {
      post: {
        tags: ["Webhook"],
        summary: "Sync webhook — trigger Zoho workflow events via HTTP",
        description:
          "Accepts a JSON payload with an `event` name and `payload` object. " +
          "Executes the corresponding Zoho API call and returns the result.\n\n" +
          "**Supported events:**\n\n" +
          "- `confirm_salesorder` — confirms a draft SO\n" +
          "- `link_po_to_salesorder` — links a PO to a SO",
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
                    description: "The workflow event to trigger",
                  },
                  payload: {
                    type: "object",
                    description: "Event-specific data",
                  },
                },
              },
              examples: {
                confirm_so: {
                  summary: "Confirm a Sales Order",
                  value: { event: "confirm_salesorder", payload: { salesorder_id: "SO-00001" } },
                },
                link_po: {
                  summary: "Link PO to Sales Order",
                  value: {
                    event: "link_po_to_salesorder",
                    payload: { purchaseorder_id: "PO-00001", salesorder_id: "SO-00001" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Event handled successfully",
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
