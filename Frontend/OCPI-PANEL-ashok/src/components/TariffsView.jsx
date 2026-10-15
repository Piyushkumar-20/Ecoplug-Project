
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';
import { apiRequest } from '../services/api';

const TariffsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    validityWindow: '',
    dateRange: '30',
    minRate: '',
    maxRate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    validityWindow: '',
    dateRange: '30',
    minRate: '',
    maxRate: '',
  });
  const [tariffPlans, setTariffPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();

        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        }

        if (appliedFilters.status) {
          params.set('status', appliedFilters.status);
        }

        if (appliedFilters.validityWindow) {
          params.set('validityWindow', appliedFilters.validityWindow);
        }

        if (appliedFilters.minRate !== '') {
          params.set('minRate', appliedFilters.minRate);
        }

        if (appliedFilters.maxRate !== '') {
          params.set('maxRate', appliedFilters.maxRate);
        }

        if (appliedFilters.dateRange) {
          const today = new Date();
          const fromDate = new Date();

          fromDate.setDate(
            fromDate.getDate() - Number(appliedFilters.dateRange)
          );

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  params.set('createdFrom', formatDate(fromDate));
  params.set('createdTo', formatDate(today));
}

const query = params.toString();

const response = await apiRequest(
  `/api/tariffs${query ? `?${query}` : ''}`
);
        setTariffPlans(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(err.message || 'Failed to load tariffs');
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [appliedFilters, searchTerm]);


    
const filteredTariffs = tariffPlans.filter((plan) => {
  const tariffId = String(plan.tariffId || '');
  const validityWindow = String(plan.validityWindow || '');

  const matchesSearch =
    tariffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validityWindow.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesSearch;
});

const totalItems = filteredTariffs.length;
const totalPages = Math.ceil(totalItems / rowsPerPage);

const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

const paginatedTariffs = filteredTariffs.slice(
  startIndex,
  endIndex
);

const handleExport = () => {
  const headers = [
    "Tariff ID",
    "Validity Window",
    "Base Rate",
    "Created At",
    "Status",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = filteredTariffs.map((item) => [
    item.tariffId,
    item.validityWindow,
    item.baseRate,
    item.createdAt
      ? new Date(item.createdAt).toLocaleString("en-GB")
      : "",
    item.status,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "tariffs.csv";
  link.click();

  URL.revokeObjectURL(url);
};

const pageSizeOptions = [25, 50, 100].filter(
  (size) => size < totalItems
);

if (totalItems > 0 && !pageSizeOptions.includes(totalItems)) {
  pageSizeOptions.push(totalItems);
}
if (loading) {
  return <div className="p-6 text-sm text-slate-500">Loading tariffs...</div>;
}

if (error) {
  return <div className="p-6 text-sm text-red-600">{error}</div>;
}

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tariffs</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {filteredTariffs.length} tariff plans
          </p>
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
              placeholder="Tariff ID / Validity Window"
              className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>More Filters</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-slate-500 rotate-180" />
            <span>Export</span>
          </button>

          <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              value={filters.validityWindow}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  validityWindow: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700"
            >
              <option value="">All Windows</option>
              <option value="Peak">Peak</option>
              <option value="Off-Peak">Off-Peak</option>
              <option value="Late Night">Late Night</option>
              <option value="24x7 Fleet Access">24x7 Fleet Access</option>
              <option value="24x7 High Output">24x7 High Output</option>
              <option value="DC Ultra Fast">DC Ultra Fast</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700"
            >
              <option value="">All Dates</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                value={filters.minRate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minRate: e.target.value }))
                }
                placeholder="Min Rate (₹)"
                className="min-w-0 w-full px-3 py-3 border border-slate-200 rounded-xl text-sm"
              />
              <input
                type="number"
                min="0"
                value={filters.maxRate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxRate: e.target.value }))
                }
                placeholder="Max Rate (₹)"
                className="min-w-0 w-full px-3 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFilters({
                  status: "",
                  validityWindow: "",
                  dateRange: "",
                  minRate: "",
                  maxRate: "",
                });
                setAppliedFilters({
                  status: "",
                  validityWindow: "",
                  dateRange: "",
                  minRate: "",
                  maxRate: "",
                });
                setSearchTerm("");
                setCurrentPage(1);
              }}
              
              className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => {
                setAppliedFilters({ ...filters });
                setCurrentPage(1);
                setShowFilters(false);
              }}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              {Array.from({ length: 5 }).map((_, index) => (
                <col key={index} style={{ width: "20%" }} />
              ))}
            </colgroup>
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className=" py-3 px-4">Tariff ID</th>
                <th className=" py-3 px-4">Validity Window</th>
                <th className=" py-3 px-4 text-center">Base Rate</th>
                <th className=" py-3 px-4">Created At</th>
                <th className=" py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedTariffs.map((item) => (
                <tr key={item.tariffId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.tariffId}
                  </td>
                 
                  
                  <td className="py-3 px-4 text-slate-600">{item.validityWindow || '—'}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-slate-900">{item.baseRate != null? `₹ ${Number(item.baseRate).toFixed(2)} / kWh`: '—'}</td>
                  
                  
                  <td className="py-3 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-GB')
                          : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString('en-GB')
                          : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status?.toUpperCase() === 'ACTIVE' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}>
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
              {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
            </select>

              
          </div>

          <div>            
            Showing{' '}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}
            </strong>{' '}
            of <strong className="text-slate-800">{totalItems} items</strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span>
              Page{' '}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                {totalPages === 0 ? 0 : currentPage}
              </span>{' '}
              of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffsView;
