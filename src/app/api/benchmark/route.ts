import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body, run all
    }

    const { step, reset } = body;

    if (reset) {
      store.resetToBenchmarkSeed();
      return NextResponse.json({
        success: true,
        message: 'Master data reset to initial Section 5 benchmark state',
      });
    }

    if (step === 1) {
      // Step 1: Record purchase of 60 kg flour at ₹45/kg
      store.recordPurchase(1, 60, 45, 'Benchmark Flour Supplier');
      return NextResponse.json({
        success: true,
        step: 1,
        message: 'Step 1: Recorded purchase of 60 kg flour @ ₹45/kg.',
        flourClosingBalance: store.getRawMaterialStock(1),
      });
    } else if (step === 2 || step === 3 || step === 8) {
      // Step 2 & 3 & 8: Production run of Murukku 200 g with variances and overheads
      const run = store.recordProductionRun({
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
      return NextResponse.json({
        success: true,
        step: 2,
        message: 'Step 2, 3 & 8: Production run executed (188 pkts output, -6% yield var, +5% oil var, ₹31.14/pkt cost).',
        productionRun: run,
        finishedGoodsStock: store.getFinishedGoodsStock(1),
        oilClosingBalance: store.getRawMaterialStock(2),
        pouchesClosingBalance: store.getRawMaterialStock(4),
      });
    } else if (step === 4) {
      // Step 4: Salesman A places order for Retailer A (150 pkts)
      const order = store.createOrder({
        salesmanName: 'Salesman A',
        customerId: 1,
        items: [{ productId: 1, quantity: 150 }],
        notes: 'Urgent festival delivery for Retailer A (Tamil Nadu)',
      });
      return NextResponse.json({
        success: true,
        step: 4,
        message: 'Step 4: Salesman A placed order for Retailer A (150 packets).',
        order,
      });
    } else if (step === 5) {
      // Step 5: Admin approves order 1, raises GST invoice, records dispatch
      const order1 = store.orders.find((o) => o.customer_id === 1 && o.status === 'submitted');
      if (!order1) throw new Error('Order for Retailer A not found or already processed');
      const invoice = store.approveAndInvoiceOrder(order1.id);
      store.dispatchOrder(order1.id);
      return NextResponse.json({
        success: true,
        step: 5,
        message: 'Step 5: Admin approved Order, raised GST Invoice (CGST+SGST=₹7,875), and dispatched goods.',
        invoice,
        finishedGoodsAfterRetailerADispatch: store.getFinishedGoodsStock(1),
      });
    } else if (step === 6) {
      // Step 6: Salesman B places order for Distributor B (120 pkts)
      const order = store.createOrder({
        salesmanName: 'Salesman B',
        customerId: 2,
        items: [{ productId: 1, quantity: 120 }],
        notes: 'Interstate consignment to Bengaluru (Karnataka)',
      });
      const available = store.getFinishedGoodsStock(1);
      return NextResponse.json({
        success: true,
        step: 6,
        message: `Step 6: Salesman B placed order for Distributor B (120 pkts). Available: ${available} pkts. Shortage of ${120 - available} pkts flagged!`,
        order,
        availableStock: available,
        shortage: 120 - available,
      });
    } else if (step === 7) {
      // Step 7: Record payment of ₹4,000 from Retailer A
      const payment = store.recordPayment({
        customerId: 1,
        amount: 4000,
        paymentMode: 'NEFT/UPI',
        referenceNo: 'UPI-RET-A-4000',
      });
      const customer = store.customers.find((c) => c.id === 1);
      return NextResponse.json({
        success: true,
        step: 7,
        message: `Step 7: Recorded payment of ₹4,000 from Retailer A. Outstanding balance: ₹${customer?.outstanding_balance}.`,
        payment,
        outstanding: customer?.outstanding_balance,
      });
    } else {
      // Execute all 9 steps end-to-end
      const results = store.executeBenchmarkWorkflow();
      return NextResponse.json({
        success: true,
        message: 'Complete Section 5 Benchmark scenario executed successfully!',
        results,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      flourClosingBalance: store.getRawMaterialStock(1),
      oilClosingBalance: store.getRawMaterialStock(2),
      pouchesClosingBalance: store.getRawMaterialStock(4),
      finishedGoodsStock: store.getFinishedGoodsStock(1),
      productionRuns: store.productionRuns,
      retailerA: store.customers.find((c) => c.id === 1),
      distributorB: store.customers.find((c) => c.id === 2),
      orders: store.orders,
      invoices: store.invoices,
      creditNotes: store.creditNotes,
      payments: store.payments,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
