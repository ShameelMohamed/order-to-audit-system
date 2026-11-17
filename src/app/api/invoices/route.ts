import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      invoices: store.invoices,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    if (action === 'invoice') {
      const invoice = store.approveAndInvoiceOrder(Number(orderId));
      return NextResponse.json({
        success: true,
        invoice,
        order: store.orders.find((o) => o.id === Number(orderId)),
      });
    } else if (action === 'dispatch') {
      const order = store.dispatchOrder(Number(orderId));
      return NextResponse.json({
        success: true,
        order,
        closingFinishedGoods: store.getFinishedGoodsStock(1),
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Must be invoice or dispatch' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
