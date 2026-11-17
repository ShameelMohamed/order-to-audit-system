import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    // 1. Sales Register & Customer Outstanding Ageing
    const salesRegister = store.invoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      state: inv.state,
      taxable_value: inv.taxable_value,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      total_amount: inv.total_amount,
      date: inv.created_at,
    }));

    // 2. GST Summary (GSTR-1 / GSTR-3B Format)
    const gstSummary = {
      totalTaxable: store.invoices.reduce((acc, i) => acc + i.taxable_value, 0),
      totalCGST: store.invoices.reduce((acc, i) => acc + i.cgst, 0),
      totalSGST: store.invoices.reduce((acc, i) => acc + i.sgst, 0),
      totalIGST: store.invoices.reduce((acc, i) => acc + i.igst, 0),
      totalTax: store.invoices.reduce((acc, i) => acc + (i.cgst + i.sgst + i.igst), 0),
      invoiceCount: store.invoices.length,
    };

    // 3. Stock Summary & Ledger
    const stockSummary = {
      rawMaterials: store.rawMaterials.map((r) => ({
        id: r.id,
        name: r.name,
        unit: r.unit,
        current_stock: store.getRawMaterialStock(r.id),
        avg_price: r.avg_price,
        valuation: store.getRawMaterialStock(r.id) * r.avg_price,
      })),
      finishedGoods: store.products.map((p) => ({
        id: p.id,
        name: p.name,
        current_stock: store.getFinishedGoodsStock(p.id),
        selling_price: p.selling_price,
        stock_value: store.getFinishedGoodsStock(p.id) * p.selling_price,
      })),
    };

    // 4. Production Variance Report
    const productionReport = store.productionRuns.map((pr) => ({
      id: pr.id,
      product: pr.product_name,
      expected: pr.expected_output_packets,
      actual: pr.actual_output_packets,
      yield_variance_pct: pr.yield_variance_pct,
      oil_variance_pct: pr.oil_variance_pct,
      damaged_pouches: pr.damaged_pouches,
      cost_per_packet: pr.cost_per_packet,
      date: pr.created_at,
    }));

    // 5. Customer Outstanding
    const outstandingReport = store.customers.map((c) => ({
      customer_id: c.id,
      name: c.name,
      state: c.state,
      outstanding_balance: c.outstanding_balance,
      status: c.outstanding_balance > 0 ? 'DUE' : 'CLEAR',
    }));

    return NextResponse.json({
      success: true,
      salesRegister,
      gstSummary,
      stockSummary,
      productionReport,
      outstandingReport,
      auditLogs: store.auditLogs,
      rawLedger: store.inventoryLedger,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
