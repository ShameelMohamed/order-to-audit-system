import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // If requesting raw Tally XML file
    if (format === 'tally') {
      const xml = store.generateTallyXml();
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="tally_order_to_audit.xml"',
        },
      });
    }

    // 1. Sales Register & Customer Outstanding Ageing
    const salesRegister = store.invoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      state: inv.state,
      hsn_code: inv.hsn_code,
      taxable_value: inv.taxable_value,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      total_amount: inv.total_amount,
      status: inv.status,
      credit_note_number: inv.credit_note_number,
      date: inv.created_at,
    }));

    // 2. GST Summary (GSTR-1 / GSTR-3B Format)
    const activeInvoices = store.invoices.filter((i) => i.status === 'active');
    const gstSummary = {
      totalTaxable: activeInvoices.reduce((acc, i) => acc + i.taxable_value, 0),
      totalCGST: activeInvoices.reduce((acc, i) => acc + i.cgst, 0),
      totalSGST: activeInvoices.reduce((acc, i) => acc + i.sgst, 0),
      totalIGST: activeInvoices.reduce((acc, i) => acc + i.igst, 0),
      totalTax: activeInvoices.reduce((acc, i) => acc + (i.cgst + i.sgst + i.igst), 0),
      invoiceCount: activeInvoices.length,
      cancelledCount: store.invoices.filter((i) => i.status === 'cancelled').length,
    };

    // 3. Stock Summary & Ledger with Reorder Alerts
    const rawMaterialsWithStock = store.rawMaterials.map((r) => {
      const currentStock = store.getRawMaterialStock(r.id);
      return {
        id: r.id,
        name: r.name,
        unit: r.unit,
        current_stock: currentStock,
        reorder_level: r.reorder_level,
        is_low_stock: currentStock <= r.reorder_level,
        avg_price: r.avg_price,
        valuation: currentStock * r.avg_price,
      };
    });

    const stockSummary = {
      rawMaterials: rawMaterialsWithStock,
      finishedGoods: store.products.map((p) => ({
        id: p.id,
        name: p.name,
        pack_size: p.pack_size,
        current_stock: store.getFinishedGoodsStock(p.id),
        selling_price: p.selling_price,
        stock_value: store.getFinishedGoodsStock(p.id) * p.selling_price,
      })),
      lowStockAlerts: rawMaterialsWithStock.filter((r) => r.is_low_stock),
    };

    // 4. Production Variance Report
    const productionReport = store.productionRuns.map((pr) => ({
      id: pr.id,
      product: pr.product_name,
      batch_number: pr.batch_number,
      expiry_date: pr.expiry_date,
      expected: pr.expected_output_packets,
      actual: pr.actual_output_packets,
      yield_variance_pct: pr.yield_variance_pct,
      oil_variance_pct: pr.oil_variance_pct,
      damaged_pouches: pr.damaged_pouches,
      cost_per_packet: pr.cost_per_packet,
      date: pr.created_at,
    }));

    // 5. Customer Outstanding & Ageing
    const outstandingReport = store.customers.map((c) => ({
      customer_id: c.id,
      name: c.name,
      state: c.state,
      gstin: c.gstin,
      outstanding_balance: c.outstanding_balance,
      status: c.outstanding_balance > 0 ? 'DUE' : 'CLEAR',
      ageing_0_30: c.outstanding_balance > 0 ? c.outstanding_balance : 0,
      ageing_31_60: 0,
      ageing_60_plus: 0,
    }));

    // 6. Production Planning: Pending demand vs Finished Stock
    const pendingOrders = store.orders.filter((o) => o.status === 'submitted' || o.status === 'approved');
    const totalPendingPackets = pendingOrders.reduce(
      (acc, ord) => acc + ord.items.reduce((sum, it) => sum + it.quantity, 0),
      0
    );
    const availablePackets = store.getFinishedGoodsStock(1);
    const deficitPackets = Math.max(0, totalPendingPackets - availablePackets);
    const batchesNeeded = deficitPackets > 0 ? Math.ceil(deficitPackets / 200) : 0;

    const productionPlanning = {
      totalPendingOrders: pendingOrders.length,
      totalPendingPackets,
      availablePackets,
      deficitPackets,
      batchesNeeded,
      flourNeededKg: batchesNeeded * 40,
      oilNeededLitres: batchesNeeded * 10,
    };

    return NextResponse.json({
      success: true,
      salesRegister,
      gstSummary,
      stockSummary,
      productionReport,
      outstandingReport,
      productionPlanning,
      creditNotes: store.creditNotes,
      auditLogs: store.auditLogs,
      rawLedger: store.inventoryLedger,
      tallyXmlAvailable: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
