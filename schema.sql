-- Order-to-Audit System PostgreSQL Schema DDL
-- Strict Numeric Precision, Zero Floating Point Errors, Full Auditability

-- 1. Customers Master
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('retailer', 'distributor')),
    state VARCHAR(100) NOT NULL, -- e.g., 'Tamil Nadu', 'Karnataka'
    gstin VARCHAR(15),
    outstanding_balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Master
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pack_size VARCHAR(50) NOT NULL, -- e.g. '200 g'
    selling_price NUMERIC(10,2) NOT NULL, -- e.g. 50.00
    gst_rate NUMERIC(5,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Raw Materials Master
CREATE TABLE IF NOT EXISTS raw_materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'kg', 'litre', 'piece'
    current_stock NUMERIC(12,3) DEFAULT 0.000,
    avg_price NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bill of Materials Master
CREATE TABLE IF NOT EXISTS bill_of_materials (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id INT REFERENCES raw_materials(id) ON DELETE CASCADE,
    standard_qty NUMERIC(12,3) NOT NULL,
    expected_output_packets INT NOT NULL DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Immutable Inventory Ledger (Every movement logged, balances derived)
CREATE TABLE IF NOT EXISTS inventory_ledger (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(20) CHECK (item_type IN ('raw', 'finished')),
    item_id INT NOT NULL,
    change_qty NUMERIC(12,3) NOT NULL, -- Positive for in, negative for out
    unit VARCHAR(20) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- 'OPENING_BALANCE', 'PURCHASE', 'PRODUCTION_ISSUE', 'PRODUCTION_OUTPUT', 'SALE_DISPATCH', 'ADJUSTMENT'
    reference_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Orders Master & Items
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    salesman_name VARCHAR(100) NOT NULL,
    customer_id INT REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'approved', 'invoiced', 'dispatched', 'rejected'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

-- 7. GST Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id),
    state VARCHAR(100) NOT NULL,
    is_interstate BOOLEAN DEFAULT FALSE,
    taxable_value NUMERIC(12,2) NOT NULL,
    cgst NUMERIC(12,2) DEFAULT 0.00,
    sgst NUMERIC(12,2) DEFAULT 0.00,
    igst NUMERIC(12,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Production Runs
CREATE TABLE IF NOT EXISTS production_runs (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    batch_count NUMERIC(5,2) DEFAULT 1.0,
    flour_used NUMERIC(12,3) NOT NULL,
    oil_used NUMERIC(12,3) NOT NULL,
    spice_used NUMERIC(12,3) NOT NULL,
    pouches_used INT NOT NULL,
    cartons_used INT NOT NULL,
    expected_output_packets INT NOT NULL,
    actual_output_packets INT NOT NULL,
    damaged_pouches INT DEFAULT 0,
    labour_cost NUMERIC(10,2) DEFAULT 0.00,
    overhead_cost NUMERIC(10,2) DEFAULT 0.00,
    cost_per_packet NUMERIC(10,2) NOT NULL,
    yield_variance_pct NUMERIC(6,2),
    oil_variance_pct NUMERIC(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    reference_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
