import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inventoryClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

export function registerDropshipmentTools(server: McpServer): void {

  // ─── List Dropshipments ───────────────────────────────────────────────────

  server.registerTool(
    "zoho_list_dropshipments",
    {
      title: "List Dropshipments",
      description: `List all dropshipments, optionally filtered by sales order or vendor.

Args:
  - salesorder_id (string, optional): Filter by linked sales order
  - page (number, optional): Default 1

Returns: List of dropshipments with status, linked SO and PO IDs`,
      inputSchema: z.object({
        salesorder_id: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ salesorder_id, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (salesorder_id) params.salesorder_id = salesorder_id;

        const res = await inventoryClient.get("/dropshipments", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_dropshipments"); }
    }
  );

  // ─── Create Dropshipment from Sales Order ─────────────────────────────────

  server.registerTool(
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
      inputSchema: z.object({
        salesorder_id: z.string().describe("Must be a confirmed Sales Order"),
        vendor_id: z.string().optional().describe("Override default vendor"),
        date: z.string().optional().describe("YYYY-MM-DD"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ salesorder_id, vendor_id, date }) => {
      try {
        // Verify SO is confirmed first
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

        const payload: Record<string, unknown> = {
          salesorder_id,
          ...(vendor_id && { vendor_id }),
          ...(date && { date }),
        };

        const res = await inventoryClient.post("/dropshipments", payload);
        return { content: [{ type: "text", text: formatSuccess(res.data.dropshipment ?? res.data) }] };
      } catch (e) { handleApiError(e, "zoho_create_dropshipment"); }
    }
  );

  // ─── Get Dropshipment ─────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_dropshipment",
    {
      title: "Get Dropshipment Details",
      description: `Get full details of a dropshipment including linked SO and PO.

Args:
  - dropshipment_id (string): The Zoho dropshipment ID

Returns: Complete dropshipment object with linked document IDs`,
      inputSchema: z.object({
        dropshipment_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ dropshipment_id }) => {
      try {
        const res = await inventoryClient.get(`/dropshipments/${dropshipment_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.dropshipment) }] };
      } catch (e) { handleApiError(e, "zoho_get_dropshipment"); }
    }
  );

  // ─── Link PO to Sales Order ───────────────────────────────────────────────

  server.registerTool(
    "zoho_link_po_to_salesorder",
    {
      title: "Link Purchase Order to Sales Order",
      description: `Link an existing Purchase Order to a Sales Order. Use this when you have already created a PO manually and want to associate it with a customer's Sales Order for tracking.

Args:
  - purchaseorder_id (string): Existing PO to link
  - salesorder_id (string): The customer's Sales Order to link to

Returns: Updated PO with salesorder reference`,
      inputSchema: z.object({
        purchaseorder_id: z.string(),
        salesorder_id: z.string(),
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
}
