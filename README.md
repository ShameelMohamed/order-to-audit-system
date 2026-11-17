# Order-to-Audit System for a Small Food Manufacturer
**Centre for Digital Infrastructure, NIT Tiruchirappalli — Internship Problem Statement Submission**

A production-ready, full-stack Order-to-Audit System built to run the entire lifecycle of a packaged South Indian snack factory (Murukku, Mixture, Chips, Sweets). The system eliminates manual re-entry errors, notebooks, and month-end spreadsheet panic by connecting the **Sales Loop** and **Production Loop** into an immutable inventory ledger.

---

## 1. Quick Verification: Section 5 Benchmark Results

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
| **Distributor B Order Check** | Shortage of 32 packets flagged; IGST 5% | **Shortage of 32 pkts flagged; IGST applied** | ✅ 100% Match |
| **Cost per Packet** | Valuation & overhead method justified | **₹31.14 / packet** | ✅ Documented in Design Note |

---

## 2. Technology Stack & Justification

1. **Framework & Language: Next.js (App Router, React 19) + TypeScript**
   - *Why:* Strict typing prevents monetary calculation errors; unified frontend and serverless API endpoints allow seamless deployment to **Vercel** with zero configuration.
2. **Database & Storage: PostgreSQL + ACID-Compliant In-Memory Fallback Store**
   - *Why:* Includes full relational SQL schema (`schema.sql`) for PostgreSQL / Neon / Supabase, paired with an ACID-compliant memory-store fallback that runs out-of-the-box in local development and serverless previews without needing external database provisioning.
3. **Paisa Precision Math:**
   - *Why:* IEEE 754 floating-point operations drift (e.g. `0.1 + 0.2 !== 0.3`). All taxes and amounts use fixed integer-paisa algorithms (`toPaisa` / `fromPaisa` with `Number.EPSILON` rounding).
4. **SnackBot (Killer MVP Addition):**
   - *Why:* Field salesmen on weak 2G/3G networks cannot navigate complex web forms. SnackBot parses natural language text or voice notes (e.g. *"Send 150 packets Murukku to Retailer A in TN"*) and instantly submits structured draft orders with stock verification.

---

## 3. Features Implemented Against Scope Tiers

### Must-Have (100% Implemented)
- ✅ Role-based view filtering: Salesman, Factory Admin, Production Floor Supervisor, Auditor, and Factory Owner.
- ✅ Master records: Customers (TN and Karnataka), Products, Raw Materials, and Bill of Materials (BOM).
- ✅ Mobile-friendly field order entry with instant factory submission.
- ✅ Admin verification with live finished-goods stock coverage check.
- ✅ GST tax invoices with Place of Supply logic (CGST + SGST for intra-state TN; IGST for inter-state Karnataka).
- ✅ Recipe-based production run engine: automatic deduction of raw materials and increment of finished goods stock.
- ✅ Planned vs. actual consumption and yield variance tracking with $\pm 3\%$ tolerance flagging.
- ✅ Append-only immutable inventory ledger: stock is dynamically computed via movements, never directly overwritten.
- ✅ Exportable reports (Sales Register, Stock Ledger, GSTR-1 outward summaries) with CSV download and printable PDF layouts.

### Should-Have (100% Implemented)
- ✅ Raw material purchases and supplier tracking with Weighted Average Cost (WAC) recalculation.
- ✅ Customer payment recording, outstanding balances, and receivables tracking.
- ✅ Cost per packet computation including direct labour (₹1,200) and power/overheads (₹600).
- ✅ GSTR-1 and GSTR-3B compatible outward tax summaries.
- ✅ Owner summary dashboard with real-time KPIs and variance warnings.

### Stretch Goals (Implemented)
- 🚀 **SnackBot Voice/Text Natural Language Ordering Engine**: Salesmen can order using natural speech or chat shorthand.
- 🚀 **Offline Order Sync Architecture**: Orders placed offline are queued and submitted automatically.
- 🚀 **One-Click Benchmark Scenario Runner**: Instantly replays the Section 5 benchmark data and displays live verification.

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/ShameelMohamed/order-to-audit-system.git
cd order-to-audit-system

# Install dependencies
npm install

# Run automated Section 5 benchmark tests
npm test

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser. You can click **"Run Exact Section 5 Benchmark"** in the top navigation bar to execute the entire 9-step benchmark scenario in one click.

---

## 5. Deployment to Vercel (Step-by-Step Guide)

Deploying this repository to Vercel is straightforward because the project is built as a native Next.js application:

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import the `order-to-audit-system` repository.
4. **Build & Development Settings:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (leave default)
   - Output Directory: `.next` (leave default)
5. **Environment Variables (Optional):**
   - `DATABASE_URL`: *(Optional)* If connecting to a managed PostgreSQL database (e.g. Neon, Supabase, Vercel Postgres, or AWS RDS). If left empty, the application will automatically run using its built-in in-memory ACID store preloaded with the benchmark master data.
   - `TELEGRAM_BOT_TOKEN`: *(Optional)* For external live Telegram webhook integration with SnackBot.
6. Click **Deploy**. Your app will be live with a free HTTPS `.vercel.app` URL.

---

## 6. Test Logins & Roles

The system features dedicated views for each role accessible directly from the top navigation bar:
- **Owner Dashboard**: High-level stock balances, variance alerts, cost per packet, and quick benchmark trigger.
- **Salesman View**: Clean mobile interface with product selection, available stock indicators, and the **SnackBot** natural language chat interface.
- **Factory Admin**: Order verification desk, stock shortage warnings, GST invoice generator, dispatch recorder, and payment collection ledger.
- **Production Floor**: Daily batch logger, standard vs. actual consumption inputs, pouch damage recording, and automatic stock updates.
- **Auditor Desk**: Sales register, GSTR-1 summary, stock ledgers, and one-click CSV/PDF export.
- **Section 5 Benchmark Audit**: Side-by-side numerical verification matrix validating all 11 evaluation checks.
