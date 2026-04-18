import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inventoryClient, booksClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

export function registerCommonTools(server: McpServer): void {

  // ─── Confirm Sales Order ──────────────────────────────────────────────────

  server.registerTool(
    "zoho_confirm_salesorder",
    {
      title: "Confirm Sales Order",
      description: `Change a Sales Order status from draft to confirmed. Required before creating dropshipments or purchase orders against it.

Args:
  - salesorder_id (string): The SO ID to confirm

Returns: Success confirmation`,
      inputSchema: z.object({
        salesorder_id: z.string().describe("Zoho Sales Order ID to confirm"),
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

  // ─── Link PO to Sales Order ───────────────────────────────────────────────

  server.registerTool(
    "zoho_link_po_to_salesorder",
    {
      title: "Link Purchase Order to Sales Order",
      description: `Link an existing Purchase Order to a Sales Order. Use this when a PO has already been created manually and needs to be associated with a customer's Sales Order for tracking and dropship workflows.

Args:
  - purchaseorder_id (string): Existing PO to link
  - salesorder_id (string): The customer's Sales Order to link to

Returns: Updated PO with salesorder reference`,
      inputSchema: z.object({
        purchaseorder_id: z.string().describe("Existing Purchase Order ID"),
        salesorder_id: z.string().describe("Sales Order ID to link to"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ purchaseorder_id, salesorder_id }) => {
      try {
        const res = await inventoryClient.put(`/purchaseorders/${purchaseorder_id}`, {
          salesorder_id,
        });
        return { content: [{ type: "text", text: formatSuccess(res.data.purchaseorder) }] };
      } catch (e) { handleApiError(e, "zoho_link_po_to_salesorder"); }
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

  // ─── Create Invoice from Sales Order ─────────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        salesorder_id: z.string().describe("Confirmed Sales Order ID"),
        invoice_date: z.string().optional().describe("YYYY-MM-DD"),
        due_date: z.string().optional().describe("YYYY-MM-DD"),
        invoice_number: z.string().optional(),
        notes: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ salesorder_id, invoice_date, due_date, invoice_number, notes }) => {
      try {
        // Fetch SO to pull customer + line items
        const soRes = await inventoryClient.get(`/salesorders/${salesorder_id}`);
        const so = soRes.data.salesorder;

        const invoicePayload: Record<string, unknown> = {
          customer_id: so.customer_id,
          salesorder_id,
          line_items: so.line_items,
          ...(invoice_date && { date: invoice_date }),
          ...(due_date && { due_date }),
          ...(invoice_number && { invoice_number }),
          ...(notes && { notes }),
        };

        const invRes = await booksClient.post("/invoices", invoicePayload);
        return { content: [{ type: "text", text: formatSuccess(invRes.data.invoice) }] };
      } catch (e) { handleApiError(e, "zoho_create_invoice_from_salesorder"); }
    }
  );
}
