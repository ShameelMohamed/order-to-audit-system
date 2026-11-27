import { getDbPool } from './db';
import { round2, round3 } from './math';

export async function persistPurchaseToNeon(rawMaterialId: number, qty: number, rate: number, supplier: string, newAvgPrice: number) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update raw_materials stock and avg_price
      await client.query(
        'UPDATE raw_materials SET current_stock = current_stock + $1, avg_price = $2 WHERE id = $3',
        [qty, newAvgPrice, rawMaterialId]
      );

      // Record in inventory_ledger
      await client.query(
        `INSERT INTO inventory_ledger (item_type, item_id, change_qty, unit, reference_type, notes)
         VALUES ('raw', $1, $2, (SELECT unit FROM raw_materials WHERE id = $1), 'PURCHASE', $3)`,
        [rawMaterialId, qty, `Purchase from ${supplier} @ ₹${rate}`]
      );

      // Record in audit_logs
      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('PURCHASE', 'admin', 'raw_material', $1, $2)`,
        [String(rawMaterialId), `Purchased ${qty} @ ₹${rate} from ${supplier}`]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Purchase sync:', err.message);
  }
}

export async function persistProductionRunToNeon(run: any) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert production run
      const runRes = await client.query(
        `INSERT INTO production_runs 
         (product_id, batch_count, flour_used, oil_used, spice_used, pouches_used, cartons_used, expected_output_packets, actual_output_packets, damaged_pouches, labour_cost, overhead_cost, cost_per_packet, yield_variance_pct, oil_variance_pct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id`,
        [
          run.product_id,
          run.batch_count || 1.0,
          run.flour_used,
          run.oil_used,
          run.spice_used,
          run.pouches_used,
          run.cartons_used,
          run.expected_output_packets,
          run.actual_output_packets,
          run.damaged_pouches,
          run.labour_cost,
          run.overhead_cost,
          run.cost_per_packet,
          run.yield_variance_pct,
          run.oil_variance_pct,
        ]
      );
      const runId = runRes.rows[0]?.id || run.id;

      // Update Raw Material Stock in Ledger
      await client.query(`
        INSERT INTO inventory_ledger (item_type, item_id, change_qty, unit, reference_type, reference_id, notes) VALUES
        ('raw', 1, ${-run.flour_used}, 'kg', 'PRODUCTION_ISSUE', '${runId}', 'Issued to batch'),
        ('raw', 2, ${-run.oil_used}, 'litre', 'PRODUCTION_ISSUE', '${runId}', 'Issued to batch'),
        ('raw', 3, ${-run.spice_used}, 'kg', 'PRODUCTION_ISSUE', '${runId}', 'Issued to batch'),
        ('raw', 4, ${-run.pouches_used}, 'piece', 'PRODUCTION_ISSUE', '${runId}', '${run.actual_output_packets} used + ${run.damaged_pouches} damaged'),
        ('raw', 5, ${-run.cartons_used}, 'piece', 'PRODUCTION_ISSUE', '${runId}', 'Cartons consumed'),
        ('finished', ${run.product_id}, ${run.actual_output_packets}, 'packet', 'PRODUCTION_OUTPUT', '${runId}', 'Batch output produced')
      `);

      // Update current_stock on raw_materials
      await client.query('UPDATE raw_materials SET current_stock = current_stock - $1 WHERE id = 1', [run.flour_used]);
      await client.query('UPDATE raw_materials SET current_stock = current_stock - $1 WHERE id = 2', [run.oil_used]);
      await client.query('UPDATE raw_materials SET current_stock = current_stock - $1 WHERE id = 3', [run.spice_used]);
      await client.query('UPDATE raw_materials SET current_stock = current_stock - $1 WHERE id = 4', [run.pouches_used]);
      await client.query('UPDATE raw_materials SET current_stock = current_stock - $1 WHERE id = 5', [run.cartons_used]);

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('PRODUCTION_RUN', 'supervisor', 'production_run', $1, $2)`,
        [String(runId), `Produced ${run.actual_output_packets} pkts of product ${run.product_id}`]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Production sync:', err.message);
  }
}

export async function persistOrderToNeon(order: any) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderRes = await client.query(
        'INSERT INTO orders (salesman_name, customer_id, status, notes) VALUES ($1, $2, $3, $4) RETURNING id',
        [order.salesman_name, order.customer_id, order.status, order.notes || '']
      );
      const orderId = orderRes.rows[0]?.id || order.id;

      for (const item of order.items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.unit_price]
        );
      }

      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('ORDER_CREATE', 'salesman', 'order', $1, $2)`,
        [String(orderId), `Created order for customer ${order.customer_id}`]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Order sync:', err.message);
  }
}

export async function persistInvoiceToNeon(invoice: any) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO invoices 
         (order_id, invoice_number, customer_id, state, is_interstate, taxable_value, cgst, sgst, igst, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          invoice.order_id,
          invoice.invoice_number,
          invoice.customer_id,
          invoice.state,
          invoice.is_interstate,
          invoice.taxable_value,
          invoice.cgst,
          invoice.sgst,
          invoice.igst,
          invoice.total_amount,
        ]
      );

      // Update customer outstanding
      await client.query('UPDATE customers SET outstanding_balance = outstanding_balance + $1 WHERE id = $2', [
        invoice.total_amount,
        invoice.customer_id,
      ]);

      // Update order status
      await client.query("UPDATE orders SET status = 'invoiced' WHERE id = $1", [invoice.order_id]);

      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('INVOICE_GENERATED', 'admin', 'invoice', $1, $2)`,
        [invoice.invoice_number, `Invoice total ₹${invoice.total_amount}`]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Invoice sync:', err.message);
  }
}

export async function persistDispatchToNeon(orderId: number, items: any[]) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("UPDATE orders SET status = 'dispatched' WHERE id = $1", [orderId]);

      for (const item of items) {
        await client.query(
          `INSERT INTO inventory_ledger (item_type, item_id, change_qty, unit, reference_type, reference_id, notes)
           VALUES ('finished', $1, $2, 'packet', 'SALE_DISPATCH', $3, 'Dispatched against Order')`,
          [item.product_id, -item.quantity, String(orderId)]
        );
      }

      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('DISPATCH', 'admin', 'order', $1, 'Dispatched items')`,
        [String(orderId)]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Dispatch sync:', err.message);
  }
}

export async function persistPaymentToNeon(payment: any) {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO payments (customer_id, amount, payment_mode, reference_no) VALUES ($1, $2, $3, $4)',
        [payment.customer_id, payment.amount, payment.payment_mode, payment.reference_no]
      );

      await client.query('UPDATE customers SET outstanding_balance = outstanding_balance - $1 WHERE id = $2', [
        payment.amount,
        payment.customer_id,
      ]);

      await client.query(
        `INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
         VALUES ('PAYMENT_RECEIVED', 'admin', 'payment', $1, $2)`,
        [String(payment.customer_id), `Payment ₹${payment.amount}`]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[Neon Sync] Payment sync:', err.message);
  }
}
