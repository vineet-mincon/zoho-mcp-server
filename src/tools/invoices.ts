import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { booksClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

const LineItemSchema = z.object({
  item_id: z.string().optional().describe("Zoho item ID"),
  name: z.string().optional().describe("Item name (if no item_id)"),
  description: z.string().optional(),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  unit: z.string().optional(),
  tax_id: z.string().optional(),
  hsn_or_sac: z.string().optional().describe("HSN/SAC code for GST"),
});

export function registerInvoiceTools(server: McpServer): void {

  // ─── List / Search Invoices ───────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        customer_name: z.string().optional(),
        status: z.enum(["draft","sent","overdue","paid","void","unpaid","partially_paid"]).optional(),
        from_date: z.string().optional().describe("YYYY-MM-DD"),
        to_date: z.string().optional().describe("YYYY-MM-DD"),
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

        const res = await booksClient.get("/invoices", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_invoices"); }
    }
  );

  // ─── Get Invoice ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_invoice",
    {
      title: "Get Invoice Details",
      description: `Get full details of a specific invoice including all line items, payment history, and totals.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Complete invoice object with line items, totals, customer info, payment terms`,
      inputSchema: z.object({
        invoice_id: z.string().describe("Zoho invoice ID"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.get(`/invoices/${invoice_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) { handleApiError(e, "zoho_get_invoice"); }
    }
  );

  // ─── Create Invoice ───────────────────────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        customer_id: z.string().describe("Zoho contact/customer ID"),
        line_items: z.array(LineItemSchema).min(1),
        date: z.string().optional().describe("YYYY-MM-DD"),
        due_date: z.string().optional().describe("YYYY-MM-DD"),
        invoice_number: z.string().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        shipping_charge: z.number().nonnegative().optional(),
        salesorder_id: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await booksClient.post("/invoices", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) { handleApiError(e, "zoho_create_invoice"); }
    }
  );

  // ─── Update Invoice ───────────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_invoice",
    {
      title: "Update Invoice",
      description: `Update an existing invoice in Zoho Books. Only provide fields you want to change.

Args:
  - invoice_id (string): The Zoho invoice ID to update
  - line_items / date / due_date / notes / terms / shipping_charge: Fields to update

Returns: Updated invoice object`,
      inputSchema: z.object({
        invoice_id: z.string(),
        customer_id: z.string().optional(),
        line_items: z.array(LineItemSchema).optional(),
        date: z.string().optional(),
        due_date: z.string().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        shipping_charge: z.number().nonnegative().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ invoice_id, ...body }) => {
      try {
        const res = await booksClient.put(`/invoices/${invoice_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.invoice) }] };
      } catch (e) { handleApiError(e, "zoho_update_invoice"); }
    }
  );

  // ─── Mark Invoice Sent ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_mark_invoice_sent",
    {
      title: "Mark Invoice as Sent",
      description: `Mark an invoice status as 'sent'. Use after creating a draft invoice.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Success confirmation`,
      inputSchema: z.object({
        invoice_id: z.string(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.post(`/invoices/${invoice_id}/status/sent`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_mark_invoice_sent"); }
    }
  );

  // ─── Void Invoice ─────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_void_invoice",
    {
      title: "Void Invoice",
      description: `Void/cancel an invoice. This cannot be undone easily.

Args:
  - invoice_id (string): The Zoho invoice ID

Returns: Success confirmation`,
      inputSchema: z.object({
        invoice_id: z.string(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ invoice_id }) => {
      try {
        const res = await booksClient.post(`/invoices/${invoice_id}/status/void`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_void_invoice"); }
    }
  );
}
