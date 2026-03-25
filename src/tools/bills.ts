import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { booksClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

const LineItemSchema = z.object({
  item_id: z.string().optional(),
  account_id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  unit: z.string().optional(),
  tax_id: z.string().optional(),
  hsn_or_sac: z.string().optional(),
});

export function registerBillTools(server: McpServer): void {

  // ─── List Bills ───────────────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        vendor_name: z.string().optional(),
        status: z.enum(["open","overdue","paid","void","partially_paid"]).optional(),
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

        const res = await booksClient.get("/bills", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_bills"); }
    }
  );

  // ─── Get Bill ─────────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_bill",
    {
      title: "Get Bill Details",
      description: `Get full details of a specific vendor bill.

Args:
  - bill_id (string): The Zoho bill ID

Returns: Complete bill with line items, vendor info, payment history`,
      inputSchema: z.object({
        bill_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ bill_id }) => {
      try {
        const res = await booksClient.get(`/bills/${bill_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) { handleApiError(e, "zoho_get_bill"); }
    }
  );

  // ─── Create Bill ──────────────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        vendor_id: z.string(),
        line_items: z.array(LineItemSchema).min(1),
        date: z.string().optional(),
        due_date: z.string().optional(),
        bill_number: z.string().optional().describe("Vendor's own invoice number"),
        purchaseorder_ids: z.array(z.string()).optional().describe("Link to PO(s)"),
        notes: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await booksClient.post("/bills", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) { handleApiError(e, "zoho_create_bill"); }
    }
  );

  // ─── Update Bill ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_bill",
    {
      title: "Update Bill",
      description: `Update an existing vendor bill. Only open/draft bills can be updated.

Args:
  - bill_id (string): The bill ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated bill`,
      inputSchema: z.object({
        bill_id: z.string(),
        vendor_id: z.string().optional(),
        line_items: z.array(LineItemSchema).optional(),
        date: z.string().optional(),
        due_date: z.string().optional(),
        bill_number: z.string().optional(),
        notes: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ bill_id, ...body }) => {
      try {
        const res = await booksClient.put(`/bills/${bill_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.bill) }] };
      } catch (e) { handleApiError(e, "zoho_update_bill"); }
    }
  );
}
