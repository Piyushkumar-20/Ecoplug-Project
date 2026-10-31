import React, { useEffect, useState } from 'react';
import {
  Plus,
  Upload,
  LayoutGrid,
  Search,
  RotateCcw,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Send,
  Tag
} from 'lucide-react';
import { apiRequest } from '../services/api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB');
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const getComplaintId = (ticket) => ticket.complaintId || `CMP-${ticket.id}`;
const getCustomerName = (ticket) => ticket.customerName || ticket.user || '—';
const getCustomerPhone = (ticket) => ticket.customerPhone || ticket.phone || '—';
const getCustomerEmail = (ticket) => ticket.customerEmail || ticket.email || '—';

const ComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaintIdSearch, setComplaintIdSearch] = useState('');
  const [sessionIdSearch, setSessionIdSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [emspFilter, setEmspFilter] = useState('');
  const [complaintTypeFilter, setComplaintTypeFilter] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [newResponseText, setNewResponseText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [newTicketForm, setNewTicketForm] = useState({
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.NEW01',
    stationName: '',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    user: '',
  });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (complaintIdSearch.trim()) params.set('search', complaintIdSearch.trim());
      if (sessionIdSearch.trim()) params.set('sessionId', sessionIdSearch.trim());
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (priorityFilter !== 'All') params.set('priority', priorityFilter);
      if (emspFilter.trim()) params.set('emsp', emspFilter.trim());
      if (complaintTypeFilter.trim()) params.set('complaintType', complaintTypeFilter.trim());
      if (fromDateFilter) params.set('fromDate', fromDateFilter);
      if (toDateFilter) params.set('toDate', toDateFilter);

      const response = await apiRequest(`/api/complaints?${params.toString()}`);
      setComplaints(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || { page, pageSize, total: 0, totalPages: 0 });
      setSummary(response?.summary || { total: 0, open: 0, inProgress: 0, resolved: 0 });
    } catch (err) {
      setError(err?.message || 'Failed to load complaints. Please try again.');
      setComplaints([]);
      setPagination({ page, pageSize, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (complaintIdSearch.trim()) params.set('search', complaintIdSearch.trim());
        if (sessionIdSearch.trim()) params.set('sessionId', sessionIdSearch.trim());
        if (statusFilter !== 'All') params.set('status', statusFilter);
        if (priorityFilter !== 'All') params.set('priority', priorityFilter);
        if (emspFilter.trim()) params.set('emsp', emspFilter.trim());
        if (complaintTypeFilter.trim()) params.set('complaintType', complaintTypeFilter.trim());
        if (fromDateFilter) params.set('fromDate', fromDateFilter);
        if (toDateFilter) params.set('toDate', toDateFilter);

        const response = await apiRequest(`/api/complaints?${params.toString()}`);
        if (cancelled) return;

        setComplaints(Array.isArray(response?.data) ? response.data : []);
        setPagination(response?.pagination || { page, pageSize, total: 0, totalPages: 0 });
        setSummary(response?.summary || { total: 0, open: 0, inProgress: 0, resolved: 0 });
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load complaints. Please try again.');
          setComplaints([]);
          setPagination({ page, pageSize, total: 0, totalPages: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    pageSize,
    complaintIdSearch,
    sessionIdSearch,
    statusFilter,
    priorityFilter,
    emspFilter,
    complaintTypeFilter,
    fromDateFilter,
    toDateFilter,
  ]);

  const filteredComplaints = complaints;

  const openTicketDetails = async (ticket) => {
    setSelectedTicket(ticket);
    setDetailsError('');
    setDetailsLoading(true);

    try {
      // Backend supports GET /api/complaints/:id. If detail fetch fails,
      // the list row is still shown in the modal.
      const response = await apiRequest(`/api/complaints/${ticket.id}`);
      const detail = response?.data?.data || response?.data;
      if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        setSelectedTicket((current) =>
          current && String(current.id) === String(ticket.id)
            ? { ...current, ...detail }
            : current
        );
      }
    } catch (err) {
      setDetailsError(err?.message || 'Could not load additional complaint details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddNote = (event) => {
    event.preventDefault();
    if (!newResponseText.trim() || !selectedTicket) return;

    // No note-create endpoint was provided in the existing backend.
    // Keep this UI interaction local and do not imply it was saved to the server.
    const newNote = {
      sender: 'Manager (local note)',
      time: new Date().toLocaleString('en-GB'),
      text: newResponseText.trim(),
    };
    const updatedTicket = {
      ...selectedTicket,
      notes: [...(selectedTicket.notes || []), newNote],
    };

    setSelectedTicket(updatedTicket);
    setComplaints((previous) =>
      previous.map((item) =>
        String(item.id) === String(selectedTicket.id) ? updatedTicket : item
      )
    );
    setNewResponseText('');
    setNotice('Note added in this view only. The backend does not currently provide a note-save endpoint.');
  };

  const handleCreateTicketSubmit = (event) => {
    event.preventDefault();
    if (!newTicketForm.stationName.trim() || !newTicketForm.user.trim()) return;

    // No complaint-create endpoint was provided in the existing backend.
    // Add a temporary UI-only record, clearly marked as not saved to the server.
    const localTicket = {
      id: `local-${Date.now()}`,
      complaintId: 'Local draft',
      emsp: newTicketForm.emsp,
      chargerName: newTicketForm.chargerName,
      stationName: newTicketForm.stationName.trim(),
      complaintType: newTicketForm.complaintType,
      subType: newTicketForm.subType,
      priority: newTicketForm.priority,
      tat: '—',
      tatMinutes: 0,
      raisedAt: new Date().toISOString(),
      status: 'Open',
      customerName: newTicketForm.user.trim(),
      customerPhone: '',
      customerEmail: '',
      vehicle: '',
      sessionId: null,
      notes: [
        {
          sender: 'System (local draft)',
          time: new Date().toLocaleString('en-GB'),
          text: 'This complaint was created in the frontend only and has not been saved to the backend.',
        },
      ],
      _localOnly: true,
    };

    setComplaints((previous) => [localTicket, ...previous]);
    setIsCreateModalOpen(false);
    setNewTicketForm({
      emsp: 'Statiq Platform',
      chargerName: 'IN*EPL.NEW01',
      stationName: '',
      complaintType: 'Charging Session',
      subType: 'Charging Not Stopping',
      priority: 'Medium',
      user: '',
    });
    setNotice('Complaint added as a local draft only. The backend does not currently provide a create endpoint.');
  };

  const resetFilters = () => {
    setComplaintIdSearch('');
    setSessionIdSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setEmspFilter('');
    setComplaintTypeFilter('');
    setFromDateFilter('');
    setToDateFilter('');
    setPage(1);
  };

  const totalCount = summary.total;
  const openCount = summary.open;
  const inProgressCount = summary.inProgress;
  const resolvedCount = summary.resolved;

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Complaints</h1>
          <p className="mt-1 text-xs text-slate-500">Monitor and review customer complaints.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#C05621] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#A0461A]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div><p className="text-[10px] font-bold uppercase text-slate-400">Total Tickets</p><h3 className="mt-0.5 text-xl font-extrabold text-slate-900">{totalCount}</h3></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><MessageSquare className="h-4 w-4" /></div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-rose-200/80 bg-white p-3.5 shadow-2xs">
          <div><p className="text-[10px] font-bold uppercase text-rose-600">Open Tickets</p><h3 className="mt-0.5 text-xl font-extrabold text-rose-700">{openCount}</h3></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><AlertCircle className="h-4 w-4" /></div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
          <div><p className="text-[10px] font-bold uppercase text-amber-600">In Progress</p><h3 className="mt-0.5 text-xl font-extrabold text-amber-700">{inProgressCount}</h3></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Clock className="h-4 w-4" /></div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-white p-3.5 shadow-2xs">
          <div><p className="text-[10px] font-bold uppercase text-emerald-600">Resolved</p><h3 className="mt-0.5 text-xl font-extrabold text-emerald-700">{resolvedCount}</h3></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={complaintIdSearch}
              onChange={(event) => { setComplaintIdSearch(event.target.value); setPage(1); }}
              placeholder="Complaint ID / Station / User"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-8 pr-3.5 text-xs text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
          <input
            type="text"
            value={sessionIdSearch}
            onChange={(event) => { setSessionIdSearch(event.target.value); setPage(1); }}
            placeholder="Session ID"
            className="w-full min-w-[120px] rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 sm:w-32"
          />
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <option value="All">All statuses</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
          </select>
          <select value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <option value="All">All priorities</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
          <input
            type="text"
            value={emspFilter}
            onChange={(event) => { setEmspFilter(event.target.value); setPage(1); }}
            placeholder="eMSP"
            aria-label="Filter by eMSP"
            className="w-full min-w-[110px] rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-800 sm:w-28"
          />
          <input
            type="text"
            value={complaintTypeFilter}
            onChange={(event) => { setComplaintTypeFilter(event.target.value); setPage(1); }}
            placeholder="Complaint type"
            aria-label="Filter by complaint type"
            className="w-full min-w-[130px] rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-800 sm:w-36"
          />
          <input
            type="date"
            value={fromDateFilter}
            onChange={(event) => { setFromDateFilter(event.target.value); setPage(1); }}
            aria-label="From date"
            title="From date"
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
          />
          <input
            type="date"
            value={toDateFilter}
            min={fromDateFilter || undefined}
            onChange={(event) => { setToDateFilter(event.target.value); setPage(1); }}
            aria-label="To date"
            title="To date"
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
          />
          <button type="button" onClick={resetFilters} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => {
            const header = ['Complaint ID', 'eMSP', 'Charger Name', 'Station Name', 'Complaint Type', 'Sub Type', 'Priority', 'TAT', 'Raised At', 'Status'];
            const rows = filteredComplaints.map((item) => [
              getComplaintId(item), item.emsp, item.chargerName, item.stationName, item.complaintType,
              item.subType, item.priority, item.tat, item.raisedAt, item.status,
            ]);
            const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'complaints.csv';
            link.click();
            URL.revokeObjectURL(url);
          }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"><Upload className="h-3.5 w-3.5 rotate-180 text-slate-500" />Export CSV</button>
          <button type="button" onClick={() => { setComplaintIdSearch(''); setSessionIdSearch(''); setPage(1); }} title="Clear search" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><LayoutGrid className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-[#FAFAFA] text-[11px] font-bold text-slate-700">
              <tr>
                <th className="whitespace-nowrap px-4 py-3.5">ID</th>
                <th className="whitespace-nowrap px-4 py-3.5">eMSP</th>
                <th className="whitespace-nowrap px-4 py-3.5">Charger Name</th>
                <th className="whitespace-nowrap px-4 py-3.5">Station Name</th>
                <th className="whitespace-nowrap px-4 py-3.5">Complaint Type</th>
                <th className="whitespace-nowrap px-4 py-3.5">Sub Type</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">Priority</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">TAT</th>
                <th className="whitespace-nowrap px-4 py-3.5">Raised At</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && <tr><td colSpan={10} className="py-10 text-center text-slate-500">Loading complaints...</td></tr>}
              {!loading && error && <tr><td colSpan={10} className="py-10 text-center text-rose-600">{error}<button type="button" onClick={fetchComplaints} className="ml-2 underline">Retry</button></td></tr>}
              {!loading && !error && filteredComplaints.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-slate-500">No complaints found.</td></tr>}
              {!loading && !error && filteredComplaints.map((item) => (
                <tr key={item.id} onClick={() => openTicketDetails(item)} className="cursor-pointer transition-colors hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A]">{getComplaintId(item)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.emsp || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-slate-600">{item.chargerName || item.ChrgerName || '—'}</td>
                  <td className="max-w-[180px] truncate px-4 py-3.5 text-slate-700">{item.stationName || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.complaintType || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{item.subType || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-center"><span className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${item.priority === 'High' ? 'bg-rose-100 text-rose-700' : item.priority === 'Low' ? 'bg-slate-100 text-slate-600' : 'bg-[#FEF3C7] text-[#D97706]'}`}>{item.priority || '—'}</span></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-center font-medium text-slate-600">{item.tat || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3.5"><span className="block text-[11px] font-bold text-slate-800">{formatDate(item.raisedAt)}</span><span className="block text-[10px] text-slate-400">{formatTime(item.raisedAt)}</span></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-center"><span className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${item.status === 'Resolved' ? 'bg-[#ECFDF5] text-[#059669]' : item.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'}`}>{item.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500 sm:flex-row">
          <span>
            Showing <strong className="text-slate-800">{pagination.total ? ((page - 1) * pageSize) + 1 : 0} - {Math.min(page * pageSize, pagination.total)}</strong>
            {' '}of <strong className="text-slate-800">{pagination.total} items</strong>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="complaints-page-size">Rows per page</label>
            <select
              id="complaints-page-size"
              value={pageSize}
              onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="min-w-20 text-center">Page {page} of {Math.max(1, pagination.totalPages)}</span>
            <button
              type="button"
              disabled={loading || page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTicket(null); }}>
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 p-4 text-white">
              <div><span className="font-mono text-xs font-bold text-amber-400">{getComplaintId(selectedTicket)}</span><h3 className="mt-0.5 text-sm font-bold">{selectedTicket.stationName || 'Complaint details'}</h3></div>
              <button type="button" onClick={() => setSelectedTicket(null)} className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 overflow-y-auto p-4 text-xs">
              {detailsLoading && <p className="text-slate-500">Loading complaint details...</p>}
              {detailsError && <p className="rounded-lg bg-amber-50 p-2 text-amber-800">{detailsError}</p>}
              {selectedTicket._localOnly && <p className="rounded-lg bg-amber-50 p-2 text-amber-800">This is a frontend-only draft; it is not saved in the backend.</p>}
              <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-slate-400" />Customer: <strong>{getCustomerName(selectedTicket)}</strong></p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" />Phone: <strong>{getCustomerPhone(selectedTicket)}</strong></p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" />Email: <strong>{getCustomerEmail(selectedTicket)}</strong></p>
                <p className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-slate-400" />Type: <strong>{selectedTicket.complaintType || '—'} - {selectedTicket.subType || '—'}</strong></p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" />Charger: <strong className="font-mono">{selectedTicket.chargerName || selectedTicket.ChrgerName || '—'}</strong></p>
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-400" />Session ID: <strong>{selectedTicket.sessionId ?? '—'}</strong></p>
                <p>Status: <strong className={selectedTicket.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-700'}>{selectedTicket.status || '—'}</strong></p>
                <p>Priority: <strong>{selectedTicket.priority || '—'}</strong></p>
                <p>Vehicle: <strong>{selectedTicket.vehicle || '—'}</strong></p>
                <p>Raised: <strong>{formatDate(selectedTicket.raisedAt)} {formatTime(selectedTicket.raisedAt)}</strong></p>
                <p>Resolved: <strong>{formatDate(selectedTicket.resolvedAt)}</strong></p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Activity Log & Responses</h4>
                {selectedTicket.notes?.length ? selectedTicket.notes.map((note, index) => (
                  <div key={`${note.time || 'note'}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex justify-between gap-2 text-[10px] text-slate-400"><span>{note.sender || note.author || 'System'}</span><span>{note.time || note.createdAt || ''}</span></div>
                    <p className="mt-1 text-slate-700">{note.text || note.message || ''}</p>
                  </div>
                )) : <p className="text-slate-500">No activity notes are available for this complaint.</p>}
              </div>
              <form onSubmit={handleAddNote} className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <input type="text" value={newResponseText} onChange={(event) => setNewResponseText(event.target.value)} placeholder="Add a local note..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800" />
                <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-[#C05621] px-3.5 py-2 font-bold text-white"><Send className="h-3.5 w-3.5" />Add</button>
              </form>
              <p className="text-[10px] text-slate-400">Notes are kept in this page only because no backend note-save endpoint was provided.</p>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateModalOpen(false); }}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 p-4 text-white"><h3 className="text-xs font-bold">Add New Complaint (Local Draft)</h3><button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 p-4 text-xs">
              <p className="rounded-lg bg-amber-50 p-2 text-amber-800">The current backend code does not expose a complaint-create endpoint. Saving here creates a temporary frontend-only draft.</p>
              <div><label className="mb-1 block font-semibold">eMSP</label><input value={newTicketForm.emsp} onChange={(event) => setNewTicketForm({ ...newTicketForm, emsp: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></div>
              <div><label className="mb-1 block font-semibold">Charger Name</label><input value={newTicketForm.chargerName} onChange={(event) => setNewTicketForm({ ...newTicketForm, chargerName: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></div>
              <div><label className="mb-1 block font-semibold">Station Name *</label><input required value={newTicketForm.stationName} onChange={(event) => setNewTicketForm({ ...newTicketForm, stationName: event.target.value })} placeholder="Ecoplug Resort Hub" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></div>
              <div><label className="mb-1 block font-semibold">Customer Name *</label><input required value={newTicketForm.user} onChange={(event) => setNewTicketForm({ ...newTicketForm, user: event.target.value })} placeholder="Ramesh Kumar" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block font-semibold">Complaint Type</label><select value={newTicketForm.complaintType} onChange={(event) => setNewTicketForm({ ...newTicketForm, complaintType: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white p-2"><option>Charging Session</option><option>Charger Hardware</option><option>Payment</option><option>Mobile App</option><option>Other</option></select></div>
                <div><label className="mb-1 block font-semibold">Sub Type</label><input value={newTicketForm.subType} onChange={(event) => setNewTicketForm({ ...newTicketForm, subType: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2" /></div>
              </div>
              <div><label className="mb-1 block font-semibold">Priority</label><select value={newTicketForm.priority} onChange={(event) => setNewTicketForm({ ...newTicketForm, priority: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white p-2"><option>Low</option><option>Medium</option><option>High</option></select></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 font-bold text-slate-500">Cancel</button><button type="submit" className="rounded-xl bg-[#C05621] px-4 py-1.5 font-bold text-white">Add Local Draft</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;