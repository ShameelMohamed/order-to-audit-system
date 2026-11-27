import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { persistProductionRunToNeon } from '@/lib/neon-sync';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      boms: store.boms,
      productionRuns: store.productionRuns,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId = 1,
      flourUsed = 40,
      oilUsed = 10.5,
      spiceUsed = 1.2,
      actualOutputPackets = 188,
      damagedPouches = 6,
      cartonsUsed = 9,
      labourCost = 1200,
      overheadCost = 600,
    } = body;

    const run = store.recordProductionRun({
      productId: Number(productId),
      flourUsed: Number(flourUsed),
      oilUsed: Number(oilUsed),
      spiceUsed: Number(spiceUsed),
      actualOutputPackets: Number(actualOutputPackets),
      damagedPouches: Number(damagedPouches),
      cartonsUsed: Number(cartonsUsed),
      labourCost: Number(labourCost),
      overheadCost: Number(overheadCost),
    });

    // Persist to Neon
    persistProductionRunToNeon(run).catch(() => {});

    return NextResponse.json({
      success: true,
      productionRun: run,
      finishedGoodsStock: store.getFinishedGoodsStock(productId),
      rawBalances: {
        flour: store.getRawMaterialStock(1),
        oil: store.getRawMaterialStock(2),
        spice: store.getRawMaterialStock(3),
        pouches: store.getRawMaterialStock(4),
        cartons: store.getRawMaterialStock(5),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
