import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { booksClient, inventoryClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

const AddressSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export function registerContactTools(server: McpServer): void {

  // ─── List Contacts ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_list_contacts",
    {
      title: "List / Search Contacts",
      description: `Search customers and vendors in Zoho Books.

Args:
  - contact_name (string, optional): Partial name search
  - contact_type (string, optional): customer, vendor
  - page (number, optional): Default 1

Returns: List of contacts with contact_id, contact_name, email, phone, contact_type`,
      inputSchema: z.object({
        contact_name: z.string().optional(),
        contact_type: z.enum(["customer","vendor"]).optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ contact_name, contact_type, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (contact_name) params.contact_name_contains = contact_name;
        if (contact_type) params.contact_type = contact_type;

        const res = await booksClient.get("/contacts", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_contacts"); }
    }
  );

  // ─── Get Contact ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_contact",
    {
      title: "Get Contact Details",
      description: `Get full details of a customer or vendor contact.

Args:
  - contact_id (string): The Zoho contact ID

Returns: Complete contact with addresses, payment terms, GST, outstanding balances`,
      inputSchema: z.object({
        contact_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ contact_id }) => {
      try {
        const res = await booksClient.get(`/contacts/${contact_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) { handleApiError(e, "zoho_get_contact"); }
    }
  );

  // ─── Create Contact ───────────────────────────────────────────────────────

  server.registerTool(
    "zoho_create_contact",
    {
      title: "Create Contact (Customer or Vendor)",
      description: `Create a new customer or vendor in Zoho Books.

Args:
  - contact_name (string): Display name
  - contact_type (string): 'customer' or 'vendor'
  - company_name (string, optional)
  - email / phone (string, optional)
  - billing_address / shipping_address (object, optional)
  - gst_no (string, optional): GST registration number
  - currency_code (string, optional): e.g. USD, INR
  - payment_terms (number, optional): Days (e.g. 30 for Net 30)

Returns: Created contact with contact_id`,
      inputSchema: z.object({
        contact_name: z.string(),
        contact_type: z.enum(["customer","vendor"]),
        company_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        billing_address: AddressSchema.optional(),
        shipping_address: AddressSchema.optional(),
        gst_no: z.string().optional(),
        currency_code: z.string().optional(),
        payment_terms: z.number().int().nonnegative().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await booksClient.post("/contacts", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) { handleApiError(e, "zoho_create_contact"); }
    }
  );

  // ─── Update Contact ───────────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_contact",
    {
      title: "Update Contact",
      description: `Update an existing customer or vendor contact.

Args:
  - contact_id (string): The contact ID to update
  - Other fields: Same as create, only provide fields to change

Returns: Updated contact`,
      inputSchema: z.object({
        contact_id: z.string(),
        contact_name: z.string().optional(),
        company_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        billing_address: AddressSchema.optional(),
        shipping_address: AddressSchema.optional(),
        gst_no: z.string().optional(),
        currency_code: z.string().optional(),
        payment_terms: z.number().int().nonnegative().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ contact_id, ...body }) => {
      try {
        const res = await booksClient.put(`/contacts/${contact_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.contact) }] };
      } catch (e) { handleApiError(e, "zoho_update_contact"); }
    }
  );
}

export function registerItemTools(server: McpServer): void {

  // ─── List Items ───────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_list_items",
    {
      title: "List / Search Inventory Items",
      description: `Search and list items/products from Zoho Inventory.

Args:
  - name (string, optional): Partial name search
  - sku (string, optional): Filter by SKU
  - page (number, optional): Default 1

Returns: List of items with item_id, name, sku, rate, stock_on_hand, vendor info`,
      inputSchema: z.object({
        name: z.string().optional(),
        sku: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ name, sku, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (name) params.name_contains = name;
        if (sku) params.sku = sku;

        const res = await inventoryClient.get("/items", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_list_items"); }
    }
  );

  // ─── Get Item ─────────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_get_item",
    {
      title: "Get Item Details",
      description: `Get full details of an inventory item including stock levels, vendor, pricing.

Args:
  - item_id (string): The Zoho item ID

Returns: Complete item with stock, pricing, vendor, HSN code`,
      inputSchema: z.object({
        item_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ item_id }) => {
      try {
        const res = await inventoryClient.get(`/items/${item_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) { handleApiError(e, "zoho_get_item"); }
    }
  );

  // ─── Create Item ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_create_item",
    {
      title: "Create Inventory Item",
      description: `Create a new product/item in Zoho Inventory.

Args:
  - name (string): Product name
  - rate (number): Selling price
  - purchase_rate (number, optional): Purchase/cost price
  - unit (string, optional): e.g. Pcs, Kg, Box
  - sku (string, optional): Stock keeping unit code
  - description (string, optional)
  - hsn_or_sac (string, optional): HSN code for GST
  - vendor_id (string, optional): Preferred vendor (required for dropshipment)
  - reorder_level (number, optional): Stock reorder trigger level

Returns: Created item with item_id`,
      inputSchema: z.object({
        name: z.string(),
        rate: z.number().nonnegative(),
        purchase_rate: z.number().nonnegative().optional(),
        unit: z.string().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
        hsn_or_sac: z.string().optional(),
        vendor_id: z.string().optional().describe("Preferred vendor — required for dropshipment"),
        reorder_level: z.number().nonnegative().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await inventoryClient.post("/items", params);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) { handleApiError(e, "zoho_create_item"); }
    }
  );

  // ─── Update Item ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_update_item",
    {
      title: "Update Inventory Item",
      description: `Update an existing inventory item. Also use this to assign/change a preferred vendor (needed for dropshipment).

Args:
  - item_id (string): The item ID to update
  - vendor_id (string, optional): Set/change preferred vendor for dropshipment
  - Other fields: Same as create

Returns: Updated item`,
      inputSchema: z.object({
        item_id: z.string(),
        name: z.string().optional(),
        rate: z.number().nonnegative().optional(),
        purchase_rate: z.number().nonnegative().optional(),
        unit: z.string().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
        hsn_or_sac: z.string().optional(),
        vendor_id: z.string().optional().describe("Set preferred vendor for dropshipment"),
        reorder_level: z.number().nonnegative().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ item_id, ...body }) => {
      try {
        const res = await inventoryClient.put(`/items/${item_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data.item) }] };
      } catch (e) { handleApiError(e, "zoho_update_item"); }
    }
  );
}
