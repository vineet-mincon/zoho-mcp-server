import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inventoryClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

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
}
