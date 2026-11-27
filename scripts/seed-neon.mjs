import { Pool } from 'pg';

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Seeding benchmark master data into Neon PostgreSQL...');

  // Reset and clean tables
  await pool.query(`
    TRUNCATE TABLE audit_logs, payments, invoices, order_items, orders, 
                   inventory_ledger, bill_of_materials, raw_materials, products, customers 
    RESTART IDENTITY CASCADE;
  `);

  // 1. Customers
  await pool.query(`
    INSERT INTO customers (id, name, type, state, gstin, outstanding_balance) VALUES
    (1, 'Retailer A', 'retailer', 'Tamil Nadu', '33AAAAA0000A1Z5', 0.00),
    (2, 'Distributor B', 'distributor', 'Karnataka', '29BBBBB1111B2Z6', 0.00);
  `);

  // 2. Products
  await pool.query(`
    INSERT INTO products (id, name, pack_size, selling_price, gst_rate) VALUES
    (1, 'Murukku 200 g', '200 g', 50.00, 5.00),
    (2, 'Murukku 500 g', '500 g', 120.00, 5.00);
  `);

  // 3. Raw Materials (Opening Stock)
  await pool.query(`
    INSERT INTO raw_materials (id, name, unit, current_stock, avg_price) VALUES
    (1, 'Flour', 'kg', 100.000, 42.00),
    (2, 'Cooking oil', 'litre', 30.000, 140.00),
    (3, 'Salt and spice mix', 'kg', 5.000, 200.00),
    (4, '200 g pouch', 'piece', 500.000, 2.50),
    (5, 'Carton (holds 20 packets)', 'piece', 30.000, 15.00);
  `);

  // 4. Bill of Materials
  await pool.query(`
    INSERT INTO bill_of_materials (product_id, raw_material_id, standard_qty, expected_output_packets) VALUES
    (1, 1, 40.000, 200),
    (1, 2, 10.000, 200),
    (1, 3, 1.200, 200),
    (1, 4, 200.000, 200),
    (1, 5, 10.000, 200),
    (2, 1, 50.000, 100),
    (2, 2, 12.500, 100),
    (2, 3, 1.500, 100);
  `);

  // 5. Initial Inventory Ledger (Opening balances)
  await pool.query(`
    INSERT INTO inventory_ledger (item_type, item_id, change_qty, unit, reference_type, notes) VALUES
    ('raw', 1, 100.000, 'kg', 'OPENING_BALANCE', 'Opening stock per Section 5 Benchmark'),
    ('raw', 2, 30.000, 'litre', 'OPENING_BALANCE', 'Opening stock per Section 5 Benchmark'),
    ('raw', 3, 5.000, 'kg', 'OPENING_BALANCE', 'Opening stock per Section 5 Benchmark'),
    ('raw', 4, 500.000, 'piece', 'OPENING_BALANCE', 'Opening stock per Section 5 Benchmark'),
    ('raw', 5, 30.000, 'piece', 'OPENING_BALANCE', 'Opening stock per Section 5 Benchmark'),
    ('finished', 1, 50.000, 'packet', 'OPENING_BALANCE', 'Finished goods opening stock 50 packets');
  `);

  // 6. Initial Audit Log
  await pool.query(`
    INSERT INTO audit_logs (action, user_role, entity, entity_id, details) VALUES
    ('SEED_MASTER_DATA', 'system', 'database', 'init', 'Loaded Section 5 Benchmark master data');
  `);

  // Set sequence counters
  await pool.query(`
    SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
    SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
    SELECT setval('raw_materials_id_seq', (SELECT MAX(id) FROM raw_materials));
  `);

  console.log('✓ Master data seeded successfully into Neon PostgreSQL!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
