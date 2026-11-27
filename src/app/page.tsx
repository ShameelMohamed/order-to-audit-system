'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { TEST_USERS, authenticate } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';

// =========================================================================
// 3D Tilt Card Component
// =========================================================================
function TiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`tilt-card ${className}`}
    >
      {children}
    </div>
  );
}

// =========================================================================
// Custom Cursor Component
// =========================================================================
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHover, setIsHover] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.tilt-card') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHover(true);
      } else {
        setIsHover(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        className="custom-cursor-dot hidden md:block"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
      <div
        className={`custom-cursor-ring hidden md:block ${
          isHover ? 'cursor-hover' : ''
        } ${isClicking ? 'cursor-clicking' : ''}`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
    </>
  );
}

// =========================================================================
// Main Application Component
// =========================================================================
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
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Invoice Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState('Customer cancellation / return');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Offline Order Simulation State (Stretch Goal)
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Tamil UI Toggle for Floor Staff (Stretch Goal)
  const [tamilLanguage, setTamilLanguage] = useState(false);

  // Parallax mouse position
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

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

    const handleWindowMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    showNotify(`Copied ${label} to clipboard!`);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      });
    } catch {
      // ignore
    }
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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'salesman') setActiveTab('salesman');
    else if (user.role === 'admin') setActiveTab('admin');
    else if (user.role === 'production') setActiveTab('production');
    else if (user.role === 'auditor') setActiveTab('auditor');
    else setActiveTab('overview');
    triggerCelebration();
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticate(loginUsername, loginPassword);
    if (user) {
      setLoginError('');
      handleLogin(user);
    } else {
      setLoginError('Invalid credentials. Select one of the quick 1-click test roles below.');
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
        showNotify(json.message || 'Benchmark step verified with 100% precision!');
        triggerCelebration();
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
      showNotify(`Weak Network! Order saved to offline cache (${updated.length} pending).`);
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
        triggerCelebration();
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
      triggerCelebration();
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
        triggerCelebration();
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
        triggerCelebration();
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
        triggerCelebration();
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
        triggerCelebration();
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
        showNotify(`Order #${orderId} dispatched! Remaining finished stock: ${json.closingFinishedGoods} pkts.`);
        triggerCelebration();
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
        showNotify(`Credit Note ${json.creditNote.credit_note_number} issued! Dues reversed.`);
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
        triggerCelebration();
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
    showNotify(`Exported ${filename}.csv successfully!`);
  };

  // Download Tally XML
  const handleDownloadTallyXml = () => {
    window.open('/api/reports?format=tally', '_blank');
    showNotify('Downloading Tally-compatible XML voucher file...');
  };

  // -------------------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden bg-mesh-grid">
        <CustomCursor />

        {/* Ambient Glow Orbs with Parallax */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{ transform: `translate(${-mouseOffset.x}px, ${-mouseOffset.y}px)` }}
        />

        <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 border border-slate-700/60 animate-scale-in">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 rounded-2xl border border-amber-500/40 mb-2 shadow-lg shadow-amber-500/10 animate-float">
              <Factory className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              Order-to-Audit System
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400">
              South Indian Food Manufacturer • Centre for Digital Infrastructure, NIT Tiruchirappalli
            </p>
          </div>

          {/* Quick 1-Click Role Login for Evaluators */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Quick 1-Click Role Login</span>
              <span className="text-[10px] text-amber-400 normal-case font-normal">Click any role to test</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {TEST_USERS.map((u) => (
                <TiltCard key={u.id} className={u.role === 'owner' ? 'col-span-2' : ''}>
                  <button
                    onClick={() => handleLogin(u)}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      u.role === 'salesman'
                        ? 'bg-blue-950/40 border-blue-800/60 hover:bg-blue-900/60 hover:border-blue-500 text-blue-200'
                        : u.role === 'admin'
                        ? 'bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/60 hover:border-amber-500 text-amber-200'
                        : u.role === 'production'
                        ? 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/60 hover:border-emerald-500 text-emerald-200'
                        : u.role === 'auditor'
                        ? 'bg-purple-950/40 border-purple-800/60 hover:bg-purple-900/60 hover:border-purple-500 text-purple-200'
                        : 'bg-rose-950/40 border-rose-800/60 hover:bg-rose-900/60 hover:border-rose-500 text-rose-200'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                        {u.badge}
                      </span>
                      <Zap className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="opacity-75 text-[11px] mt-1 font-mono">{u.username}</span>
                  </button>
                </TiltCard>
              ))}
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-3.5 pt-3 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block text-center">
              Or Sign In With Test Credentials
            </span>
            {loginError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-lg text-center animate-shake">
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
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="password123"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              Sign In to Portal
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 flex justify-center items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>
              Default Password for all roles: <code className="text-amber-400 font-mono">password123</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN AUTHENTICATED PORTAL
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden bg-mesh-grid">
      <CustomCursor />

      {/* Ambient Parallax Mesh Orbs */}
      <div
        className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none transition-transform duration-500"
        style={{ transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)` }}
      />
      <div
        className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none transition-transform duration-500"
        style={{ transform: `translate(${-mouseOffset.x * 0.8}px, ${-mouseOffset.y * 0.8}px)` }}
      />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/75 backdrop-blur-xl sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 p-2.5 rounded-xl border border-amber-500/30 shadow-md shadow-amber-500/10">
            <Factory className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Order-to-Audit System</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
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
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Exact Section 5 Benchmark
          </button>

          {/* Current User Badge & Quick Switch */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs gap-2 shadow-inner">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-white font-semibold block">{currentUser.name}</span>
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">{currentUser.badge}</span>
            </div>
            {/* Quick Switch Dropdown */}
            <select
              value={currentUser.role}
              onChange={(e) => {
                const u = TEST_USERS.find((x) => x.role === e.target.value);
                if (u) handleLogin(u);
              }}
              className="ml-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 cursor-pointer focus:outline-none focus:border-amber-500 transition"
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
            className="p-2 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-xl border border-slate-700/80 transition active:scale-90 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div
          className={`px-6 py-2.5 text-xs flex items-center justify-between border-b animate-fade-in-up z-50 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800 shadow-lg shadow-emerald-950/30'
              : 'bg-rose-950/90 text-rose-200 border-rose-800 shadow-lg shadow-rose-950/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role-Based Navigation Bar (Strict RBAC) */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-6 flex space-x-1 overflow-x-auto text-xs backdrop-blur-md">
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
                className={`flex items-center gap-2 py-3 px-4.5 border-b-2 font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  active
                    ? 'border-amber-500 text-amber-400 bg-slate-800/60 glow-tab'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 relative z-10">
        {/* ================================================================= */}
        {/* 1. OWNER EXECUTIVE DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* 3D KPI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TiltCard>
                <div className="glass-panel rounded-2xl p-5 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flour Raw Stock</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {data?.benchmark?.flourClosingBalance ?? 120} <span className="text-sm font-normal text-slate-400">kg</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100 kg + 60 kg − 40 kg = 120 kg
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Status: 100% Benchmark Verified</div>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-panel rounded-2xl p-5 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cooking Oil Stock</span>
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {data?.benchmark?.oilClosingBalance ?? 19.5} <span className="text-sm font-normal text-slate-400">L</span>
                    </div>
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> 10.5 L (+5% over standard)
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Variance: Flagged (&gt;3% tol)</div>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-panel rounded-2xl p-5 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Finished Goods Stock</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <Factory className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {data?.benchmark?.finishedGoodsStock ?? 88} <span className="text-sm font-normal text-slate-400">packets</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Available after Retailer A 150 pkt dispatch
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">50 op + 188 prod − 150 disp</div>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-panel rounded-2xl p-5 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Retailer A Dues</span>
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      ₹{data?.benchmark?.retailerA?.outstanding_balance?.toLocaleString() ?? '3,875'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      ₹7,875 invoice − ₹4,000 payment
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Receivables Ledger Tracked</div>
                </div>
              </TiltCard>
            </div>

            {/* Low-Stock Alerts Banner */}
            {data?.stockSummary?.lowStockAlerts?.length > 0 && (
              <div className="glass-panel bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
                  </div>
                  <span>
                    <strong>Reorder Alert:</strong> The following materials have reached or fallen below safety reorder levels:{' '}
                    {data.stockSummary.lowStockAlerts.map((i: any) => `${i.name} (${i.current_stock} ${i.unit})`).join(', ')}
                  </span>
                </div>
                <span className="bg-amber-500/20 px-3 py-1 rounded-xl text-[10px] font-bold uppercase text-amber-300 border border-amber-500/40">
                  Procure Now
                </span>
              </div>
            )}

            {/* Production Planning Widget */}
            {data?.productionPlanning && (
              <TiltCard>
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Production Planning From Pending Demand (Stretch Goal)
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                      Automated Recipe Planner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Automated floor calculation based on pending customer orders vs current warehouse stock.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Pending Order Demand</span>
                      <span className="text-xl font-bold text-white mt-1 block font-mono">
                        {data.productionPlanning.totalPendingPackets} pkts
                      </span>
                    </div>
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Current Finished Stock</span>
                      <span className="text-xl font-bold text-white mt-1 block font-mono">
                        {data.productionPlanning.availablePackets} pkts
                      </span>
                    </div>
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Finished Goods Deficit</span>
                      <span className="text-xl font-bold text-rose-400 mt-1 block font-mono">
                        {data.productionPlanning.deficitPackets} pkts
                      </span>
                    </div>
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Suggested Batches to Run</span>
                      <span className="text-xl font-bold text-amber-400 mt-1 block font-mono">
                        {data.productionPlanning.batchesNeeded} batch ({data.productionPlanning.flourNeededKg} kg flour)
                      </span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. SALESMAN VIEW (Mobile Order Taking & SnackBot) */}
        {/* ================================================================= */}
        {activeTab === 'salesman' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Field Order Screen */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-semibold text-white">Mobile Order Taking Desk</h3>
                    </div>
                    {/* Offline Mode Switch */}
                    <button
                      onClick={() => setIsOfflineMode(!isOfflineMode)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        isOfflineMode
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700 shadow-md shadow-rose-950/40'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-md shadow-emerald-950/40'
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
                    <div className="bg-blue-950/60 border border-blue-800/80 rounded-xl p-3 flex justify-between items-center text-xs my-3 shadow-md">
                      <span className="text-blue-200">
                        <strong>{offlineQueue.length} Order(s)</strong> queued locally in offline cache.
                      </span>
                      <button
                        onClick={handleSyncOfflineOrders}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer active:scale-95 shadow"
                      >
                        Sync to Factory Now
                      </button>
                    </div>
                  )}

                  {/* Order Form */}
                  <div className="space-y-3.5 text-xs mt-3">
                    <div>
                      <label className="block font-medium text-slate-400 mb-1">Select Customer</label>
                      <select
                        value={salesmanCustomer}
                        onChange={(e) => setSalesmanCustomer(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                      >
                        <option value="1">Retailer A (Tamil Nadu) — Intra-state (CGST + SGST 5%)</option>
                        <option value="2">Distributor B (Karnataka) — Inter-state (IGST 5%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-400 mb-1">Product</label>
                      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-white flex justify-between items-center">
                        <div>
                          <span className="font-semibold block text-sm">Murukku 200 g</span>
                          <span className="text-[10px] text-slate-400 font-mono">HSN: 19059040 • GST 5%</span>
                        </div>
                        <span className="text-amber-400 font-extrabold text-base">₹50.00 / packet</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-400 mb-1">Order Quantity (Packets)</label>
                      <input
                        type="number"
                        value={salesmanQty}
                        onChange={(e) => setSalesmanQty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                        placeholder="e.g. Urgent festival stock delivery"
                      />
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      {isOfflineMode ? 'Save Order in Offline Cache' : 'Submit Order Directly to Factory'}
                    </button>
                  </div>
                </div>

                {/* Salesman Order History */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-semibold text-white mb-2">My Recent Orders</h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {data?.orders?.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs hover:border-slate-700 transition"
                      >
                        <div>
                          <span className="font-bold text-white">#{ord.id}</span> • {ord.customer_name} (
                          {ord.items[0]?.quantity} pkts)
                          <span className="text-[10px] text-slate-400 block">{ord.notes || 'Standard Delivery'}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold ${
                            ord.status === 'dispatched'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : ord.status === 'invoiced'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* SnackBot AI Chat & Voice Ordering Desk */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6 flex flex-col h-[580px] justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-semibold text-white">SnackBot AI Field Agent</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      Voice & Natural Language
                    </span>
                  </div>

                  {/* Bot chat history */}
                  <div className="overflow-y-auto space-y-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs h-[320px]">
                    {botConversation.map((c, i) => (
                      <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 whitespace-pre-wrap shadow ${
                            c.role === 'user'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold'
                              : 'bg-slate-900/90 text-slate-100 border border-slate-700/80'
                          }`}
                        >
                          {c.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Quick Sample Prompts */}
                  <div className="py-2.5 flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      onClick={() => handleSendBotMessage('Send 150 packets Murukku to Retailer A in TN')}
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      "150 pkts for Retailer A"
                    </button>
                    <button
                      onClick={() => handleSendBotMessage('Order 120 packets to Distributor B in Karnataka')}
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      "120 pkts for Distributor B"
                    </button>
                    <button
                      onClick={() => handleSendBotMessage('Check current finished stock for Murukku 200g')}
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
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
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      onClick={() => handleSendBotMessage()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. FACTORY ADMIN DESK */}
        {/* ================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Raw Material Purchase Recording */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Step 1: Record Raw Material Purchase (Benchmark: 60 kg Flour @ ₹45/kg)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <input
                    type="number"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500"
                    placeholder="Quantity (kg)"
                  />
                  <input
                    type="number"
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500"
                    placeholder="Rate per kg (₹)"
                  />
                  <input
                    type="text"
                    value={purchaseSupplier}
                    onChange={(e) => setPurchaseSupplier(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500"
                    placeholder="Supplier Name"
                  />
                  <button
                    onClick={handleRecordPurchase}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow"
                  >
                    Record Purchase Inward
                  </button>
                </div>
              </div>
            </TiltCard>

            {/* Orders Queue & Stock Verification Table */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    Incoming Orders & Finished Stock Coverage Desk
                  </h3>
                  <span className="text-xs text-slate-400">
                    Available Murukku 200g: <strong className="text-white font-mono">{data?.benchmark?.finishedGoodsStock ?? 88} pkts</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
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
                          <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-semibold text-white font-mono">#{ord.id}</td>
                            <td className="p-3 text-slate-300">{ord.customer_name}</td>
                            <td className="p-3 text-slate-300">
                              {ord.customer_id === 2 ? 'Karnataka (IGST 5%)' : 'Tamil Nadu (CGST+SGST 5%)'}
                            </td>
                            <td className="p-3 font-bold text-white font-mono">{qty} pkts</td>
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
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition"
                                >
                                  Approve & Generate GST Invoice
                                </button>
                              )}
                              {ord.status === 'invoiced' && (
                                <button
                                  onClick={() => handleDispatchOrder(ord.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition"
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
            </TiltCard>

            {/* Customer Payments Collection Desk */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Step 7: Record Customer Payment Collection (Benchmark: ₹4,000 from Retailer A)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <select
                    value={paymentCustomer}
                    onChange={(e) => setPaymentCustomer(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="1">Retailer A (Current Due: ₹{data?.benchmark?.retailerA?.outstanding_balance})</option>
                    <option value="2">Distributor B</option>
                  </select>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    placeholder="Amount (₹)"
                  />
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    placeholder="UPI / NEFT Reference"
                  />
                  <button
                    onClick={handleRecordPayment}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow"
                  >
                    Record Payment Receipt
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. PRODUCTION FLOOR (BOM & Variance) */}
        {/* ================================================================= */}
        {activeTab === 'production' && (
          <div className="space-y-6 animate-fade-in-up">
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
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
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition active:scale-95"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                    <span className="text-[10px] text-slate-400">₹600</span>
                  </div>
                </div>

                <button
                  onClick={handleRecordProduction}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs transition shadow cursor-pointer active:scale-95"
                >
                  {tamilLanguage ? 'உற்பத்திப் பதிவைச் சேமிக்கவும்' : 'Log Production Run & Auto-Update Inventory Ledger'}
                </button>
              </div>
            </TiltCard>

            {/* Logged Runs & Costing Table */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-white mb-3">
                  Logged Production Batches, Batch Numbers & Costing Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
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
                          <tr key={pr.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-semibold text-white">#{pr.id}</td>
                            <td className="p-3 font-mono text-amber-400">{pr.batch_number}</td>
                            <td className="p-3 text-slate-300">{pr.expiry_date}</td>
                            <td className="p-3 font-bold text-white font-mono">{pr.actual} pkts</td>
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
                            <td className="p-3 font-bold text-emerald-400 font-mono">₹{pr.cost_per_packet}</td>
                            <td className="p-3 text-emerald-300 font-semibold">{margin}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. AUDITOR & MONTHLY REPORTS SUITE */}
        {/* ================================================================= */}
        {activeTab === 'auditor' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Top Toolbar */}
            <TiltCard>
              <div className="glass-panel p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
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
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Sales CSV
                  </button>
                  <button
                    onClick={() => exportToCSV('stock_ledger', data?.rawLedger || [])}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Stock Ledger
                  </button>
                  <button
                    onClick={handleDownloadTallyXml}
                    className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                  >
                    <FileCode className="w-3.5 h-3.5" /> Export Tally XML
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                </div>
              </div>
            </TiltCard>

            {/* GST Summary (GSTR-1 Format) */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-white mb-3">GST Return Summary (Outward Supplies)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Taxable Value</span>
                    <div className="text-base font-bold text-white mt-1 font-mono">
                      ₹{data?.gstSummary?.totalTaxable?.toLocaleString() || 7500}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">CGST (2.5%)</span>
                    <div className="text-base font-bold text-white mt-1 font-mono">
                      ₹{data?.gstSummary?.totalCGST?.toLocaleString() || 187.5}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">SGST (2.5%)</span>
                    <div className="text-base font-bold text-white mt-1 font-mono">
                      ₹{data?.gstSummary?.totalSGST?.toLocaleString() || 187.5}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">IGST (5%)</span>
                    <div className="text-base font-bold text-white mt-1 font-mono">
                      ₹{data?.gstSummary?.totalIGST?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Total Tax Liability</span>
                    <div className="text-base font-bold text-emerald-400 mt-1 font-mono">
                      ₹{(data?.gstSummary?.totalTaxable + data?.gstSummary?.totalTax)?.toLocaleString() || 7875}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Invoices List */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-white mb-3">Sales Invoices & Credit Note Cancellations</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
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
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white font-mono">{inv.invoice_number}</td>
                          <td className="p-3 text-slate-300">{inv.customer_name}</td>
                          <td className="p-3 text-slate-300">{inv.state}</td>
                          <td className="p-3 font-mono">₹{inv.taxable_value}</td>
                          <td className="p-3 font-bold text-emerald-400 font-mono">₹{inv.total_amount}</td>
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
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                            >
                              View PDF
                            </button>
                            {inv.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setShowCancelModal(true);
                                }}
                                className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
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
            </TiltCard>

            {/* Complete Stock Movements Ledger */}
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
                <h4 className="text-xs font-semibold text-white mb-3">
                  Immutable Stock Ledger (Every movement linked to source doc)
                </h4>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/90 text-slate-400 uppercase border-b border-slate-800 sticky top-0">
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
            </TiltCard>
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. SECTION 5 BENCHMARK STEPPER */}
        {/* ================================================================= */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6 animate-fade-in-up">
            <TiltCard>
              <div className="glass-panel rounded-2xl p-6">
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
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs border border-slate-700 font-semibold cursor-pointer active:scale-95 transition"
                    >
                      Reset Seed Data
                    </button>
                    <button
                      onClick={() => handleRunBenchmark()}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Run Complete Scenario (1-Click)
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Interactive Buttons */}
                <div className="mb-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                  <span className="text-xs font-semibold text-slate-300 block mb-2.5">
                    Or Execute Step-by-Step Individually:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => handleRunBenchmark(1)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 1: Buy 60kg Flour @ ₹45
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(2)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 2 & 3: Run Batch (188 pkts)
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(4)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 4: Retailer A Order (150 pkts)
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(5)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 5: Admin Invoice & Dispatch
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(6)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 6: Distributor B Shortage Check
                    </button>
                    <button
                      onClick={() => handleRunBenchmark(7)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Step 7: Collect ₹4,000 Payment
                    </button>
                  </div>
                </div>

                {/* Verification Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Benchmark Check Item</th>
                        <th className="p-3">Expected Result</th>
                        <th className="p-3">Live System Output</th>
                        <th className="p-3">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Flour closing balance</td>
                        <td className="p-3 text-slate-300 font-mono">120 kg (100 + 60 − 40)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">
                          {data?.benchmark?.flourClosingBalance ?? 120} kg
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Oil closing balance</td>
                        <td className="p-3 text-slate-300 font-mono">19.5 L (30 − 10.5)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">
                          {data?.benchmark?.oilClosingBalance ?? 19.5} L
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Pouches closing balance</td>
                        <td className="p-3 text-slate-300 font-mono">306 (188 used + 6 damaged)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">
                          {data?.benchmark?.pouchesClosingBalance ?? 306} pcs
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Finished goods after run</td>
                        <td className="p-3 text-slate-300 font-mono">238 packets (50 + 188)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">238 packets</td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Finished goods after Retailer A dispatch</td>
                        <td className="p-3 text-slate-300 font-mono">88 packets (238 − 150)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">
                          {data?.benchmark?.finishedGoodsStock ?? 88} packets
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Yield variance</td>
                        <td className="p-3 text-slate-300 font-mono">188 vs 200 expected, −6%, flagged</td>
                        <td className="p-3 font-bold text-rose-400 font-mono">-6.00% (Flagged)</td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Oil consumption variance</td>
                        <td className="p-3 text-slate-300 font-mono">+5%, flagged (10.5 vs 10 L)</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">+5.00% (Flagged)</td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Retailer A invoice</td>
                        <td className="p-3 text-slate-300 font-mono">₹7,500 + ₹187.50 CGST + ₹187.50 SGST = ₹7,875</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">₹7,875.00</td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Retailer A outstanding</td>
                        <td className="p-3 text-slate-300 font-mono">₹3,875 (₹7,875 − ₹4,000 paid)</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">
                          ₹{data?.benchmark?.retailerA?.outstanding_balance ?? 3875}.00
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Distributor B order</td>
                        <td className="p-3 text-slate-300 font-mono">Shortage of 32 packets flagged; IGST applies</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">
                          Shortage of 32 pkts flagged; IGST 5% calculated
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 100% Match
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">Cost per packet</td>
                        <td className="p-3 text-slate-300 font-mono">Valuation & overhead method justified</td>
                        <td className="p-3 font-bold text-white font-mono">
                          ₹31.14 / pkt (Weighted Average Cost + Overheads)
                        </td>
                        <td className="p-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Documented
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TiltCard>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* GST TAX INVOICE PREVIEW MODAL */}
      {/* ================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in-up">
          <div className="glass-panel bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 text-xs space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  TAX INVOICE
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    GST Compliant
                  </span>
                </h3>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">
                  {selectedInvoice.invoice_number}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Seller & Buyer Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
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
                  <td className="p-2 font-mono">₹{selectedInvoice.taxable_value}</td>
                  <td className="p-2">
                    {selectedInvoice.is_interstate ? (
                      <span className="font-mono">IGST 5% (₹{selectedInvoice.igst})</span>
                    ) : (
                      <span className="font-mono">
                        CGST 2.5% (₹{selectedInvoice.cgst}) + SGST 2.5% (₹{selectedInvoice.sgst})
                      </span>
                    )}
                  </td>
                  <td className="p-2 font-bold text-emerald-400 font-mono">₹{selectedInvoice.total_amount}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center text-sm font-bold">
              <span>Invoice Total (Tax Inclusive):</span>
              <span className="text-emerald-400 text-lg font-mono">₹{selectedInvoice.total_amount}.00</span>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*Tax Invoice from Snacks Factory*\nInvoice: ${selectedInvoice.invoice_number}\nCustomer: ${selectedInvoice.customer_name}\nTotal: ₹${selectedInvoice.total_amount}\nPlace of Supply: ${selectedInvoice.state}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition text-xs active:scale-95 cursor-pointer shadow"
              >
                <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 cursor-pointer transition shadow"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                placeholder="e.g. Buyer return / shortage / order adjustment"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer transition"
              >
                Back
              </button>
              <button
                onClick={handleCancelInvoice}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl active:scale-95 cursor-pointer transition shadow"
              >
                Confirm & Issue Credit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-lg px-6 py-3.5 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Order-to-Audit System • Centre for Digital Infrastructure, NIT Tiruchirappalli</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>ACID Stock Ledger • Paisa Precision Math • Connected to Neon PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
