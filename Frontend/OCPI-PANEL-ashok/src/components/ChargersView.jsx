import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';
import { useEffect } from 'react';
import { apiRequest } from '../services/api';

const ChargersView = () => {
  const [searchId, setSearchId] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');
  
  const [showFilters, setShowFilters] = useState(false);

  const initialFilters = {
    status: '',
    connectorType: '',
    locationId: '',
    minOutput: '',
    maxOutput: '',
    lastActiveDays: '',
  };

const [filters, setFilters] = useState({ ...initialFilters });
const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters });

  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  useEffect(() => {
    const fetchChargers = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();

        if (filters.search?.trim()) {
          params.set('search', filters.search.trim());
        }

        if (appliedFilters.status) {
          params.set('status', appliedFilters.status);
        }

        if (appliedFilters.connectorType) {
          params.set('connectorType', appliedFilters.connectorType);
        }

        if (appliedFilters.locationId) {
          params.set('locationId', appliedFilters.locationId);
        }

        if (appliedFilters.minOutput !== '') {
          params.set('minOutput', appliedFilters.minOutput);
        }

        if (appliedFilters.maxOutput !== '') {
          params.set('maxOutput', appliedFilters.maxOutput);
        }

        if (appliedFilters.lastActiveDays) {
          params.set('lastActiveDays', appliedFilters.lastActiveDays);
        }

        const query = params.toString();
        const response = await apiRequest(
          `/api/chargers${query ? `?${query}` : ''}`
        );


        setChargers(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(err.message || 'Failed to load chargers');
      } finally {
        setLoading(false);
      }
    };

    fetchChargers();
  }, [appliedFilters]);
  
const filteredChargers = chargers.filter((c) => {
  const chargerId = String(c.chargerId || '');
  const hardwareModel = String(c.hardwareModel || '');
  const locationName = String(c.locationName || '');
  const emsp = String(c.emsp || '');

  const matchesId =
    chargerId.toLowerCase().includes(searchId.toLowerCase()) ||
    hardwareModel.toLowerCase().includes(searchId.toLowerCase()) ||
    locationName.toLowerCase().includes(searchId.toLowerCase());

  const matchesCpo = selectedCpo === '' || emsp === selectedCpo;

  return matchesId && matchesCpo;
});

const totalItems = filteredChargers.length;
const totalPages = Math.ceil(totalItems / rowsPerPage);

const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

const paginatedChargers = filteredChargers.slice(
  startIndex,
  endIndex
);
const handleExport = () => {
  if (filteredChargers.length === 0) {
    alert('No chargers available to export');
    return;
  }

  const headers = [
    'Charger ID',
    'eMSP',
    'Hardware Model',
    'Location',
    'Connector Type',
    'Max Output (kW)',
    'Last Active',
    'Status',
  ];

  const rows = filteredChargers.map((item) => [
    item.chargerId,
    item.emsp,
    item.hardwareModel,
    item.locationName,
    item.connectorType,
    item.maxOutputKW,
    item.lastActive,
    item.status,
  ]);

  const escapeCSV = (value) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`;

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'chargers.csv';
  link.click();

  URL.revokeObjectURL(url);
};
  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chargers</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">148 chargers</p>
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
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Charger ID / Name"
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
                {[...new Set(chargers.map((c) => c.emsp).filter(Boolean))].map((emsp) => (
                  <option key={emsp} value={emsp}>
                    {emsp}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 rotate-180" />
            <span>Export</span>
          </button>

          <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* More Filters Panel */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="CHARGING">Charging</option>
                <option value="INOPERATIVE">Inoperative</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Connector Type
              </label>
              <select
                value={filters.connectorType}
                onChange={(e) =>
                  setFilters({ ...filters, connectorType: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">All Connector Types</option>
                <option value="CCS2">CCS2</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Location ID
              </label>
              <input
                type="text"
                value={filters.locationId}
                onChange={(e) =>
                  setFilters({ ...filters, locationId: e.target.value })
                }
                placeholder="Enter location ID"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Minimum Output (kW)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minOutput}
                onChange={(e) =>
                  setFilters({ ...filters, minOutput: e.target.value })
                }
                placeholder="Minimum kW"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Maximum Output (kW)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxOutput}
                onChange={(e) =>
                  setFilters({ ...filters, maxOutput: e.target.value })
                }
                placeholder="Maximum kW"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Last Active
              </label>
              <select
                value={filters.lastActiveDays}
                onChange={(e) =>
                  setFilters({ ...filters, lastActiveDays: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">Any Time</option>
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={() => {
                setFilters({ ...initialFilters });
                setAppliedFilters({ ...initialFilters });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Charger ID</th>
                <th className="py-3.5 px-4">eMSP</th>
                <th className="py-3.5 px-4">Hardware Model</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Connector Type</th>
                <th className="py-3.5 px-4 text-center">Max Output</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedChargers.map((item) => (
                <tr key={item.displayChargerId || item.chargerId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.displayChargerId || item.chargerId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.emsp}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.hardwareModel}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">{item.locationName}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{item.displayConnectorType || item.connectorType}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.maxOutputKW}kW</td>

                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">
                        {item.lastActive
                          ? new Date(item.lastActive).toLocaleDateString('en-GB')
                          : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.lastActive
                          ? new Date(item.lastActive).toLocaleTimeString('en-GB')
                          : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${item.status === 'Charging' ? 'bg-cyan-100 text-cyan-800' :
                      item.status === 'Available' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {item.status}
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
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={250}>250</option>
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
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              «
            </button>

            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <span>
              Page{' '}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                {currentPage}
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

export default ChargersView;
