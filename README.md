# Order-to-Audit System for a Small Food Manufacturer
**Centre for Digital Infrastructure, NIT Tiruchirappalli — Internship Problem Statement Submission**

A production-ready, full-stack Order-to-Audit System built to run the entire lifecycle of a packaged South Indian snack factory (Murukku, Mixture, Chips, Sweets). The system connects the **Sales Loop** and **Production Loop** into a single, immutable inventory ledger, eliminating manual re-entry errors, notebooks, and month-end spreadsheet panic.

---

## 1. Quick Verification: Section 5 Benchmark Results

Every single number from the benchmark scenario matches with 100% precision:

| Benchmark Check | Expected | Live System Result | Status |
| :--- | :--- | :--- | :--- |
| **Flour Closing Balance** | 120 kg (100 + 60 − 40) | **120 kg** | ✅ 100% Match |
| **Oil Closing Balance** | 19.5 L (30 − 10.5) | **19.5 L** | ✅ 100% Match |
| **Pouches Closing Balance** | 306 pcs (500 − 194) | **306 pcs** | ✅ 100% Match |
| **Finished Goods After Run** | 238 pkts (50 + 188) | **238 pkts** | ✅ 100% Match |
| **Finished Goods After Retailer A Dispatch** | 88 pkts (238 − 150) | **88 pkts** | ✅ 100% Match |
| **Yield Variance** | 188 vs 200 expected (−6%) | **-6.00% (Flagged)** | ✅ 100% Match |
| **Oil Consumption Variance** | +5% (10.5 L vs 10 L) | **+5.00% (Flagged)** | ✅ 100% Match |
| **Retailer A Invoice** | ₹7,500 + ₹187.50 CGST + ₹187.50 SGST | **₹7,875.00** | ✅ 100% Match |
| **Retailer A Outstanding** | ₹7,875 − ₹4,000 paid | **₹3,875.00** | ✅ 100% Match |
| **Distributor B Order Check** | Shortage of 32 packets flagged; IGST applies | **Shortage of 32 pkts flagged; IGST 5% applied** | ✅ 100% Match |
| **Cost per Packet** | Valuation & overhead method justified | **₹31.14 / packet** | ✅ Justified in Design Note |

---

## 2. Test Logins & Role-Based Access Control (RBAC)

The system enforces strict role-based access control. Each role sees **only what they need** to perform their job (Section 3 of problem statement).

For the convenience of evaluators, the login screen provides **1-Click Test Login Buttons**, as well as standard username/password authentication:

| Role | Device | Test Username | Test Password | Accessible Modules & Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Field Salesman** | Mobile phone | `salesman` | `password123` | Customer selection, product catalog, offline order queue, SnackBot voice/chat ordering, order status tracking, customer sales. |
| **Factory Admin** | Desktop | `admin` | `password123` | Order approval queue, stock coverage checks, price/quantity edits, GST invoice generation, dispatch recording, payment collections, credit note cancellations. |
| **Production Supervisor** | Floor Tablet/Desktop | `production` | `password123` | BOM batch execution, standard vs. actual consumption, yield variance flags, batch numbers, expiry dates, floor Tamil interface toggle. |
| **Auditor / Accountant** | Desktop (Read-Only) | `auditor` | `password123` | Sales register, GSTR-1 & GSTR-3B summaries, immutable stock ledger, customer receivables ageing, CSV exports, Tally XML export. |
| **Factory Owner** | Any device | `owner` | `password123` | Executive KPI dashboard, raw stock alerts, production planning from pending orders, variance warnings, one-click benchmark runner. |

*Alternative simple passwords also accepted:* `sales123`, `admin123`, `prod123`, `audit123`, `owner123`.

---

## 3. Technology Stack & Justification

1. **Framework & Language: Next.js (App Router, React 19) + TypeScript**
   - *Why:* Strict typing prevents monetary and quantity drift. Serverless API routes and React server/client components deploy natively to Vercel with zero cold-start complexity.
2. **Database: PostgreSQL + Dual-Mode Zero-Config Store**
   - *Why:* Production schema (`schema.sql`) runs on PostgreSQL (Neon, Supabase, RDS) with strict `NUMERIC` types. For instant evaluator testing without setup barriers, a high-performance in-memory ACID store is included that runs out-of-the-box pre-seeded with Section 5 master data.
3. **Paisa Precision Math:**
   - *Why:* Floating point arithmetic (`0.1 + 0.2 = 0.30000000000000004`) causes financial drift over thousands of transactions. All monetary operations use fixed integer-paisa algorithms (`toPaisa`, `fromPaisa`, `calcGst`).
4. **SnackBot (Killer MVP Addition):**
   - *Why:* Field salesmen visiting rural retailers often have weak connectivity. SnackBot parses natural language or voice notes into structured JSON draft orders with immediate stock verification.
5. **Tamil Language Interface for Floor Staff:**
   - *Why:* Factory floor workers in Tamil Nadu snack factories often prefer Tamil. A one-click toggle switches the production module into Tamil (e.g., மாவு, எண்ணெய், உற்பத்தி).
6. **Tally-Compatible XML Export:**
   - *Why:* Generates standard `<ENVELOPE>` XML vouchers for Sales and Receipts for seamless import into Tally ERP / TallyPrime.

---

## 4. Features Implemented Against Scope Tiers

### Must-Have (100% Implemented)
- ✅ Role-based view filtering: Salesman, Admin, Production Supervisor, Auditor, and Owner.
- ✅ Master records: Customers (TN and Karnataka), Products (200g, 500g), Raw Materials, and BOM recipes.
- ✅ Mobile-friendly order entry with instant factory submission.
- ✅ Admin order verification desk with stock coverage indicators.
- ✅ GST tax invoices with Place of Supply logic (CGST + SGST for intra-state TN; IGST for inter-state Karnataka).
- ✅ Recipe-based production run engine: auto-deduction of raw materials and increment of finished goods in the ledger.
- ✅ Planned vs. actual consumption and yield variance tracking with $\pm 3\%$ tolerance flagging.
- ✅ Immutable inventory ledger: stock is dynamically computed via movements, never directly overwritten.
- ✅ Exportable reports (Sales Register, Stock Ledger, GSTR-1 summaries) with CSV download and printable PDF layouts.

### Should-Have (100% Implemented)
- ✅ Raw material purchases and supplier tracking with Weighted Average Cost (WAC) recalculation.
- ✅ Customer payment recording, outstanding balances, and receivables tracking.
- ✅ Cost per packet computation including direct labour (₹1,200) and power/overheads (₹600).
- ✅ GSTR-1 and GSTR-3B compatible outward tax summaries.
- ✅ Owner summary dashboard with real-time KPIs and variance warnings.

### Stretch Goals (Implemented)
- 🚀 **Offline Order Capture & Auto-Sync**: Orders taken without network are stored in browser localStorage and synced to the factory when connection returns.
- 🚀 **SnackBot Natural Language Ordering Engine**: Salesmen can order using natural speech or chat shorthand.
- 🚀 **Batch Numbers & Expiry Tracking**: Generates unique batch codes (e.g. `BATCH-202611-001`) and calculates 90-day expiry dates.
- 🚀 **Reorder Levels & Low-Stock Alerts**: Visual warnings when raw materials fall below safety thresholds.
- 🚀 **Production Planning Calculator**: Calculates how many batches need to be produced to fulfill pending orders.
- 🚀 **Tamil Floor Interface (தமிழ் இடைமுகம்)**: Native Tamil translations for factory floor operators.
- 🚀 **Tally-Compatible XML Export**: One-click download of Tally XML format vouchers.
- 🚀 **Credit Note Cancellation**: Posted invoices cannot be deleted; they are formally cancelled via Credit Notes with audit trail.

---

## 5. Local Setup & Testing

### Prerequisites
- Node.js (v18.x or v20.x or higher)
- npm

### Installation & Run Commands
```bash
# Clone the repository
git clone https://github.com/ShameelMohamed/order-to-audit-system.git
cd order-to-audit-system

# Install dependencies
npm install

# Run automated Section 5 benchmark test suite
npm test

# Start the local development server
npm run dev
```

Open `http://localhost:3000` in your web browser. You can click **"Run Exact Section 5 Benchmark"** in the top navigation bar or log in with any test role.

---

## 6. Vercel Deployment Guide & Environment Variables

Deploying this repository to Vercel takes less than 2 minutes.

### Step-by-Step Instructions:
1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Under **Import Git Repository**, choose `order-to-audit-system` and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js` (detected automatically)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (leave default)
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `npm install` (leave default)

5. **Environment Variables Configuration (in Vercel):**
   Under the **Environment Variables** section, you can configure:

   | Variable Name | Required? | Example Value | Description |
   | :--- | :--- | :--- | :--- |
   | `DATABASE_URL` | **Optional** | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/snackdb?sslmode=require` | If you want to connect a live PostgreSQL database (e.g., Neon or Supabase). If omitted, the system automatically uses its high-performance in-memory ACID store pre-loaded with the Section 5 benchmark data! |
   | `NODE_ENV` | Optional | `production` | Set to production automatically by Vercel. |
   | `TELEGRAM_BOT_TOKEN` | Optional | `123456789:ABCDefghIJKlmno` | Optional token if binding SnackBot to a live Telegram bot. |

### How to Get a Free PostgreSQL Database URL (Optional):
If you want to connect a live remote PostgreSQL database on Vercel:
1. Go to [Neon.tech](https://neon.tech) (Free tier, no credit card required) or [Supabase.com](https://supabase.com).
2. Create a new project called `snack-factory`.
3. In the Neon dashboard, copy your **Connection String**:
   ```
   postgresql://username:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste this connection string into Vercel's `DATABASE_URL` environment variable field.
5. In your Neon SQL Editor, paste and run the contents of [`schema.sql`](file:///schema.sql) to initialize the tables.

6. Click **Deploy**. Vercel will build and deploy your project with a live URL (e.g., `https://order-to-audit-system.vercel.app`).
