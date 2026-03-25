// ─── Zoho Auth ───────────────────────────────────────────────────────────────

export interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface ZohoAuthState {
  accessToken: string;
  expiresAt: number;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface ZohoListResponse<T> {
  code: number;
  message: string;
  page_context?: {
    page: number;
    per_page: number;
    has_more_page: boolean;
    total: number;
  };
  [key: string]: unknown;
}

export interface LineItem {
  item_id?: string;
  name?: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  tax_id?: string;
  hsn_or_sac?: string;
  item_order?: number;
}

export interface Address {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface Invoice {
  invoice_id?: string;
  invoice_number?: string;
  customer_id?: string;
  customer_name?: string;
  date?: string;
  due_date?: string;
  status?: string;
  line_items?: LineItem[];
  total?: number;
  balance?: number;
  currency_code?: string;
  notes?: string;
  terms?: string;
  shipping_charge?: number;
  payment_terms?: number;
  payment_terms_label?: string;
}

// ─── Sales Orders ────────────────────────────────────────────────────────────

export interface SalesOrder {
  salesorder_id?: string;
  salesorder_number?: string;
  customer_id?: string;
  customer_name?: string;
  date?: string;
  shipment_date?: string;
  status?: string;
  line_items?: LineItem[];
  total?: number;
  currency_code?: string;
  notes?: string;
  billing_address?: Address;
  shipping_address?: Address;
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export interface PurchaseOrder {
  purchaseorder_id?: string;
  purchaseorder_number?: string;
  vendor_id?: string;
  vendor_name?: string;
  date?: string;
  delivery_date?: string;
  status?: string;
  line_items?: LineItem[];
  total?: number;
  currency_code?: string;
  notes?: string;
  delivery_address?: Address;
  salesorder_id?: string;
}

// ─── Bills ───────────────────────────────────────────────────────────────────

export interface Bill {
  bill_id?: string;
  bill_number?: string;
  vendor_id?: string;
  vendor_name?: string;
  date?: string;
  due_date?: string;
  status?: string;
  line_items?: LineItem[];
  total?: number;
  balance?: number;
  currency_code?: string;
  notes?: string;
  purchaseorder_ids?: string[];
}

// ─── Dropshipments ───────────────────────────────────────────────────────────

export interface Dropshipment {
  dropshipment_id?: string;
  salesorder_id?: string;
  purchaseorder_id?: string;
  vendor_id?: string;
  vendor_name?: string;
  status?: string;
  line_items?: LineItem[];
  date?: string;
}

// ─── Contacts / Customers ────────────────────────────────────────────────────

export interface Contact {
  contact_id?: string;
  contact_name?: string;
  company_name?: string;
  contact_type?: string;
  email?: string;
  phone?: string;
  billing_address?: Address;
  shipping_address?: Address;
  currency_code?: string;
  payment_terms?: number;
  payment_terms_label?: string;
  gst_no?: string;
  tax_authority_name?: string;
}

// ─── Items ───────────────────────────────────────────────────────────────────

export interface Item {
  item_id?: string;
  name?: string;
  sku?: string;
  description?: string;
  rate?: number;
  purchase_rate?: number;
  unit?: string;
  item_type?: string;
  product_type?: string;
  hsn_or_sac?: string;
  tax_id?: string;
  vendor_id?: string;
  vendor_name?: string;
  stock_on_hand?: number;
  reorder_level?: number;
}
