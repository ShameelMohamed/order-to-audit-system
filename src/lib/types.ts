// Strict Decimal / Paisa Precision Mathematics
// All amounts and quantities are treated without floating point errors

export type UserRole = 'salesman' | 'admin' | 'production' | 'auditor' | 'owner';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  badge: string;
}

export interface Customer {
  id: number;
  name: string;
  type: 'retailer' | 'distributor';
  state: string; // e.g. 'Tamil Nadu', 'Karnataka'
  gstin: string;
  outstanding_balance: number; // in INR
}

export interface Product {
  id: number;
  name: string;
  pack_size: string; // e.g. '200 g'
  selling_price: number; // e.g. 50.00
  gst_rate: number; // e.g. 5.00
  hsn_code: string; // e.g. '19059040'
}

export interface RawMaterial {
  id: number;
  name: string;
  unit: string; // 'kg', 'litre', 'piece'
  current_stock: number;
  avg_price: number;
  reorder_level: number;
}

export interface BillOfMaterial {
  id: number;
  product_id: number;
  raw_material_id: number;
  standard_qty: number; // e.g. 40kg flour per 200 packets
  expected_output_packets: number; // e.g. 200
}

export interface InventoryLedgerEntry {
  id: number;
  item_type: 'raw' | 'finished';
  item_id: number;
  item_name?: string;
  change_qty: number; // positive = added/produced/purchased, negative = consumed/dispatched
  unit: string;
  reference_type:
    | 'OPENING_BALANCE'
    | 'PURCHASE'
    | 'PRODUCTION_ISSUE'
    | 'PRODUCTION_OUTPUT'
    | 'SALE_DISPATCH'
    | 'CREDIT_NOTE_RESTOCK'
    | 'ADJUSTMENT';
  reference_id?: number | string;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  salesman_name: string;
  customer_id: number;
  customer_name: string;
  status: 'submitted' | 'approved' | 'invoiced' | 'dispatched' | 'rejected';
  items: OrderItem[];
  created_at: string;
  notes?: string;
}

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  state: string;
  is_interstate: boolean;
  hsn_code: string;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_amount: number;
  status: 'active' | 'cancelled';
  credit_note_number?: string;
  created_at: string;
}

export interface CreditNote {
  id: number;
  credit_note_number: string;
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface ProductionRun {
  id: number;
  product_id: number;
  product_name: string;
  batch_number: string;
  expiry_date: string;
  batch_count: number; // standard multiplier, e.g. 1
  flour_used: number; // standard 40
  oil_used: number; // standard 10, actual 10.5
  spice_used: number; // standard 1.2
  pouches_used: number;
  cartons_used: number;
  expected_output_packets: number; // 200
  actual_output_packets: number; // 188
  damaged_pouches: number; // 6
  labour_cost: number; // 1200
  overhead_cost: number; // 600
  cost_per_packet: number;
  yield_variance_pct: number; // -6%
  oil_variance_pct: number; // +5%
  created_at: string;
}

export interface Payment {
  id: number;
  customer_id: number;
  customer_name: string;
  amount: number;
  payment_mode: string;
  reference_no: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  user_role: string;
  entity: string;
  entity_id: number | string;
  details: string;
  created_at: string;
}
