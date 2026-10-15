import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';
import { apiRequest } from '../services/api';

const SessionsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(rowsPerPage),
          });

          if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
          }

          const response = await apiRequest(
            `/api/sessions?${params.toString()}`
          );

        setSessions(Array.isArray(response.data) ? response.data : []);
        setPagination(
          response.pagination || {
            page: currentPage,
            limit: rowsPerPage,
            total: 0,
            totalPages: 0,
          }
        );
        
      } catch (err) {
        setError(err.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
 }, [currentPage, rowsPerPage,searchTerm]);

  const filteredSessions = sessions.filter((ses) => {
  const matchesCpo =
    selectedCpo === '' || ses.emspPartner === selectedCpo;

      return matchesCpo;
    });
  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Charging Sessions</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">1,420 sessions</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Session ID / Driver"
              className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white transition-all"
            />
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={selectedCpo}
              onChange={(e) => setSelectedCpo(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white appearance-none pr-8 cursor-pointer"
            >
              <option value="">All eMSPs</option>
              <option value="Statiq Platform">Statiq Platform</option>
              <option value="Tata Power">Tata Power</option>
              <option value="Ather Grid">Ather Grid</option>
              <option value="Zeon Charging">Zeon Charging</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>More Filters</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-slate-500 rotate-180" />
            <span>Export CDR</span>
          </button>

          <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4">EV Vehicle</th>
                <th className="py-3.5 px-4">Station Name</th>
                <th className="py-3.5 px-4">eMSP Partner</th>
                <th className="py-3.5 px-4 text-center">Energy</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-right">Billing Amount</th>
                <th className="py-3.5 px-4">Started At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              
            {filteredSessions.map((item) => (
              <tr
                key={item.sessionId}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-[#C05621]">
                  {item.sessionId || '—'}
                </td>

                <td className="py-3.5 px-4 font-bold text-slate-900">—</td>

                <td className="py-3.5 px-4 text-slate-600">—</td>

                <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[180px]">
                  {item.stationName || '—'}
                </td>

                <td className="py-3.5 px-4 font-medium text-slate-700">
                  {item.emspPartner || '—'}
                </td>

                <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                  {item.energyKwh != null ? `${Number(item.energyKwh).toFixed(2)} kWh` : '—'}
                </td>

                <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                  {item.durationMinutes != null ? `${item.durationMinutes} mins` : '—'}
                </td>

                <td className="py-3.5 px-4 text-right font-black text-slate-900">
                  {item.billingAmount != null
                    ? `${item.currency === 'INR' ? '₹' : item.currency || ''} ${Number(item.billingAmount).toFixed(2)}`
                    : '—'}
                </td>

                <td className="py-3.5 px-4">
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-800 block">
                      {item.startedAt
                        ? new Date(item.startedAt).toLocaleDateString('en-GB')
                        : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.startedAt
                        ? new Date(item.startedAt).toLocaleTimeString('en-GB')
                        : ''}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status?.toUpperCase() === 'CHARGING'
                        ? 'bg-cyan-100 text-cyan-800'
                        : item.status?.toUpperCase() === 'COMPLETED'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.status
                      ? item.status.charAt(0) + item.status.slice(1).toLowerCase()
                      : '—'}
                  </span>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 cursor-pointer"
            >
              {[25, 50, 100]
                .filter((size) => size === 25 || size <= pagination.total + 1)
                .map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
            </select>
          </div>

          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {pagination.total === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
              {' - '}
              {Math.min(currentPage * rowsPerPage, pagination.total)}
            </strong>
            {' '}of{' '}
            <strong className="text-slate-800">
              {pagination.total} items
            </strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || pagination.totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>

            {/* Previous Page */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              disabled={currentPage === 1 || pagination.totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <span>
              Page{' '}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                {pagination.totalPages === 0 ? 0 : currentPage}
              </span>
              {' '}of {pagination.totalPages}
            </span>

            {/* Next Page */}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={
                currentPage >= pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={
                currentPage >= pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsView;
