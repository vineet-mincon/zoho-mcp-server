import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inventoryClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

const LineItemSchema = z.object({
  item_id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  unit: z.string().optional(),
  tax_id: z.string().optional(),
  hsn_or_sac: z.string().optional(),
});

const AddressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export function registerSalesOrderTools(server: McpServer): void {

  // ─── List Sales Orders ────────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        customer_name: z.string().optional(),
        status: z.enum(["draft","confirmed","closed","void","invoiced","partially_invoiced"]).optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ customer_name, status, from_date, to_date, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (customer_name) params.customer_name_contains = customer_name;
        if (status) params.status = status;
        if (from_date) params.date_start = from_date;
        if (to_date) params.date_end = to_date;

        const res = await inventoryClient.get("/salesorders", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_salesorders"); }
    }
  );

  // ─── Get Sales Order ──────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_salesorder",
    {
      title: "Get Sales Order Details",
      description: `Get full details of a specific sales order including line items, dropshipment info, and linked documents.

Args:
  - salesorder_id (string): The Zoho sales order ID

Returns: Complete sales order object`,
      inputSchema: z.object({
        salesorder_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ salesorder_id }) => {
      try {
        const res = await inventoryClient.get(`/salesorders/${salesorder_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) { handleApiError(e, "zoho_get_salesorder"); }
    }
  );

  // ─── Create Sales Order ───────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        customer_id: z.string(),
        line_items: z.array(LineItemSchema).min(1),
        date: z.string().optional(),
        shipment_date: z.string().optional(),
        salesorder_number: z.string().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        billing_address: AddressSchema.optional(),
        shipping_address: AddressSchema.optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/salesorders", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) { handleApiError(e, "zoho_create_salesorder"); }
    }
  );

  // ─── Update Sales Order ───────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_salesorder",
    {
      title: "Update Sales Order",
      description: `Update an existing sales order. Only confirmed (not closed/invoiced) orders can be updated.

Args:
  - salesorder_id (string): The SO ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated sales order`,
      inputSchema: z.object({
        salesorder_id: z.string(),
        customer_id: z.string().optional(),
        line_items: z.array(LineItemSchema).optional(),
        date: z.string().optional(),
        shipment_date: z.string().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ salesorder_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/salesorders/${salesorder_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.salesorder) }] };
      } catch (e) { handleApiError(e, "zoho_update_salesorder"); }
    }
  );

  // ─── Confirm Sales Order ──────────────────────────────────────────────────

  server.registerTool(
    "zoho_confirm_salesorder",
    {
      title: "Confirm Sales Order",
      description: `Change a Sales Order status from draft to confirmed. Required before creating dropshipments.

Args:
  - salesorder_id (string): The SO ID to confirm

Returns: Success confirmation`,
      inputSchema: z.object({
        salesorder_id: z.string(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ salesorder_id }) => {
      try {
        const res = await inventoryClient.post(`/salesorders/${salesorder_id}/status/confirmed`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_confirm_salesorder"); }
    }
  );
}
