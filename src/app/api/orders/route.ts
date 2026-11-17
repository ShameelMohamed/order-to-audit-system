import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const orders = store.orders.map((o) => ({
      ...o,
      items: o.items.map((it) => ({
        ...it,
        availableStock: store.getFinishedGoodsStock(it.product_id),
      })),
    }));

    return NextResponse.json({
      success: true,
      orders,
      customers: store.customers,
      products: store.products.map((p) => ({
        ...p,
        current_stock: store.getFinishedGoodsStock(p.id),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { salesmanName, customerId, items, notes } = body;

    if (!salesmanName || !customerId || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'salesmanName, customerId, and items are required' },
        { status: 400 }
      );
    }

    const order = store.createOrder({
      salesmanName,
      customerId: Number(customerId),
      items,
      notes,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
