import React, { useEffect, useState } from 'react';
import { Upload, LayoutGrid } from 'lucide-react';
import { apiRequest } from '../services/api';

const LocationsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reset pagination when search or rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  // Fetch locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiRequest('/api/locations');

        setLocations(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(err.message || 'Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Search locations by ID, name or city
  const filteredLocations = locations.filter((loc) => {
    const search = searchTerm.toLowerCase();

    return (
      String(loc.id ?? '').toLowerCase().includes(search) ||
      String(loc.name ?? '').toLowerCase().includes(search) ||
      String(loc.city ?? '').toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalItems = filteredLocations.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const paginatedLocations = filteredLocations.slice(
    startIndex,
    endIndex
  );
  const handleExport = () => {
  if (filteredLocations.length === 0) {
    alert('No locations available to export.');
    return;
  }

  const headers = [
    'Location ID',
    'Station Name',
    'City / Region',
    'Chargers',
    'Power Output (kW)',
    'Address',
    'Added Date',
    'Status',
  ];

  const escapeCsv = (value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = filteredLocations.map((loc) => [
    loc.id,
    loc.name,
    loc.city,
    loc.chargers,
    loc.powerOutputKW,
    loc.address,
    loc.addedDate
      ? new Date(loc.addedDate).toLocaleDateString('en-GB')
      : '',
    loc.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n');

  // BOM helps Excel display UTF-8 text correctly
  const blob = new Blob(['\uFEFF', csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'locations.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Filter & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Location ID / Name"
              className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 rotate-180" />
            <span>Export</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Location ID</th>
                <th className="py-3.5 px-4">Station Name</th>
                <th className="py-3.5 px-4">City / Region</th>
                <th className="py-3.5 px-4 text-center">Chargers</th>
                <th className="py-3.5 px-4 text-center">Max Power Output</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-slate-500"
                  >
                    Loading locations...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-rose-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalItems === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-slate-500"
                  >
                    No locations found.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                      {item.id}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {item.city}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.chargers} Chargers
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.powerOutputKW}kW
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[200px]">
                      {item.address}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          {item.addedDate
                            ? new Date(
                                item.addedDate
                              ).toLocaleDateString('en-GB')
                            : '-'}
                        </span>

                        <span className="text-[10px] text-slate-400 block">
                          {item.time || ''}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Online'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : item.status === 'Maintenance'
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : item.status === 'Partial'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.status || 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          {/* Rows Per Page */}
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
            </select>
          </div>

          {/* Items Count */}
          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-800">
              {totalItems} items
            </strong>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center space-x-2 font-semibold">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40"
            >
              «
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40"
            >
              ‹
            </button>

            <span>
              Page{' '}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                {totalItems === 0 ? 0 : currentPage}
              </span>{' '}
              of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={
                currentPage >= totalPages || totalPages === 0
              }
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40"
            >
              ›
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={
                currentPage >= totalPages || totalPages === 0
              }
              className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsView;