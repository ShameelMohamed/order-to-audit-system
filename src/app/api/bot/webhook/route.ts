import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

// SnackBot NLP Engine:
// Parses natural language text or voice notes from salesmen into structured orders
// Supports local South Indian dealer slang and shorthand, e.g.:
// "Send 150 pkts murukku for Retailer A in TN"
// "Murukku 120 packets to Distributor B"
// "Book 50 packets for Retailer A"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, salesmanName = 'SnackBot Mobile Field Agent', offline_queued = false } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text prompt or transcription is required' },
        { status: 400 }
      );
    }

    const lower = text.toLowerCase();

    // 1. Resolve Customer
    let customer = store.customers.find((c) =>
      lower.includes(c.name.toLowerCase()) ||
      (c.name.toLowerCase().includes('retailer a') && (lower.includes('retailer a') || lower.includes('retailer-a') || lower.includes('retailera'))) ||
      (c.name.toLowerCase().includes('distributor b') && (lower.includes('distributor b') || lower.includes('distributorb')))
    );

    if (!customer) {
      // Fallback heuristics: check if "retailer" or "distributor" mentioned
      if (lower.includes('retailer')) customer = store.customers[0];
      else if (lower.includes('distributor')) customer = store.customers[1];
      else customer = store.customers[0]; // default to first customer
    }

    // 2. Resolve Product
    let product = store.products.find((p) =>
      lower.includes(p.name.toLowerCase()) || lower.includes('murukku')
    );
    if (!product) {
      product = store.products[0]; // Default to Murukku 200g
    }

    // 3. Extract Quantity
    const qtyMatch = text.match(/\b(\d+)\s*(pkts?|packets?|pcs?|pieces?|box|boxes)?\b/i) || text.match(/\b(\d+)\b/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 100;

    // Check available stock
    const available = store.getFinishedGoodsStock(product.id);
    const isShortage = available < quantity;

    // Create Order in Store
    const order = store.createOrder({
      salesmanName,
      customerId: customer.id,
      items: [{ productId: product.id, quantity }],
      notes: `Captured via SnackBot Bot [${offline_queued ? 'Synced from Offline Cache' : 'Real-time'}]: "${text}"`,
    });

    const replyMessage = `✅ Order #${order.id} submitted for ${customer.name}!\n📦 Item: ${product.name} x ${quantity} pkts\n💰 Est. Value: ₹${quantity * product.selling_price}\n📍 State: ${customer.state}\n📊 Current Stock Available: ${available} pkts ${isShortage ? `⚠️ (Shortage of ${quantity - available} pkts)` : '✓ In Stock'}`;

    return NextResponse.json({
      success: true,
      botReply: replyMessage,
      parsed: {
        customer: customer.name,
        product: product.name,
        quantity,
        isShortage,
        shortageQty: isShortage ? quantity - available : 0,
      },
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
