import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { persistPaymentToNeon } from '@/lib/neon-sync';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      payments: store.payments,
      customers: store.customers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, amount, paymentMode = 'NEFT/UPI', referenceNo = 'REC-PAY' } = body;

    if (!customerId || !amount) {
      return NextResponse.json(
        { success: false, error: 'customerId and amount are required' },
        { status: 400 }
      );
    }

    const payment = store.recordPayment({
      customerId: Number(customerId),
      amount: Number(amount),
      paymentMode,
      referenceNo,
    });

    persistPaymentToNeon(payment).catch(() => {});

    const customer = store.customers.find((c) => c.id === Number(customerId));

    return NextResponse.json({
      success: true,
      payment,
      outstanding_balance: customer?.outstanding_balance,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
