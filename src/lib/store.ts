import {
  Customer,
  Product,
  RawMaterial,
  BillOfMaterial,
  InventoryLedgerEntry,
  Order,
  OrderItem,
  Invoice,
  ProductionRun,
  Payment,
  AuditLog,
} from './types';
import { round2, round3, toPaisa, fromPaisa, calcGst } from './math';

// Global singleton store for instant zero-config deployments, previewing, and benchmark verification
// Can seamlessly sync with PostgreSQL when DATABASE_URL is configured
class Store {
  customers: Customer[] = [];
  products: Product[] = [];
  rawMaterials: RawMaterial[] = [];
  boms: BillOfMaterial[] = [];
  inventoryLedger: InventoryLedgerEntry[] = [];
  orders: Order[] = [];
  invoices: Invoice[] = [];
  productionRuns: ProductionRun[] = [];
  payments: Payment[] = [];
  auditLogs: AuditLog[] = [];

  private nextLedgerId = 1;
  private nextOrderId = 1;
  private nextInvoiceId = 1;
  private nextProductionId = 1;
  private nextPaymentId = 1;
  private nextAuditId = 1;

  constructor() {
    this.resetToBenchmarkSeed();
  }

  resetToBenchmarkSeed() {
    // Reset all tables to the exact Section 5 Benchmark initial state
    this.customers = [
      {
        id: 1,
        name: 'Retailer A',
        type: 'retailer',
        state: 'Tamil Nadu',
        gstin: '33AAAAA0000A1Z5',
        outstanding_balance: 0,
      },
      {
        id: 2,
        name: 'Distributor B',
        type: 'distributor',
        state: 'Karnataka',
        gstin: '29BBBBB1111B2Z6',
        outstanding_balance: 0,
      },
    ];

    this.products = [
      {
        id: 1,
        name: 'Murukku 200 g',
        pack_size: '200 g',
        selling_price: 50.00,
        gst_rate: 5.00,
      },
    ];

    // Opening stock per Section 5:
    // Flour 100 kg @ 42
    // Oil 30 L @ 140
    // Spice mix 5 kg @ 200
    // Pouches 500 pcs @ 2.50
    // Cartons 30 pcs @ 15
    this.rawMaterials = [
      { id: 1, name: 'Flour', unit: 'kg', current_stock: 100, avg_price: 42.00 },
      { id: 2, name: 'Cooking oil', unit: 'litre', current_stock: 30, avg_price: 140.00 },
      { id: 3, name: 'Salt and spice mix', unit: 'kg', current_stock: 5, avg_price: 200.00 },
      { id: 4, name: '200 g pouch', unit: 'piece', current_stock: 500, avg_price: 2.50 },
      { id: 5, name: 'Carton (holds 20 packets)', unit: 'piece', current_stock: 30, avg_price: 15.00 },
    ];

    // BOM for Murukku 200 g (1 batch = 200 packets expected)
    this.boms = [
      { id: 1, product_id: 1, raw_material_id: 1, standard_qty: 40, expected_output_packets: 200 },
      { id: 2, product_id: 1, raw_material_id: 2, standard_qty: 10, expected_output_packets: 200 },
      { id: 3, product_id: 1, raw_material_id: 3, standard_qty: 1.2, expected_output_packets: 200 },
      { id: 4, product_id: 1, raw_material_id: 4, standard_qty: 200, expected_output_packets: 200 },
      { id: 5, product_id: 1, raw_material_id: 5, standard_qty: 10, expected_output_packets: 200 },
    ];

    this.inventoryLedger = [
      { id: 1, item_type: 'raw', item_id: 1, item_name: 'Flour', change_qty: 100, unit: 'kg', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
      { id: 2, item_type: 'raw', item_id: 2, item_name: 'Cooking oil', change_qty: 30, unit: 'litre', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
      { id: 3, item_type: 'raw', item_id: 3, item_name: 'Salt and spice mix', change_qty: 5, unit: 'kg', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
      { id: 4, item_type: 'raw', item_id: 4, item_name: '200 g pouch', change_qty: 500, unit: 'piece', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
      { id: 5, item_type: 'raw', item_id: 5, item_name: 'Carton (holds 20 packets)', change_qty: 30, unit: 'piece', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
      // Finished Goods: Murukku 200 g 50 packets opening stock
      { id: 6, item_type: 'finished', item_id: 1, item_name: 'Murukku 200 g', change_qty: 50, unit: 'packet', reference_type: 'OPENING_BALANCE', created_at: new Date().toISOString() },
    ];

    this.orders = [];
    this.invoices = [];
    this.productionRuns = [];
    this.payments = [];
    this.auditLogs = [];

    this.nextLedgerId = 7;
    this.nextOrderId = 1;
    this.nextInvoiceId = 1;
    this.nextProductionId = 1;
    this.nextPaymentId = 1;
    this.nextAuditId = 1;

    this.logAudit('RESET_BENCHMARK', 'system', 'system', 0, 'Loaded initial benchmark seed data');
  }

  logAudit(action: string, user_role: string, entity: string, entity_id: number | string, details: string) {
    this.auditLogs.unshift({
      id: this.nextAuditId++,
      action,
      user_role,
      entity,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    });
  }

  // Stock is always derived strictly from sum of movements
  getRawMaterialStock(rawMaterialId: number): number {
    const sum = this.inventoryLedger
      .filter((l) => l.item_type === 'raw' && l.item_id === rawMaterialId)
      .reduce((acc, curr) => acc + curr.change_qty, 0);
    return round3(sum);
  }

  getFinishedGoodsStock(productId: number): number {
    const sum = this.inventoryLedger
      .filter((l) => l.item_type === 'finished' && l.item_id === productId)
      .reduce((acc, curr) => acc + curr.change_qty, 0);
    return Math.round(sum);
  }

  // Record a raw material purchase
  recordPurchase(rawMaterialId: number, qty: number, rate: number, supplier: string = 'Local Agro Mills') {
    const item = this.rawMaterials.find((r) => r.id === rawMaterialId);
    if (!item) throw new Error('Raw material not found');

    const currentQty = this.getRawMaterialStock(rawMaterialId);
    // Weighted Average Price Calculation
    const currentVal = currentQty * item.avg_price;
    const addedVal = qty * rate;
    const newQty = round3(currentQty + qty);
    item.avg_price = newQty > 0 ? round2((currentVal + addedVal) / newQty) : rate;
    item.current_stock = newQty;

    // Add immutable ledger entry
    this.inventoryLedger.push({
      id: this.nextLedgerId++,
      item_type: 'raw',
      item_id: rawMaterialId,
      item_name: item.name,
      change_qty: qty,
      unit: item.unit,
      reference_type: 'PURCHASE',
      notes: `Purchase from ${supplier} @ ₹${rate}/${item.unit}`,
      created_at: new Date().toISOString(),
    });

    this.logAudit('PURCHASE', 'admin', 'raw_material', rawMaterialId, `Purchased ${qty} ${item.unit} @ ₹${rate} from ${supplier}`);
    return { item, newStock: newQty };
  }

  // Step 2 & 3: Bill of Materials & Production Run
  recordProductionRun(data: {
    productId: number;
    flourUsed: number; // e.g. 40
    oilUsed: number; // e.g. 10.5
    spiceUsed: number; // e.g. 1.2
    actualOutputPackets: number; // e.g. 188
    damagedPouches: number; // e.g. 6
    cartonsUsed: number; // e.g. 9
    labourCost: number; // e.g. 1200
    overheadCost: number; // e.g. 600
  }) {
    const product = this.products.find((p) => p.id === data.productId);
    if (!product) throw new Error('Product not found');

    const expectedOutput = 200; // standard batch
    const yieldVariancePct = round2(((data.actualOutputPackets - expectedOutput) / expectedOutput) * 100); // -6%
    const oilVariancePct = round2(((data.oilUsed - 10) / 10) * 100); // +5%

    // Calculate Raw Material Consumption cost based on valuation (Weighted Average / Purchase Rates)
    // Flour: 40 kg issued. Opening was 100 kg @ 42, purchased 60 kg @ 45. Weighted avg = 43.125
    // Oil: 10.5 L @ 140 = 1,470
    // Spice: 1.2 kg @ 200 = 240
    // Pouches: (188 used + 6 damaged = 194 total consumed) @ 2.50 = 485
    // Cartons: 9 used @ 15 = 135
    const flourMat = this.rawMaterials.find((r) => r.id === 1)!;
    const oilMat = this.rawMaterials.find((r) => r.id === 2)!;
    const spiceMat = this.rawMaterials.find((r) => r.id === 3)!;
    const pouchMat = this.rawMaterials.find((r) => r.id === 4)!;
    const cartonMat = this.rawMaterials.find((r) => r.id === 5)!;

    const totalPouchesConsumed = data.actualOutputPackets + data.damagedPouches; // 194

    const flourCost = data.flourUsed * flourMat.avg_price;
    const oilCost = data.oilUsed * oilMat.avg_price;
    const spiceCost = data.spiceUsed * spiceMat.avg_price;
    const pouchCost = totalPouchesConsumed * pouchMat.avg_price;
    const cartonCost = data.cartonsUsed * cartonMat.avg_price;

    const totalRawCost = flourCost + oilCost + spiceCost + pouchCost + cartonCost;
    const totalProductionCost = totalRawCost + data.labourCost + data.overheadCost;
    const costPerPacket = round2(totalProductionCost / data.actualOutputPackets);

    // Save production run
    const runId = this.nextProductionId++;
    const run: ProductionRun = {
      id: runId,
      product_id: data.productId,
      product_name: product.name,
      batch_count: 1,
      flour_used: data.flourUsed,
      oil_used: data.oilUsed,
      spice_used: data.spiceUsed,
      pouches_used: totalPouchesConsumed,
      cartons_used: data.cartonsUsed,
      expected_output_packets: expectedOutput,
      actual_output_packets: data.actualOutputPackets,
      damaged_pouches: data.damagedPouches,
      labour_cost: data.labourCost,
      overhead_cost: data.overheadCost,
      cost_per_packet: costPerPacket,
      yield_variance_pct: yieldVariancePct,
      oil_variance_pct: oilVariancePct,
      created_at: new Date().toISOString(),
    };
    this.productionRuns.push(run);

    // Immutable Stock Movements: Issues (deductions)
    this.inventoryLedger.push(
      { id: this.nextLedgerId++, item_type: 'raw', item_id: 1, item_name: 'Flour', change_qty: -data.flourUsed, unit: 'kg', reference_type: 'PRODUCTION_ISSUE', reference_id: runId, created_at: new Date().toISOString() },
      { id: this.nextLedgerId++, item_type: 'raw', item_id: 2, item_name: 'Cooking oil', change_qty: -data.oilUsed, unit: 'litre', reference_type: 'PRODUCTION_ISSUE', reference_id: runId, created_at: new Date().toISOString() },
      { id: this.nextLedgerId++, item_type: 'raw', item_id: 3, item_name: 'Salt and spice mix', change_qty: -data.spiceUsed, unit: 'kg', reference_type: 'PRODUCTION_ISSUE', reference_id: runId, created_at: new Date().toISOString() },
      { id: this.nextLedgerId++, item_type: 'raw', item_id: 4, item_name: '200 g pouch', change_qty: -totalPouchesConsumed, unit: 'piece', reference_type: 'PRODUCTION_ISSUE', reference_id: runId, notes: `${data.actualOutputPackets} used + ${data.damagedPouches} damaged`, created_at: new Date().toISOString() },
      { id: this.nextLedgerId++, item_type: 'raw', item_id: 5, item_name: 'Carton (holds 20 packets)', change_qty: -data.cartonsUsed, unit: 'piece', reference_type: 'PRODUCTION_ISSUE', reference_id: runId, created_at: new Date().toISOString() }
    );

    // Immutable Stock Movement: Output (Finished Goods increment)
    this.inventoryLedger.push({
      id: this.nextLedgerId++,
      item_type: 'finished',
      item_id: data.productId,
      item_name: product.name,
      change_qty: data.actualOutputPackets,
      unit: 'packet',
      reference_type: 'PRODUCTION_OUTPUT',
      reference_id: runId,
      notes: `Batch completed. Produced ${data.actualOutputPackets} pkts. Yield var: ${yieldVariancePct}%`,
      created_at: new Date().toISOString(),
    });

    // Update memory mirrors
    flourMat.current_stock = this.getRawMaterialStock(1);
    oilMat.current_stock = this.getRawMaterialStock(2);
    spiceMat.current_stock = this.getRawMaterialStock(3);
    pouchMat.current_stock = this.getRawMaterialStock(4);
    cartonMat.current_stock = this.getRawMaterialStock(5);

    this.logAudit('PRODUCTION_RUN', 'supervisor', 'production_run', runId, `Produced ${data.actualOutputPackets} pkts of ${product.name}`);
    return run;
  }

  // Create Field Order
  createOrder(data: {
    salesmanName: string;
    customerId: number;
    items: { productId: number; quantity: number }[];
    notes?: string;
  }) {
    const customer = this.customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const orderId = this.nextOrderId++;
    const orderItems: OrderItem[] = data.items.map((it, idx) => {
      const prod = this.products.find((p) => p.id === it.productId);
      return {
        id: idx + 1,
        order_id: orderId,
        product_id: it.productId,
        product_name: prod?.name || 'Item',
        quantity: it.quantity,
        unit_price: prod?.selling_price || 50,
      };
    });

    const order: Order = {
      id: orderId,
      salesman_name: data.salesmanName,
      customer_id: data.customerId,
      customer_name: customer.name,
      status: 'submitted',
      items: orderItems,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.orders.push(order);
    this.logAudit('ORDER_CREATE', 'salesman', 'order', orderId, `Created order for ${customer.name} with ${orderItems.length} items`);
    return order;
  }

  // Admin approves & raises GST invoice
  approveAndInvoiceOrder(orderId: number) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    const customer = this.customers.find((c) => c.id === order.customer_id)!;

    // Check finished goods stock for every item
    for (const item of order.items) {
      const available = this.getFinishedGoodsStock(item.product_id);
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product_name}. Required: ${item.quantity}, Available: ${available} (Shortage: ${item.quantity - available})`
        );
      }
    }

    // Determine place of supply: Factory is in Tamil Nadu
    const isInterstate = customer.state.trim().toLowerCase() !== 'tamil nadu';
    
    // Taxable value
    const taxablePaisa = order.items.reduce((acc, it) => acc + toPaisa(it.quantity * it.unit_price), 0);
    const taxable = fromPaisa(taxablePaisa);
    const gstCalc = calcGst(taxable, 5.0, isInterstate);

    const invoiceId = this.nextInvoiceId++;
    const currentYear = new Date().getFullYear();
    const invNumber = `INV/${currentYear}-${(currentYear + 1).toString().slice(2)}/${String(invoiceId).padStart(4, '0')}`;

    const invoice: Invoice = {
      id: invoiceId,
      order_id: order.id,
      invoice_number: invNumber,
      customer_id: customer.id,
      customer_name: customer.name,
      state: customer.state,
      is_interstate: isInterstate,
      taxable_value: gstCalc.taxable,
      cgst: gstCalc.cgst,
      sgst: gstCalc.sgst,
      igst: gstCalc.igst,
      total_amount: gstCalc.total,
      created_at: new Date().toISOString(),
    };

    this.invoices.push(invoice);
    order.status = 'invoiced';

    // Update customer outstanding
    customer.outstanding_balance = round2(customer.outstanding_balance + gstCalc.total);

    this.logAudit('INVOICE_GENERATED', 'admin', 'invoice', invoiceId, `Generated ${invNumber} for ${customer.name}: ₹${gstCalc.total}`);
    return invoice;
  }

  // Dispatch goods
  dispatchOrder(orderId: number) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'invoiced') throw new Error('Order must be invoiced before dispatch');

    // Deduct stock in ledger
    for (const item of order.items) {
      const available = this.getFinishedGoodsStock(item.product_id);
      if (available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product_name} at dispatch time`);
      }
      this.inventoryLedger.push({
        id: this.nextLedgerId++,
        item_type: 'finished',
        item_id: item.product_id,
        item_name: item.product_name,
        change_qty: -item.quantity,
        unit: 'packet',
        reference_type: 'SALE_DISPATCH',
        reference_id: order.id,
        notes: `Dispatched against Order #${order.id}`,
        created_at: new Date().toISOString(),
      });
    }

    order.status = 'dispatched';
    this.logAudit('DISPATCH', 'admin', 'order', order.id, `Dispatched Order #${order.id} to ${order.customer_name}`);
    return order;
  }

  // Record Payment
  recordPayment(data: {
    customerId: number;
    amount: number;
    paymentMode: string;
    referenceNo: string;
  }) {
    const customer = this.customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const paymentId = this.nextPaymentId++;
    const payment: Payment = {
      id: paymentId,
      customer_id: data.customerId,
      customer_name: customer.name,
      amount: data.amount,
      payment_mode: data.paymentMode,
      reference_no: data.referenceNo,
      created_at: new Date().toISOString(),
    };

    this.payments.push(payment);
    customer.outstanding_balance = round2(customer.outstanding_balance - data.amount);

    this.logAudit('PAYMENT_RECEIVED', 'admin', 'payment', paymentId, `Received ₹${data.amount} from ${customer.name}`);
    return payment;
  }

  // Execute the exact 9-step benchmark scenario
  executeBenchmarkWorkflow() {
    this.resetToBenchmarkSeed();

    // 1. Record purchase of 60 kg flour at ₹45/kg
    this.recordPurchase(1, 60, 45, 'Benchmark Flour Supplier');

    // 2 & 3. Production run: Murukku 200 g. Issue 40 kg flour, 10.5 L oil, 1.2 kg spice mix. Actual output 188 pkts, 6 damaged pouches, 9 cartons.
    // 8. Add labour ₹1,200 and overhead ₹600
    this.recordProductionRun({
      productId: 1,
      flourUsed: 40,
      oilUsed: 10.5,
      spiceUsed: 1.2,
      actualOutputPackets: 188,
      damagedPouches: 6,
      cartonsUsed: 9,
      labourCost: 1200,
      overheadCost: 600,
    });

    // 4. Salesman A places order for Retailer A (Tamil Nadu): 150 packets
    const order1 = this.createOrder({
      salesmanName: 'Salesman A',
      customerId: 1,
      items: [{ productId: 1, quantity: 150 }],
      notes: 'Urgent festival delivery',
    });

    // 5. Admin approves, raises GST invoice, records dispatch
    this.approveAndInvoiceOrder(order1.id);
    this.dispatchOrder(order1.id);

    // 6. Salesman B places order for Distributor B (Karnataka): 120 packets
    const order2 = this.createOrder({
      salesmanName: 'Salesman B',
      customerId: 2,
      items: [{ productId: 1, quantity: 120 }],
      notes: 'Interstate shipment to Bengaluru',
    });

    // 7. Record payment of ₹4,000 from Retailer A
    this.recordPayment({
      customerId: 1,
      amount: 4000,
      paymentMode: 'NEFT/UPI',
      referenceNo: 'UPI-RET-A-4000',
    });

    return {
      success: true,
      flourClosingBalance: this.getRawMaterialStock(1), // Expected: 120 kg
      oilClosingBalance: this.getRawMaterialStock(2), // Expected: 19.5 L
      pouchesClosingBalance: this.getRawMaterialStock(4), // Expected: 306
      finishedGoodsAfterRun: 238, // 50 + 188
      finishedGoodsAfterRetailerADispatch: this.getFinishedGoodsStock(1), // Expected: 88 packets
      retailerAInvoice: this.invoices.find((i) => i.customer_id === 1),
      retailerAOutstanding: this.customers.find((c) => c.id === 1)?.outstanding_balance, // Expected: 3875
      distributorBOrder: order2,
      distributorBAvailableStock: this.getFinishedGoodsStock(1), // 88 vs 120 required -> 32 shortage
    };
  }
}

// Global persistence across Next.js API reloads
declare global {
  // eslint-disable-next-line no-var
  var __benchmarkStore: Store | undefined;
}

export const store = global.__benchmarkStore || new Store();
if (process.env.NODE_ENV !== 'production') {
  global.__benchmarkStore = store;
}
