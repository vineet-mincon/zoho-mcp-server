import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inventoryClient, booksClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

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

export function registerPurchaseOrderTools(server: McpServer): void {

  // ─── List Purchase Orders ─────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        vendor_name: z.string().optional(),
        status: z.enum(["draft","issued","billed","cancelled"]).optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ vendor_name, status, from_date, to_date, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (vendor_name) params.vendor_name_contains = vendor_name;
        if (status) params.status = status;
        if (from_date) params.date_start = from_date;
        if (to_date) params.date_end = to_date;

        const res = await inventoryClient.get("/purchaseorders", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_purchaseorders"); }
    }
  );

  // ─── Get Purchase Order ───────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_purchaseorder",
    {
      title: "Get Purchase Order Details",
      description: `Get full details of a specific purchase order.

Args:
  - purchaseorder_id (string): The Zoho PO ID

Returns: Complete PO with line items, vendor info, linked sales order, status`,
      inputSchema: z.object({
        purchaseorder_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ purchaseorder_id }) => {
      try {
        const res = await inventoryClient.get(`/purchaseorders/${purchaseorder_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) { handleApiError(e, "zoho_get_purchaseorder"); }
    }
  );

  // ─── Create Purchase Order ────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        vendor_id: z.string(),
        line_items: z.array(LineItemSchema).min(1),
        date: z.string().optional(),
        delivery_date: z.string().optional(),
        purchaseorder_number: z.string().optional(),
        salesorder_id: z.string().optional().describe("Link to Sales Order for dropship"),
        notes: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/purchaseorders", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) { handleApiError(e, "zoho_create_purchaseorder"); }
    }
  );

  // ─── Update Purchase Order ────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_purchaseorder",
    {
      title: "Update Purchase Order",
      description: `Update an existing purchase order. Only draft/issued POs can be updated.

Args:
  - purchaseorder_id (string): The PO ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated PO`,
      inputSchema: z.object({
        purchaseorder_id: z.string(),
        vendor_id: z.string().optional(),
        line_items: z.array(LineItemSchema).optional(),
        date: z.string().optional(),
        delivery_date: z.string().optional(),
        notes: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ purchaseorder_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/purchaseorders/${purchaseorder_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) { handleApiError(e, "zoho_update_purchaseorder"); }
    }
  );

  // ─── Issue / Approve Purchase Order ──────────────────────────────────────

  server.registerTool(
    "zoho_issue_purchaseorder",
    {
      title: "Issue / Approve Purchase Order",
      description: `Mark a Purchase Order as 'issued' (approved). This sends the PO to the vendor.

Args:
  - purchaseorder_id (string): The PO ID to issue

Returns: Success confirmation`,
      inputSchema: z.object({
        purchaseorder_id: z.string(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ purchaseorder_id }) => {
      try {
        const res = await inventoryClient.post(`/purchaseorders/${purchaseorder_id}/status/issued`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_issue_purchaseorder"); }
    }
  );

  // ─── Convert PO to Bill ───────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        purchaseorder_id: z.string(),
        bill_date: z.string().optional(),
        due_date: z.string().optional(),
        bill_number: z.string().optional().describe("Vendor's invoice number"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ purchaseorder_id, bill_date, due_date, bill_number }) => {
      try {
        // First get the PO details to extract vendor and line items
        const poRes = await inventoryClient.get(`/purchaseorders/${purchaseorder_id}`);
        const po = poRes.data.purchaseorder;

        const billPayload: Record<string, unknown> = {
          vendor_id: po.vendor_id,
          line_items: po.line_items,
          purchaseorder_ids: [purchaseorder_id],
          ...(bill_date && { date: bill_date }),
          ...(due_date && { due_date }),
          ...(bill_number && { bill_number }),
        };

        const billRes = await booksClient.post("/bills", billPayload);
        return { content: [{ type: "text", text: formatSuccess(billRes.data.bill) }] };
      } catch (e) { handleApiError(e, "zoho_convert_po_to_bill"); }
    }
  );
}
