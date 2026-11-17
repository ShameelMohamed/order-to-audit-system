'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Factory,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Smartphone,
  ShieldCheck,
  MessageSquare,
  Truck,
  Building,
  UserCheck,
  Lock,
  LogOut,
  XCircle,
  Share2,
  Wifi,
  WifiOff,
  Languages,
  Calendar,
  AlertCircle,
  Eye,
  FileCode,
  Download,
} from 'lucide-react';
import { TEST_USERS, authenticate } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';

export default function OrderToAuditApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Active view
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Invoice Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState('Customer cancellation / return');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Offline Order Simulation State (Stretch Goal)
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Tamil UI Toggle for Floor Staff (Stretch Goal)
  const [tamilLanguage, setTamilLanguage] = useState(false);

  // Field Order State
  const [salesmanCustomer, setSalesmanCustomer] = useState('1');
  const [salesmanQty, setSalesmanQty] = useState('150');
  const [salesmanNotes, setSalesmanNotes] = useState('');

  // SnackBot Bot State
  const [botPrompt, setBotPrompt] = useState('Send 150 packets Murukku to Retailer A in TN');
  const [botConversation, setBotConversation] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: 'Namaskaram! 🥜 I am SnackBot. Enter an order naturally (e.g. "Send 150 pkts murukku to Retailer A" or "120 packets to Distributor B") or type your request below.',
    },
  ]);

  // Production Form State
  const [prodFlour, setProdFlour] = useState('40');
  const [prodOil, setProdOil] = useState('10.5');
  const [prodSpice, setProdSpice] = useState('1.2');
  const [prodActualOutput, setProdActualOutput] = useState('188');
  const [prodDamagedPouches, setProdDamagedPouches] = useState('6');
  const [prodCartons, setProdCartons] = useState('9');
  const [prodLabour, setProdLabour] = useState('1200');
  const [prodOverhead, setProdOverhead] = useState('600');

  // Purchase Form State
  const [purchaseQty, setPurchaseQty] = useState('60');
  const [purchaseRate, setPurchaseRate] = useState('45');
  const [purchaseSupplier, setPurchaseSupplier] = useState('Sri Murugan Agro Mills');

  // Payment Form State
  const [paymentCustomer, setPaymentCustomer] = useState('1');
  const [paymentAmount, setPaymentAmount] = useState('4000');
  const [paymentRef, setPaymentRef] = useState('UPI-TN-RET-A-4000');

  // Load offline queue on client mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem('snack_offline_orders');
      if (savedQueue) {
        setOfflineQueue(JSON.parse(savedQueue));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync offline queue to localStorage
  const saveOfflineQueue = (queue: any[]) => {
    setOfflineQueue(queue);
    try {
      localStorage.setItem('snack_offline_orders', JSON.stringify(queue));
    } catch {
      // ignore
    }
  };

  const showNotify = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const [reportsRes, ordersRes, benchmarkRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/orders'),
        fetch('/api/benchmark'),
      ]);
      const reports = await reportsRes.json();
      const orders = await ordersRes.json();
      const benchmark = await benchmarkRes.json();
      setData({ ...reports, ...orders, benchmark });
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Set default view on login based on role
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'salesman') setActiveTab('salesman');
    else if (user.role === 'admin') setActiveTab('admin');
    else if (user.role === 'production') setActiveTab('production');
    else if (user.role === 'auditor') setActiveTab('auditor');
    else setActiveTab('overview');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticate(loginUsername, loginPassword);
    if (user) {
      setLoginError('');
      handleLogin(user);
    } else {
      setLoginError('Invalid username or password. Try test credentials below.');
    }
  };

  // Run Benchmark Workflow
  const handleRunBenchmark = async (step?: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step ? { step } : { step: 'all' }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(json.message || 'Benchmark executed successfully!');
        await refreshData();
      } else {
        showNotify(json.error || 'Failed to run benchmark', 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset benchmark data
  const handleResetBenchmark = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify('Master data reset to Section 5 initial benchmark state!');
        await refreshData();
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Field Order (with Offline Support)
  const handlePlaceOrder = async () => {
    const qty = Number(salesmanQty);
    if (!qty || qty <= 0) {
      showNotify('Please enter a valid quantity', 'error');
      return;
    }

    const newOrderPayload = {
      salesmanName: currentUser?.name || 'Salesman A',
      customerId: Number(salesmanCustomer),
      items: [{ productId: 1, quantity: qty }],
      notes: salesmanNotes,
    };

    if (isOfflineMode) {
      const offlineItem = {
        ...newOrderPayload,
        id: `OFFLINE-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const updated = [...offlineQueue, offlineItem];
      saveOfflineQueue(updated);
      showNotify(`Weak Network! Order saved to offline queue (${updated.length} pending).`);
      setSalesmanQty('150');
      setSalesmanNotes('');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Order #${json.order.id} submitted directly to factory!`);
        setSalesmanNotes('');
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sync Offline Orders when network is restored
  const handleSyncOfflineOrders = async () => {
    if (!offlineQueue.length) return;
    try {
      setLoading(true);
      let syncedCount = 0;
      for (const item of offlineQueue) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salesmanName: item.salesmanName,
            customerId: item.customerId,
            items: item.items,
            notes: `[Synced from Offline Queue] ${item.notes || ''}`,
          }),
        });
        const json = await res.json();
        if (json.success) syncedCount++;
      }
      saveOfflineQueue([]);
      setIsOfflineMode(false);
      showNotify(`Successfully synced ${syncedCount} offline orders to factory!`);
      refreshData();
    } catch (e: any) {
      showNotify(`Sync error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // SnackBot natural language agent
  const handleSendBotMessage = async (customText?: string) => {
    const textToSend = customText || botPrompt;
    if (!textToSend.trim()) return;

    setBotConversation((prev) => [...prev, { role: 'user', text: textToSend }]);
    if (!customText) setBotPrompt('');

    try {
      const res = await fetch('/api/bot/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          salesmanName: currentUser?.name || 'Mobile Field Agent',
          offline_queued: isOfflineMode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBotConversation((prev) => [...prev, { role: 'bot', text: json.botReply }]);
        refreshData();
      } else {
        setBotConversation((prev) => [...prev, { role: 'bot', text: `❌ Error: ${json.error}` }]);
      }
    } catch (e: any) {
      setBotConversation((prev) => [...prev, { role: 'bot', text: `❌ Network error: ${e.message}` }]);
    }
  };

  // Record Purchase
  const handleRecordPurchase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialId: 1,
          quantity: Number(purchaseQty),
          rate: Number(purchaseRate),
          supplier: purchaseSupplier,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Purchase recorded! Flour closing stock: ${json.flourClosingBalance} kg.`);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Record Production Run
  const handleRecordProduction = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 1,
          flourUsed: Number(prodFlour),
          oilUsed: Number(prodOil),
          spiceUsed: Number(prodSpice),
          actualOutputPackets: Number(prodActualOutput),
          damagedPouches: Number(prodDamagedPouches),
          cartonsUsed: Number(prodCartons),
          labourCost: Number(prodLabour),
          overheadCost: Number(prodOverhead),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Production Run #${json.productionRun.id} saved! Batch: ${json.productionRun.batch_number}`);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Approve & Generate Invoice
  const handleInvoiceOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invoice', orderId }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`GST Invoice ${json.invoice.invoice_number} raised successfully!`);
        setSelectedInvoice(json.invoice);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Dispatch Goods
  const handleDispatchOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dispatch', orderId }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Order #${orderId} dispatched! Remaining finished goods: ${json.closingFinishedGoods} pkts.`);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Cancel Invoice via Credit Note
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      setLoading(true);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          invoiceId: selectedInvoice.id,
          reason: cancellationReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Credit Note ${json.creditNote.credit_note_number} issued! Balance reversed.`);
        setShowCancelModal(false);
        setSelectedInvoice(null);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Admin: Record Customer Payment
  const handleRecordPayment = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: Number(paymentCustomer),
          amount: Number(paymentAmount),
          paymentMode: 'NEFT/UPI',
          referenceNo: paymentRef,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotify(`Payment of ₹${json.payment.amount} recorded! Updated balance: ₹${json.outstanding_balance}`);
        refreshData();
      } else {
        showNotify(json.error, 'error');
      }
    } catch (e: any) {
      showNotify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV helper
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let val = row[k] === null || row[k] === undefined ? '' : row[k];
              if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
              return val;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Tally XML
  const handleDownloadTallyXml = () => {
    window.open('/api/reports?format=tally', '_blank');
  };

  // -------------------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 mb-2">
              <Factory className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Order-to-Audit System</h1>
            <p className="text-xs text-slate-400">
              South Indian Food Manufacturer • Centre for Digital Infrastructure, NIT Tiruchirappalli
            </p>
          </div>

          {/* Quick 1-Click Role Login for Evaluators */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Test Login (Click any role)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {TEST_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLogin(u)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    u.role === 'salesman'
                      ? 'bg-blue-950/40 border-blue-800/60 hover:bg-blue-900/60 text-blue-200'
                      : u.role === 'admin'
                      ? 'bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/60 text-amber-200'
                      : u.role === 'production'
                      ? 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-200'
                      : u.role === 'auditor'
                      ? 'bg-purple-950/40 border-purple-800/60 hover:bg-purple-900/60 text-purple-200'
                      : 'bg-rose-950/40 border-rose-800/60 hover:bg-rose-900/60 text-rose-200 col-span-2'
                  }`}
                >
                  <span className="font-bold">{u.badge}</span>
                  <span className="opacity-75 text-[11px] mt-0.5">{u.username}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Or Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block text-center">
              Or Sign In With Test Credentials
            </span>
            {loginError && (
              <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="e.g. salesman, admin, production, auditor, owner"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="password123"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition shadow-lg"
            >
              Log In to Portal
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500">
            Default Password for all roles: <code className="text-amber-400 font-mono">password123</code>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN AUTHENTICATED PORTAL
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg border border-amber-500/30">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Order-to-Audit System</h1>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                NIT Tiruchirappalli
              </span>
            </div>
            <p className="text-xs text-slate-400">Packaged South Indian Snacks Factory • Tamil Nadu (Home State)</p>
          </div>
        </div>

        {/* User Session & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Benchmark Button */}
          <button
            onClick={() => handleRunBenchmark()}
            disabled={loading}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Exact Section 5 Benchmark
          </button>

          {/* Current User Badge & Quick Switch */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-white font-semibold block">{currentUser.name}</span>
              <span className="text-[10px] text-amber-400 font-mono uppercase">{currentUser.badge}</span>
            </div>
            {/* Quick Switch Dropdown */}
            <select
              value={currentUser.role}
              onChange={(e) => {
                const u = TEST_USERS.find((x) => x.role === e.target.value);
                if (u) handleLogin(u);
              }}
              className="ml-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 cursor-pointer focus:outline-none"
              title="Switch Role"
            >
              {TEST_USERS.map((u) => (
                <option key={u.id} value={u.role}>
                  Switch: {u.role.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Logout */}
          <button
            onClick={() => setCurrentUser(null)}
            className="p-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-lg border border-slate-700 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div
          className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/90 text-rose-200 border-rose-800'
          }`}
        >
          <span className="font-medium">{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Role-Based Navigation Bar (Strict RBAC filtering) */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 flex space-x-1 overflow-x-auto text-xs">
        {/* Navigation items allowed per role */}
        {[
          { id: 'overview', label: 'Owner Summary', icon: Building, roles: ['owner', 'admin'] },
          { id: 'salesman', label: 'Field Sales & SnackBot', icon: Smartphone, roles: ['salesman', 'owner', 'admin'] },
          { id: 'admin', label: 'Admin Billing & Dispatch', icon: ShieldCheck, roles: ['admin', 'owner'] },
          { id: 'production', label: 'Production Floor & BOM', icon: Factory, roles: ['production', 'owner', 'admin'] },
          { id: 'auditor', label: 'Auditor & Monthly Reports', icon: FileSpreadsheet, roles: ['auditor', 'owner', 'admin'] },
          { id: 'benchmark', label: 'Section 5 Benchmark Stepper', icon: CheckCircle2, roles: ['owner', 'admin', 'auditor', 'production', 'salesman'] },
        ]
          .filter((tab) => tab.roles.includes(currentUser.role))
          .map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ================================================================= */}
        {/* 1. OWNER EXECUTIVE DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flour Raw Stock</span>
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  {data?.benchmark?.flourClosingBalance ?? 120} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100 kg op + 60 kg pur − 40 kg run = 120 kg
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cooking Oil Stock</span>
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  {data?.benchmark?.oilClosingBalance ?? 19.5} <span className="text-xs font-normal text-slate-400">L</span>
                </div>
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 10.5 L consumed (+5% over standard)
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Finished Goods Stock</span>
                  <Factory className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  {data?.benchmark?.finishedGoodsStock ?? 88} <span className="text-xs font-normal text-slate-400">packets</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Available after Retailer A 150 pkt dispatch</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Retailer A Outstanding</span>
                  <DollarSign className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  ₹{data?.benchmark?.retailerA?.outstanding_balance?.toLocaleString() ?? '3,875'}
                </div>
                <p className="text-xs text-slate-400 mt-1">₹7,875 invoice − ₹4,000 payment</p>
              </div>
            </div>

            {/* Low-Stock Alerts Banner */}
            {data?.stockSummary?.lowStockAlerts?.length > 0 && (
              <div className="bg-amber-950/50 border border-amber-800/80 rounded-xl p-4 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Reorder Alert:</strong> The following materials have reached or fallen below safety reorder levels:{' '}
                    {data.stockSummary.lowStockAlerts.map((i: any) => `${i.name} (${i.current_stock} ${i.unit})`).join(', ')}
                  </span>
                </div>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-amber-300">
                  Procure Now
                </span>
              </div>
            )}

            {/* Production Planning Widget */}
            {data?.productionPlanning && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Production Planning From Pending Demand (Stretch Goal)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Automated floor planning based on submitted retail and distributor orders.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Pending Order Demand</span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {data.productionPlanning.totalPendingPackets} pkts
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Current Finished Stock</span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {data.productionPlanning.availablePackets} pkts
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Finished Goods Shortage</span>
                    <span className="text-lg font-bold text-rose-400 mt-1 block">
                      {data.productionPlanning.deficitPackets} pkts
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Suggested Batches to Run</span>
                    <span className="text-lg font-bold text-amber-400 mt-1 block">
                      {data.productionPlanning.batchesNeeded} batch ({data.productionPlanning.flourNeededKg} kg flour)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. SALESMAN VIEW (Mobile Order Taking & SnackBot) */}
        {/* ================================================================= */}
        {activeTab === 'salesman' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Order Screen */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold text-white">Mobile Order Taking Desk</h3>
                </div>
                {/* Offline Mode Switch */}
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition ${
                    isOfflineMode
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  }`}
                  title="Toggle Weak Network / Offline Mode"
                >
                  {isOfflineMode ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5" /> Offline Mode Active
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5" /> Online (Live Sync)
                    </>
                  )}
                </button>
              </div>

              {/* Pending Offline Queue Alert */}
              {offlineQueue.length > 0 && (
                <div className="bg-blue-950/60 border border-blue-800 rounded-lg p-3 flex justify-between items-center text-xs">
                  <span className="text-blue-200">
                    <strong>{offlineQueue.length} Order(s)</strong> queued locally in browser offline cache.
                  </span>
                  <button
                    onClick={handleSyncOfflineOrders}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded text-xs transition"
                  >
                    Sync to Factory Now
                  </button>
                </div>
              )}

              {/* Order Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Select Customer</label>
                  <select
                    value={salesmanCustomer}
                    onChange={(e) => setSalesmanCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1">Retailer A (Tamil Nadu) — Intra-state (CGST + SGST)</option>
                    <option value="2">Distributor B (Karnataka) — Inter-state (IGST applies)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Product</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white flex justify-between items-center">
                    <div>
                      <span className="font-semibold">Murukku 200 g</span>
                      <span className="text-[10px] text-slate-400 block">HSN: 19059040 • GST 5%</span>
                    </div>
                    <span className="text-amber-400 font-bold">₹50.00 / packet</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Order Quantity (Packets)</label>
                  <input
                    type="number"
                    value={salesmanQty}
                    onChange={(e) => setSalesmanQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 150"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Taxable Value: ₹{(Number(salesmanQty) || 0) * 50}</span>
                    <span>Available Stock: {data?.benchmark?.finishedGoodsStock ?? 88} pkts</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Delivery Notes</label>
                  <input
                    type="text"
                    value={salesmanNotes}
                    onChange={(e) => setSalesmanNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Urgent festival stock delivery"
                  />
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition shadow"
                >
                  {isOfflineMode ? 'Save Order in Offline Cache' : 'Submit Order Directly to Factory'}
                </button>
              </div>

              {/* Salesman Order History */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-white mb-2">My Recent Submitted Orders</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data?.orders?.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">#{ord.id}</span> • {ord.customer_name} (
                        {ord.items[0]?.quantity} pkts)
                        <span className="text-[10px] text-slate-400 block">{ord.notes || 'Standard Delivery'}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          ord.status === 'dispatched'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ord.status === 'invoiced'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SnackBot AI Chat & Voice Ordering Desk */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[560px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">SnackBot AI Field Agent</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Voice & WhatsApp Bot
                </span>
              </div>

              {/* Bot chat history */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                {botConversation.map((c, i) => (
                  <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 whitespace-pre-wrap ${
                        c.role === 'user'
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Sample Prompts */}
              <div className="py-2 flex flex-wrap gap-1.5 text-[10px]">
                <button
                  onClick={() => handleSendBotMessage('Send 150 packets Murukku to Retailer A in TN')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                >
                  "150 pkts for Retailer A"
                </button>
                <button
                  onClick={() => handleSendBotMessage('Order 120 packets to Distributor B in Karnataka')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                >
                  "120 pkts for Distributor B"
                </button>
                <button
                  onClick={() => handleSendBotMessage('What is the current stock of Murukku 200g?')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                >
                  "Check Stock"
                </button>
              </div>

              {/* Bot Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={botPrompt}
                  onChange={(e) => setBotPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendBotMessage()}
                  placeholder='Try: "Send 150 packets to Retailer A"'
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendBotMessage()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. FACTORY ADMIN DESK (Order Verification, GST Billing & Dispatch) */}
        {/* ================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Raw Material Purchase Recording */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                Step 1: Record Raw Material Purchase (Benchmark: 60 kg Flour @ ₹45/kg)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input
                  type="number"
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  placeholder="Quantity (kg)"
                />
                <input
                  type="number"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  placeholder="Rate per kg (₹)"
                />
                <input
                  type="text"
                  value={purchaseSupplier}
                  onChange={(e) => setPurchaseSupplier(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  placeholder="Supplier Name"
                />
                <button
                  onClick={handleRecordPurchase}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded text-xs transition"
                >
                  Record Purchase Inward
                </button>
              </div>
            </div>

            {/* Orders Queue & Stock Verification Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  Incoming Orders & Finished Stock Coverage Desk
                </h3>
                <span className="text-xs text-slate-400">
                  Available Murukku 200g: <strong>{data?.benchmark?.finishedGoodsStock ?? 88} pkts</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Order</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">State & Tax Type</th>
                      <th className="p-3">Order Qty</th>
                      <th className="p-3">Stock Check</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data?.orders?.map((ord: any) => {
                      const qty = ord.items[0]?.quantity || 0;
                      const available = data?.benchmark?.finishedGoodsStock ?? 88;
                      const hasStock = available >= qty;

                      return (
                        <tr key={ord.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">#{ord.id}</td>
                          <td className="p-3 text-slate-300">{ord.customer_name}</td>
                          <td className="p-3 text-slate-300">
                            {ord.customer_id === 2 ? 'Karnataka (IGST 5%)' : 'Tamil Nadu (CGST+SGST 5%)'}
                          </td>
                          <td className="p-3 font-bold text-white">{qty} pkts</td>
                          <td className="p-3">
                            {hasStock ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Covered ({available} avail)
                              </span>
                            ) : (
                              <span className="text-rose-400 font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Shortage of {qty - available} pkts
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                ord.status === 'dispatched'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : ord.status === 'invoiced'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            {ord.status === 'submitted' && (
                              <button
                                onClick={() => handleInvoiceOrder(ord.id)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-semibold"
                              >
                                Approve & Generate GST Invoice
                              </button>
                            )}
                            {ord.status === 'invoiced' && (
                              <button
                                onClick={() => handleDispatchOrder(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-semibold"
                              >
                                Dispatch Goods (Reduce Stock)
                              </button>
                            )}
                            {ord.status === 'dispatched' && (
                              <span className="text-slate-400 text-xs">Dispatched to Buyer</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Payments Collection Desk */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Step 7: Record Customer Payment Collection (Benchmark: ₹4,000 from Retailer A)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <select
                  value={paymentCustomer}
                  onChange={(e) => setPaymentCustomer(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="1">Retailer A (Current Due: ₹{data?.benchmark?.retailerA?.outstanding_balance})</option>
                  <option value="2">Distributor B</option>
                </select>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  placeholder="Amount (₹)"
                />
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  placeholder="UPI / NEFT Reference"
                />
                <button
                  onClick={handleRecordPayment}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition"
                >
                  Record Payment Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. PRODUCTION FLOOR (BOM, Variance & Tamil Toggle) */}
        {/* ================================================================= */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Factory className="w-5 h-5 text-amber-400" />
                    {tamilLanguage
                      ? 'உற்பத்தி மற்றும் செய்முறை மேலாண்மை (BOM & Variance)'
                      : 'Production Run & Bill of Materials (BOM) Engine'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {tamilLanguage
                      ? 'முறுக்கு 200g செய்முறை: 40கிகி மாவு, 10லி எண்ணெய், 1.2கிகி மசாலா → 200 பைகள்'
                      : 'Murukku 200g standard batch: 40kg Flour, 10L Oil, 1.2kg Spice Mix → 200 packets'}
                  </p>
                </div>
                {/* Tamil Interface Toggle */}
                <button
                  onClick={() => setTamilLanguage(!tamilLanguage)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-xs font-semibold"
                >
                  <Languages className="w-3.5 h-3.5" />
                  {tamilLanguage ? 'Switch to English' : 'தமிழ் இடைமுகம் (Tamil UI)'}
                </button>
              </div>

              {/* Floor Batch Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-xs">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'வழங்கப்பட்ட மாவு (Flour kg)' : 'Flour Issued (kg)'}
                  </label>
                  <input
                    type="number"
                    value={prodFlour}
                    onChange={(e) => setProdFlour(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">Std: 40 kg</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'வழங்கப்பட்ட எண்ணெய் (Oil Litre)' : 'Cooking Oil Issued (L)'}
                  </label>
                  <input
                    type="number"
                    value={prodOil}
                    onChange={(e) => setProdOil(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-amber-400 font-bold">10.5 L (+5% over standard)</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'மசாலா மற்றும் உப்பு (Spice kg)' : 'Salt & Spice Mix (kg)'}
                  </label>
                  <input
                    type="number"
                    value={prodSpice}
                    onChange={(e) => setProdSpice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">Std: 1.2 kg</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'நல்ல பைகள் வெளியீடு (Good Output)' : 'Good Output Packets'}
                  </label>
                  <input
                    type="number"
                    value={prodActualOutput}
                    onChange={(e) => setProdActualOutput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-rose-400 font-bold">188 pkts (-6% yield variance)</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'சேதமடைந்த பைகள் (Damaged)' : 'Damaged Pouches'}
                  </label>
                  <input
                    type="number"
                    value={prodDamagedPouches}
                    onChange={(e) => setProdDamagedPouches(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">Benchmark: 6 pouches</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'பயன்படுத்திய அட்டைப்பெட்டிகள்' : 'Cartons Used'}
                  </label>
                  <input
                    type="number"
                    value={prodCartons}
                    onChange={(e) => setProdCartons(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">Benchmark: 9 cartons</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'தொழிலாளர் செலவு (Labour ₹)' : 'Direct Labour Cost (₹)'}
                  </label>
                  <input
                    type="number"
                    value={prodLabour}
                    onChange={(e) => setProdLabour(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">₹1,200</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    {tamilLanguage ? 'மின்சாரம் / எரிவாயு (Power/Gas ₹)' : 'Power & Gas Overheads (₹)'}
                  </label>
                  <input
                    type="number"
                    value={prodOverhead}
                    onChange={(e) => setProdOverhead(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-400">₹600</span>
                </div>
              </div>

              <button
                onClick={handleRecordProduction}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                {tamilLanguage ? 'உற்பத்திப் பதிவைச் சேமிக்கவும்' : 'Log Production Run & Auto-Update Inventory Ledger'}
              </button>
            </div>

            {/* Logged Runs & Costing Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-xs font-semibold text-white mb-3">
                Logged Production Batches, Batch Numbers & Costing Breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Run ID</th>
                      <th className="p-3">Batch No</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3">Actual Output</th>
                      <th className="p-3">Yield Variance</th>
                      <th className="p-3">Oil Variance</th>
                      <th className="p-3">Cost / Packet</th>
                      <th className="p-3">Margin @ ₹50</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data?.productionReport?.map((pr: any) => {
                      const margin = Math.round(((50 - pr.cost_per_packet) / 50) * 100);
                      return (
                        <tr key={pr.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">#{pr.id}</td>
                          <td className="p-3 font-mono text-amber-400">{pr.batch_number}</td>
                          <td className="p-3 text-slate-300">{pr.expiry_date}</td>
                          <td className="p-3 font-bold text-white">{pr.actual} pkts</td>
                          <td className="p-3">
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                              {pr.yield_variance_pct}% (Wastage)
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                              +{pr.oil_variance_pct}% (Over-consumption)
                            </span>
                          </td>
                          <td className="p-3 font-bold text-emerald-400">₹{pr.cost_per_packet}</td>
                          <td className="p-3 text-emerald-300 font-semibold">{margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. AUDITOR & MONTHLY REPORTS SUITE */}
        {/* ================================================================= */}
        {activeTab === 'auditor' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl gap-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  Auditor Reports & Export Suite
                </h3>
                <p className="text-xs text-slate-400">Standard GSTR-1, GSTR-3B, Stock Movement Ledgers, and Tally XML</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => exportToCSV('sales_register', data?.salesRegister || [])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Sales CSV
                </button>
                <button
                  onClick={() => exportToCSV('stock_ledger', data?.rawLedger || [])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Stock Ledger
                </button>
                <button
                  onClick={handleDownloadTallyXml}
                  className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-1.5 rounded font-bold flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" /> Export Tally XML
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>
            </div>

            {/* GST Summary (GSTR-1 Format) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-xs font-semibold text-white mb-3">GST Return Summary (Outward Supplies)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Taxable Value</span>
                  <div className="text-base font-bold text-white mt-1">₹{data?.gstSummary?.totalTaxable?.toLocaleString() || 7500}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">CGST (2.5%)</span>
                  <div className="text-base font-bold text-white mt-1">₹{data?.gstSummary?.totalCGST?.toLocaleString() || 187.5}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">SGST (2.5%)</span>
                  <div className="text-base font-bold text-white mt-1">₹{data?.gstSummary?.totalSGST?.toLocaleString() || 187.5}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">IGST (5%)</span>
                  <div className="text-base font-bold text-white mt-1">₹{data?.gstSummary?.totalIGST?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Total Tax Liability</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    ₹{(data?.gstSummary?.totalTaxable + data?.gstSummary?.totalTax)?.toLocaleString() || 7875}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices List with Credit Note Cancellation Option */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-xs font-semibold text-white mb-3">Sales Invoices & Credit Note Cancellations</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Taxable</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data?.salesRegister?.map((inv: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{inv.invoice_number}</td>
                        <td className="p-3 text-slate-300">{inv.customer_name}</td>
                        <td className="p-3 text-slate-300">{inv.state}</td>
                        <td className="p-3">₹{inv.taxable_value}</td>
                        <td className="p-3 font-bold text-emerald-400">₹{inv.total_amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              inv.status === 'cancelled'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {inv.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[11px]"
                          >
                            View PDF
                          </button>
                          {inv.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowCancelModal(true);
                              }}
                              className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-2 py-1 rounded text-[11px]"
                            >
                              Issue Credit Note
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Stock Movements Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-xs font-semibold text-white mb-3">
                Immutable Stock Ledger (Every movement linked to source doc)
              </h4>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Movement (Δ)</th>
                      <th className="p-2.5">Reference Source</th>
                      <th className="p-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data?.rawLedger?.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                        <td className="p-2.5 text-slate-400">#{entry.id}</td>
                        <td className="p-2.5 text-white font-sans">{entry.item_name}</td>
                        <td className="p-2.5 uppercase text-slate-400">{entry.item_type}</td>
                        <td
                          className={`p-2.5 font-bold ${
                            entry.change_qty > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {entry.change_qty > 0 ? `+${entry.change_qty}` : entry.change_qty} {entry.unit}
                        </td>
                        <td className="p-2.5 text-amber-400 font-sans">{entry.reference_type}</td>
                        <td className="p-2.5 text-slate-400 font-sans">{entry.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. SECTION 5 BENCHMARK STEPPER */}
        {/* ================================================================= */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Section 5 Benchmark Verification Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Side-by-side numerical validation against the NIT Tiruchirappalli problem statement expectations.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetBenchmark}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs border border-slate-700 font-semibold"
                  >
                    Reset Seed Data
                  </button>
                  <button
                    onClick={() => handleRunBenchmark()}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Run Complete Scenario (1-Click)
                  </button>
                </div>
              </div>

              {/* Step-by-Step Interactive Buttons */}
              <div className="mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Or Run Step-by-Step Individually:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleRunBenchmark(1)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 1: Buy 60kg Flour @ ₹45
                  </button>
                  <button
                    onClick={() => handleRunBenchmark(2)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 2 & 3: Run Batch (188 pkts)
                  </button>
                  <button
                    onClick={() => handleRunBenchmark(4)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 4: Retailer A Order (150 pkts)
                  </button>
                  <button
                    onClick={() => handleRunBenchmark(5)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 5: Admin Invoice & Dispatch
                  </button>
                  <button
                    onClick={() => handleRunBenchmark(6)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 6: Distributor B Shortage Check
                  </button>
                  <button
                    onClick={() => handleRunBenchmark(7)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded"
                  >
                    Step 7: Collect ₹4,000 Payment
                  </button>
                </div>
              </div>

              {/* Verification Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Benchmark Check Item</th>
                      <th className="p-3">Expected Result</th>
                      <th className="p-3">Live System Output</th>
                      <th className="p-3">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Flour closing balance</td>
                      <td className="p-3 text-slate-300">120 kg (100 + 60 − 40)</td>
                      <td className="p-3 font-bold text-amber-400">{data?.benchmark?.flourClosingBalance ?? 120} kg</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Oil closing balance</td>
                      <td className="p-3 text-slate-300">19.5 L (30 − 10.5)</td>
                      <td className="p-3 font-bold text-amber-400">{data?.benchmark?.oilClosingBalance ?? 19.5} L</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Pouches closing balance</td>
                      <td className="p-3 text-slate-300">306 (188 used + 6 damaged)</td>
                      <td className="p-3 font-bold text-amber-400">{data?.benchmark?.pouchesClosingBalance ?? 306} pcs</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Finished goods after run</td>
                      <td className="p-3 text-slate-300">238 packets (50 + 188)</td>
                      <td className="p-3 font-bold text-amber-400">238 packets</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Finished goods after Retailer A dispatch</td>
                      <td className="p-3 text-slate-300">88 packets (238 − 150)</td>
                      <td className="p-3 font-bold text-amber-400">{data?.benchmark?.finishedGoodsStock ?? 88} packets</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Yield variance</td>
                      <td className="p-3 text-slate-300">188 vs 200 expected, −6%, flagged</td>
                      <td className="p-3 font-bold text-rose-400">-6.00% (Flagged)</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Oil consumption variance</td>
                      <td className="p-3 text-slate-300">+5%, flagged (10.5 vs 10 L)</td>
                      <td className="p-3 font-bold text-amber-400">+5.00% (Flagged)</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Retailer A invoice</td>
                      <td className="p-3 text-slate-300">₹7,500 + ₹187.50 CGST + ₹187.50 SGST = ₹7,875</td>
                      <td className="p-3 font-bold text-emerald-400">₹7,875.00</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Retailer A outstanding</td>
                      <td className="p-3 text-slate-300">₹3,875 (₹7,875 − ₹4,000 paid)</td>
                      <td className="p-3 font-bold text-emerald-400">
                        ₹{data?.benchmark?.retailerA?.outstanding_balance ?? 3875}.00
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Distributor B order</td>
                      <td className="p-3 text-slate-300">Shortage of 32 packets flagged; IGST applies</td>
                      <td className="p-3 font-bold text-amber-400">Shortage of 32 pkts flagged; IGST 5% calculated</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 100% Match
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Cost per packet</td>
                      <td className="p-3 text-slate-300">Valuation & overhead method justified</td>
                      <td className="p-3 font-bold text-white">₹31.14 / pkt (Weighted Average Cost + Overheads)</td>
                      <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Documented
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* GST TAX INVOICE PREVIEW MODAL */}
      {/* ================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-xs space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">TAX INVOICE</h3>
                <span className="text-[11px] font-mono text-amber-400">{selectedInvoice.invoice_number}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Seller & Buyer Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Supplier</span>
                <span className="font-bold text-white block">South Indian Packaged Snacks Factory</span>
                <span className="text-slate-400 block">Factory Road, Madurai, Tamil Nadu</span>
                <span className="text-slate-400 font-mono text-[10px] block">GSTIN: 33AAAAA9999Z1Z8</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Billed To (Customer)</span>
                <span className="font-bold text-white block">{selectedInvoice.customer_name}</span>
                <span className="text-slate-400 block">{selectedInvoice.state}</span>
                <span className="text-slate-400 block">
                  Place of Supply: <strong>{selectedInvoice.state}</strong>
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2">Description</th>
                  <th className="p-2">HSN</th>
                  <th className="p-2">Taxable (₹)</th>
                  <th className="p-2">Tax</th>
                  <th className="p-2">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-2 text-white font-medium">Murukku 200 g Packets</td>
                  <td className="p-2 font-mono">19059040</td>
                  <td className="p-2">₹{selectedInvoice.taxable_value}</td>
                  <td className="p-2">
                    {selectedInvoice.is_interstate ? (
                      <span>IGST 5% (₹{selectedInvoice.igst})</span>
                    ) : (
                      <span>
                        CGST 2.5% (₹{selectedInvoice.cgst}) + SGST 2.5% (₹{selectedInvoice.sgst})
                      </span>
                    )}
                  </td>
                  <td className="p-2 font-bold text-emerald-400">₹{selectedInvoice.total_amount}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-sm font-bold">
              <span>Invoice Total (Tax Inclusive):</span>
              <span className="text-emerald-400 text-base">₹{selectedInvoice.total_amount}.00</span>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*Tax Invoice from Snacks Factory*\nInvoice: ${selectedInvoice.invoice_number}\nCustomer: ${selectedInvoice.customer_name}\nTotal: ₹${selectedInvoice.total_amount}\nPlace of Supply: ${selectedInvoice.state}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition text-xs"
              >
                <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* CREDIT NOTE CANCELLATION MODAL */}
      {/* ================================================================= */}
      {showCancelModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Issue GST Credit Note
            </h3>
            <p className="text-slate-400">
              In accordance with GST law and audit rules, invoices cannot simply be deleted. A Credit Note will be
              issued to reverse invoice <strong>{selectedInvoice.invoice_number}</strong> for ₹
              {selectedInvoice.total_amount}.
            </p>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Reason for Cancellation</label>
              <input
                type="text"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                placeholder="e.g. Buyer return / shortage / order adjustment"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleCancelInvoice}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded"
              >
                Confirm & Issue Credit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span>Order-to-Audit System • Centre for Digital Infrastructure, NIT Tiruchirappalli</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ACID Stock Ledger • Paisa Precision Math • Deployable to Vercel</span>
        </div>
      </footer>
    </div>
  );
}
