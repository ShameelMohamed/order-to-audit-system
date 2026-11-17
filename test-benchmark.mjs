import { describe, it } from 'node:test';
import assert from 'node:assert';
import { store } from './src/lib/store';
import { calcGst } from './src/lib/math';

describe('Order-to-Audit Benchmark Scenario Validation (Section 5)', () => {
  it('Should run the complete benchmark scenario and match exact expected outcomes', () => {
    const results = store.executeBenchmarkWorkflow();

    // 1. Flour closing balance: 100 opening + 60 purchase - 40 issued = 120 kg
    assert.strictEqual(results.flourClosingBalance, 120, 'Flour closing balance must be exactly 120 kg');

    // 2. Oil closing balance: 30 opening - 10.5 issued = 19.5 L
    assert.strictEqual(results.oilClosingBalance, 19.5, 'Oil closing balance must be exactly 19.5 L');

    // 3. Pouches closing balance: 500 opening - (188 good + 6 damaged = 194) = 306 pcs
    assert.strictEqual(results.pouchesClosingBalance, 306, 'Pouches closing balance must be exactly 306');

    // 4. Finished goods after Retailer A dispatch: 50 opening + 188 produced - 150 dispatched = 88 packets
    assert.strictEqual(results.finishedGoodsAfterRetailerADispatch, 88, 'Finished goods closing must be 88 packets');

    // 5. Retailer A invoice: Taxable ₹7,500 + CGST ₹187.50 + SGST ₹187.50 = ₹7,875
    const inv = results.retailerAInvoice;
    assert.ok(inv, 'Retailer A invoice must exist');
    assert.strictEqual(inv.taxable_value, 7500);
    assert.strictEqual(inv.cgst, 187.50);
    assert.strictEqual(inv.sgst, 187.50);
    assert.strictEqual(inv.igst, 0);
    assert.strictEqual(inv.total_amount, 7875);

    // 6. Retailer A outstanding balance after ₹4,000 payment: ₹7,875 - ₹4,000 = ₹3,875
    assert.strictEqual(results.retailerAOutstanding, 3875, 'Retailer A outstanding must be exactly ₹3,875');

    // 7. Distributor B shortage check: Required 120, Available 88 -> Shortage of 32 packets
    const available = store.getFinishedGoodsStock(1);
    const orderQty = results.distributorBOrder.items[0].quantity;
    const shortage = orderQty - available;
    assert.strictEqual(shortage, 32, 'Distributor B shortage must be flagged as 32 packets');

    // 8. Interstate GST calculation test for Karnataka: 120 * 50 = ₹6,000 taxable -> IGST 5% = ₹300
    const karnatakaGst = calcGst(6000, 5, true);
    assert.strictEqual(karnatakaGst.cgst, 0);
    assert.strictEqual(karnatakaGst.sgst, 0);
    assert.strictEqual(karnatakaGst.igst, 300);
    assert.strictEqual(karnatakaGst.total, 6300);

    // 9. Production Run variance checks
    const run = store.productionRuns[0];
    assert.ok(run, 'Production run must be logged');
    assert.strictEqual(run.yield_variance_pct, -6, 'Yield variance must be -6%');
    assert.strictEqual(run.oil_variance_pct, 5, 'Oil consumption variance must be +5%');
  });
});
