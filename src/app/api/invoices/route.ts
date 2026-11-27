import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { persistInvoiceToNeon, persistDispatchToNeon } from '@/lib/neon-sync';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      invoices: store.invoices,
      creditNotes: store.creditNotes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, orderId, invoiceId, reason } = body;

    if (action === 'invoice') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
      }
      const invoice = store.approveAndInvoiceOrder(Number(orderId));
      persistInvoiceToNeon(invoice).catch(() => {});
      return NextResponse.json({
        success: true,
        invoice,
        order: store.orders.find((o) => o.id === Number(orderId)),
      });
    } else if (action === 'dispatch') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
      }
      const order = store.dispatchOrder(Number(orderId));
      persistDispatchToNeon(Number(orderId), order.items).catch(() => {});
      return NextResponse.json({
        success: true,
        order,
        closingFinishedGoods: store.getFinishedGoodsStock(1),
      });
    } else if (action === 'cancel') {
      if (!invoiceId) {
        return NextResponse.json({ success: false, error: 'invoiceId is required' }, { status: 400 });
      }
      const creditNote = store.cancelInvoiceWithCreditNote(
        Number(invoiceId),
        reason || 'Customer cancellation / return'
      );
      return NextResponse.json({
        success: true,
        creditNote,
        invoices: store.invoices,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be invoice, dispatch, or cancel' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
