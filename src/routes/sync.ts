import { Router, Request, Response } from "express";
import { inventoryClient, booksClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

const router = Router();

/**
 * POST /sync
 *
 * Webhook router for syncing Zoho workflow events.
 * Expects JSON body with:
 *   - event  (string): the event type to handle
 *   - payload (object): event-specific data
 *
 * Supported events:
 *   - "confirm_salesorder"      → confirms a draft SO
 *   - "link_po_to_salesorder"   → links a PO to a SO
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { event, payload } = req.body ?? {};

  if (!event || typeof event !== "string") {
    res.status(400).json({ error: "Missing or invalid 'event' field" });
    return;
  }

  if (!payload || typeof payload !== "object") {
    res.status(400).json({ error: "Missing or invalid 'payload' field" });
    return;
  }

  try {
    switch (event) {

      case "confirm_salesorder": {
        const { salesorder_id } = payload as { salesorder_id?: string };
        if (!salesorder_id) {
          res.status(400).json({ error: "payload.salesorder_id is required" });
          return;
        }
        const result = await inventoryClient.post(
          `/salesorders/${salesorder_id}/status/confirmed`
        );
        res.json({ event, status: "ok", data: result.data });
        break;
      }

      case "link_po_to_salesorder": {
        const { purchaseorder_id, salesorder_id } = payload as {
          purchaseorder_id?: string;
          salesorder_id?: string;
        };
        if (!purchaseorder_id || !salesorder_id) {
          res.status(400).json({
            error: "payload.purchaseorder_id and payload.salesorder_id are required",
          });
          return;
        }
        const result = await inventoryClient.put(
          `/purchaseorders/${purchaseorder_id}`,
          { salesorder_id }
        );
        res.json({ event, status: "ok", data: result.data.purchaseorder });
        break;
      }

      default:
        res.status(400).json({ error: `Unknown event: '${event}'` });
    }
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown }; message?: string };
    res
      .status(e.response?.status ?? 500)
      .json({ event, status: "error", error: e.response?.data ?? e.message ?? "Unknown error" });
  }
});

export { router as syncRouter };
