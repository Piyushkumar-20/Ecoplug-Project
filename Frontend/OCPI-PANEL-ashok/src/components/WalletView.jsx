import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Wallet, Zap, Plus, Download, Search, CalendarDays, MapPin,
  ChevronLeft, ChevronRight, Loader2, RefreshCw, Info,
} from 'lucide-react';
import { apiRequest } from '../services/api';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number(value) || 0);
const dateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};
const dateOnly = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
};
const unwrap = (response) => response?.data ?? response ?? {};

const WalletView = () => {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [billingType, setBillingType] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const balanceResponse = await apiRequest('/api/wallet/balance');
      const balance = unwrap(balanceResponse);
      const type = String(balance.billingType || '').toUpperCase();
      if (!['PREPAID', 'POSTPAID'].includes(type)) throw new Error('Company billing type is not configured.');
      setBillingType(type);
      setSummary(balance);

      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search.trim()) params.set('search', search.trim());
      if (type === 'PREPAID' && typeFilter !== 'ALL') params.set('transactionType', typeFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      if (type === 'PREPAID') {
        const transactionResponse = await apiRequest(`/api/wallet/transactions?${params.toString()}`);
        const transactionData = unwrap(transactionResponse);
        const transactions = Array.isArray(transactionData.transactions) ? transactionData.transactions : [];
        setRows(transactions);
        setSummary((current) => ({ ...current, totalUsage: transactionData.summary?.totalUsage ?? '0.00' }));
        setPagination({ ...(transactionData.pagination || {}), page, limit: 10, total: transactionData.pagination?.total ?? transactions.length, totalPages: transactionData.pagination?.totalPages ?? Math.max(1, Math.ceil(transactions.length / 10)) });
      } else {
        const usageResponse = await apiRequest(`/api/wallet/postpaid/usage?${params.toString()}`);
        const usageData = unwrap(usageResponse);
        setRows(Array.isArray(usageData.records) ? usageData.records : []);
        setPagination(usageData.pagination || { page, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Unable to load wallet information.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate, typeFilter]);

  useEffect(() => { void loadWallet(); }, [loadWallet]);

  const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
  const firstItem = pagination.total ? (page - 1) * 10 + 1 : 0;
  const lastItem = Math.min(page * 10, Number(pagination.total) || rows.length);

  const exportCsv = () => {
    const headers = billingType === 'PREPAID'
      ? ['Date & Time', 'Description', 'Type', 'Reference ID', 'Amount', 'Balance After']
      : ['Session ID', 'Date', 'Location', 'Charger ID', 'Amount', 'Status'];
    const values = rows.map((item) => billingType === 'PREPAID'
      ? [dateTime(item.createdAt), item.description || 'Wallet transaction', item.transactionType, item.referenceId, item.amount, item.balanceAfter]
      : [item.sessionId, dateOnly(item.usageDate), item.location || item.description || '', item.chargerId || '', item.amount, item.status || 'COMPLETED']);
    const csv = [headers, ...values].map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `${billingType.toLowerCase()}-${billingType === 'PREPAID' ? 'transactions' : 'usage'}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const formattedRows = useMemo(() => rows, [rows]);

  if (loading && !summary) return <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin"/> Loading wallet...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Wallet</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${billingType === 'PREPAID' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{billingType || 'BILLING'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{billingType === 'PREPAID' ? 'Manage your wallet balance and view all transactions' : 'View your charging usage and outstanding balance'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void loadWallet()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4"/> Refresh</button>
          {billingType === 'PREPAID' && <button type="button" disabled title="Wallet funding is handled by EcoPlug" className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white opacity-90"><Plus className="h-4 w-4"/> Add Funds</button>}
        </div>
      </div>

      {error && <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button onClick={() => void loadWallet()} className="font-semibold underline">Retry</button></div>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex min-h-[145px] items-center gap-5 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Wallet className="h-9 w-9"/></div>
          <div className="min-w-0"><p className="text-sm font-semibold text-slate-500">{billingType === 'PREPAID' ? 'Available balance' : 'Outstanding Balance'}</p><p className="mt-1 text-3xl font-bold tracking-tight text-emerald-700">{money(billingType === 'PREPAID' ? summary?.availableBalance : summary?.outstandingBalance)}</p><p className="mt-1 text-sm text-slate-500">{billingType === 'PREPAID' ? 'Current wallet balance' : 'Total pending usage amount'}</p></div>
        </div>
        <div className="flex min-h-[145px] items-center gap-5 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Zap className="h-9 w-9"/></div>
          <div><p className="text-sm font-semibold text-slate-500">{billingType === 'PREPAID' ? 'Total usage' : 'Total Charging Sessions'}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{billingType === 'PREPAID' ? money(summary?.totalUsage ?? 0) : Number(pagination.total || 0).toLocaleString('en-IN')}</p><p className="mt-1 text-sm text-slate-500">{billingType === 'PREPAID' ? 'Total charging session deductions' : 'Recorded sessions'}</p></div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-bold text-slate-900">{billingType === 'PREPAID' ? 'Transaction History' : 'Charging Usage History'}</h2><p className="mt-1 text-sm text-slate-500">{billingType === 'PREPAID' ? 'View all your wallet transactions and charging session deductions' : 'View all your charging sessions and usage details'}</p></div>
          <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4"/> Export</button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(170px,0.8fr)_minmax(220px,1.2fr)]">
          {billingType === 'PREPAID' && <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"><option value="ALL">All Transactions</option><option value="CREDIT">Credits</option><option value="DEBIT">Debits</option></select>}
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-slate-500"/><input aria-label="Start date" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="min-w-0 w-full text-sm text-slate-600 outline-none"/><span className="text-slate-300">—</span><input aria-label="End date" type="date" value={endDate} min={startDate || undefined} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="min-w-0 w-full text-sm text-slate-600 outline-none"/></label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 lg:col-span-2"><Search className="h-4 w-4 shrink-0 text-slate-500"/><input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={billingType === 'PREPAID' ? 'Search by description or reference ID...' : 'Search by session ID...'} className="w-full text-sm outline-none placeholder:text-slate-400"/></label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead><tr className="bg-slate-50 text-xs font-bold text-slate-700">{(billingType === 'PREPAID' ? ['Date & Time', 'Description', 'Type', 'Reference ID', 'Amount', 'Balance After'] : ['Session ID', 'Date & Time', 'Location', 'Charger ID', 'Amount', 'Status']).map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-4">{heading}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Loading records...</td></tr> : formattedRows.length === 0 ? <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500">No {billingType === 'PREPAID' ? 'transactions' : 'charging usage records'} found.</td></tr> : formattedRows.map((item, index) => billingType === 'PREPAID' ? (
                <tr key={item.id ?? `${item.referenceId}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600">{dateTime(item.createdAt)}</td><td className="max-w-[220px] px-3 py-4"><p className="truncate font-semibold text-slate-900">{item.description || (item.transactionType === 'CREDIT' ? 'Wallet recharge' : 'Charging session')}</p></td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${String(item.transactionType).toUpperCase() === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{item.transactionType}</span></td><td className="whitespace-nowrap px-3 py-4 text-slate-600">{item.referenceId || '—'}</td><td className={`whitespace-nowrap px-3 py-4 font-bold ${String(item.transactionType).toUpperCase() === 'CREDIT' ? 'text-emerald-700' : 'text-red-600'}`}>{String(item.transactionType).toUpperCase() === 'CREDIT' ? '+' : '-'} {money(item.amount)}</td><td className="whitespace-nowrap px-3 py-4 font-bold text-slate-900">{money(item.balanceAfter)}</td>
                </tr>
              ) : (
                <tr key={item.id ?? `${item.sessionId}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="px-3 py-4 font-semibold text-slate-900">{item.sessionId ?? '—'}</td><td className="whitespace-nowrap px-3 py-4 text-slate-600">{dateTime(item.usageDate)}</td><td className="px-3 py-4 text-slate-700">{item.location || item.description || '—'}</td><td className="px-3 py-4 text-slate-700">{item.chargerId || '—'}</td><td className="whitespace-nowrap px-3 py-4 font-bold text-slate-900">{money(item.amount)}</td><td className="px-3 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{item.status || 'Completed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing {firstItem} to {lastItem} of {Number(pagination.total || 0).toLocaleString('en-IN')} {billingType === 'PREPAID' ? 'transactions' : 'sessions'}</p><div className="flex items-center gap-2"><button aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4"/></button><span className="min-w-16 text-center text-sm font-semibold text-slate-700">{page} / {totalPages}</span><button aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><ChevronRight className="h-4 w-4"/></button></div></div>
      </section>

      {billingType === 'POSTPAID' && <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700"><Info className="h-5 w-5 shrink-0 text-emerald-700"/><span>Your account is on <strong>POSTPAID</strong> billing. You will be billed based on your charging usage.</span></div>}
    </div>
  );
};

export default WalletView;
