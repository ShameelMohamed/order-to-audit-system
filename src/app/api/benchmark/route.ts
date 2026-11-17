import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST() {
  try {
    const results = store.executeBenchmarkWorkflow();
    return NextResponse.json({
      success: true,
      message: 'Benchmark scenario executed successfully',
      results,
    });
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
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
