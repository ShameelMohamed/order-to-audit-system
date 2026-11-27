# Order-to-Audit System for a Small Food Manufacturer 
# https://order-to-audit-system.vercel.app/
**Centre for Digital Infrastructure, NIT Tiruchirappalli — Internship Problem Statement Submission**

A production-ready, full-stack Order-to-Audit System built to run the entire operations of a packaged South Indian snack factory (Murukku, Mixture, Chips, Sweets). The system unifies the **Sales Loop** and **Production Loop** into an immutable inventory ledger backed by **Neon PostgreSQL**, eliminating manual re-entry errors, physical notebooks, and month-end spreadsheet panic.

---

## 1. Test Login Credentials & Role-Based Access Control (RBAC)

The system enforces strict role-based access control (RBAC). For evaluator convenience, both **1-Click Quick Login Buttons** and traditional username/password authentication are available:

| Role | Target Device | Username | Password | Accessible Modules & Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Field Salesman** | Mobile phone | `salesman` | `sales123` | Customer selection, product catalog, offline order queue, SnackBot voice/text order entry, order status tracking, customer-wise sales. |
| **Factory Admin** | Desktop | `admin` | `admin123` | Order approval queue, stock coverage checks, price/quantity edits, GST tax invoice generation, dispatch recording, payment collections, credit notes. |
| **Production Supervisor** | Floor Tablet/Desktop | `production` | `prod123` | BOM batch execution, standard vs. actual consumption, yield variance flags, batch numbers, 90-day expiry calculation, Tamil floor interface. |
| **Auditor / Accountant** | Desktop (Read-Only) | `auditor` | `audit123` | Real-time audit logs, Sales register, GSTR-1 & GSTR-3B outward tax summaries, immutable stock ledger, customer receivables ageing, CSV/Tally XML exports. |
| **Factory Owner** | Any device | `owner` | `owner123` | Executive KPI dashboard, raw stock alerts, production planning from pending orders, variance warnings, one-click Section 5 benchmark runner. |

*(Note: Simple fallback password `password123` is also supported for all roles).*

---

## 2. Live Neon PostgreSQL Database Connection Status

The application is natively wired to **Neon Serverless PostgreSQL** with connection pooling.

### Automated Connection Check
You can test and verify database connectivity anytime by visiting the live status endpoint in your browser:
```
GET /api/neon/status
```

**Expected JSON Response:**
```json
{
  "success": true,
  "connected": true,
  "neon": {
    "currentTime": "2026-11-27T10:53:43.860Z",
    "database": "neondb",
    "branch": "production",
    "branchId": "br-solitary-darkness-bd4a0tgp",
    "tablesCount": 11,
    "tables": [
      "audit_logs",
      "bill_of_materials",
      "customers",
      "inventory_ledger",
      "invoices",
      "order_items",
      "orders",
      "payments",
      "production_runs",
      "products",
      "raw_materials"
    ]
  }
}
```

### Local End-to-End Verification Command
```bash
node --env-file=.env.local scripts/test-neon-e2e.mjs
```
*Output: Verifies HTTP serverless driver, pooled connection with `pg.Pool`, and transactional audit log writes with 100% pass rate.*

---

## 3. Vercel Deployment & Environment Variables

When importing this project into Vercel with the Neon integration attached, Vercel automatically injects the following production variables:

| Environment Variable | Required | Injected By | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon Vercel Integration | Pooled connection string for serverless API routes |
| `DATABASE_URL_UNPOOLED` | **Yes** | Neon Vercel Integration | Direct connection string for schema migrations and DDL |
| `NEON_BRANCH` | Optional | Neon Vercel Integration | Neon branch name (e.g., `production`) |
| `NEON_BRANCH_ID` | Optional | Neon Vercel Integration | Neon branch identifier (e.g., `br-solitary-darkness-bd4a0tgp`) |
| `NODE_ENV` | Optional | Vercel | Set to `production` |

> **Zero-Config Resiliency:** If `DATABASE_URL` is temporarily absent or during local offline testing, the system automatically falls back to its in-memory ACID store pre-loaded with Section 5 benchmark data, ensuring zero downtime.

---

## 4. Section 5 Benchmark Results: 100% Exact Match

The system includes a 1-click execution of the exact 9-step scenario from Section 5 of the NIT Tiruchirappalli problem statement:

| Step & Benchmark Metric | Expected Value | System Output | Status |
| :--- | :--- | :--- | :--- |
| **1. Initial Raw Stock** | Flour 100kg, Oil 30L, Pouches 500 | Loaded correctly | ✅ Verified |
| **2. Purchase Order** | +60 kg Flour @ ₹42/kg (WAC ₹40.75/kg) | **120 kg closing balance** | ✅ 100% Match |
| **3. Finished Goods Initial** | 50 packets Murukku 200g | 50 pkts in stock | ✅ Verified |
| **4. Murukku Production Run** | Issued 40kg Flour, 10.5L Oil, 200 Pouches | Recorded to batch | ✅ Verified |
| **5. Actual Yield & Variance** | 188 packets produced (vs 200 standard) | **-6.00% Yield (Flagged)** | ✅ 100% Match |
| **6. Oil Consumption Variance** | 10.5 L consumed (vs 10.0 L standard) | **+5.00% Oil (Flagged)** | ✅ 100% Match |
| **7. Retailer A Order & Invoice** | 150 pkts @ ₹50/pkt + CGST 2.5% + SGST 2.5% | **₹7,875.00 Total** | ✅ 100% Match |
| **8. Retailer A Payment & Balance** | ₹4,000 paid; Outstanding: ₹3,875 | **₹3,875.00 Balance** | ✅ 100% Match |
| **9. Distributor B Stock Check** | Order for 120 pkts (only 88 pkts available) | **Shortage of 32 pkts flagged** | ✅ 100% Match |
| **Closing Oil Balance** | 30 L − 10.5 L = 19.5 L | **19.5 L** | ✅ 100% Match |
| **Closing Pouch Balance** | 500 − 194 (188 good + 6 burst) = 306 | **306 pcs** | ✅ 100% Match |
| **True Cost per Packet** | Materials + Direct Labour ₹1,200 + Power ₹600 | **₹31.14 / packet** | ✅ Justified in Design Note |

---

## 5. UI/UX & Interactive Design Features

Built for the modern web with an award-winning design aesthetic:
- **3D Motion & Perspective Tilt**: Interactive perspective transforms on summary cards, invoice previews, and production runs tracking mouse movements.
- **Dynamic Glow Cursor**: Custom trailing neon cursor with active expansion on hoverable elements.
- **Micro-Interactions & Confetti Bursts**: Audio-visual feedback on benchmark execution, order booking, and invoice generation with particle confetti bursts.
- **Parallax Mesh Orbs**: Fluid background gradients reacting dynamically to cursor position.
- **Instant Clipboard Micro-Interactions**: One-click test credential auto-fill with visual feedback.
- **Tamil Language Interface (தமிழ்)**: Native toggle for shop-floor operators.
- **SnackBot AI / Chat Ordering**: Natural language shorthand parser for fast mobile order entry by salesmen.

---

## 6. Local Setup & Testing

```bash
# Clone the repository
git clone https://github.com/ShameelMohamed/order-to-audit-system.git
cd order-to-audit-system

# Install dependencies
npm install

# Run automated Section 5 benchmark test suite
npm test

# Run the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.
