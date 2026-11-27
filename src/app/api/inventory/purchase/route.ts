import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { persistPurchaseToNeon } from '@/lib/neon-sync';

export async function GET() {
  try {
    const rawMaterialsWithStock = store.rawMaterials.map((rm) => ({
      ...rm,
      current_stock: store.getRawMaterialStock(rm.id),
    }));

    const ledger = store.inventoryLedger;

    return NextResponse.json({
      success: true,
      rawMaterials: rawMaterialsWithStock,
      ledger,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawMaterialId, quantity, rate, supplier } = body;

    if (!rawMaterialId || !quantity || !rate) {
      return NextResponse.json(
        { success: false, error: 'rawMaterialId, quantity, and rate are required' },
        { status: 400 }
      );
    }

    const result = store.recordPurchase(
      Number(rawMaterialId),
      Number(quantity),
      Number(rate),
      supplier || 'Local Supplier'
    );

    // Persist asynchronously to Neon PostgreSQL
    persistPurchaseToNeon(
      Number(rawMaterialId),
      Number(quantity),
      Number(rate),
      supplier || 'Local Supplier',
      result.item.avg_price
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      data: result,
      flourClosingBalance: store.getRawMaterialStock(1),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
