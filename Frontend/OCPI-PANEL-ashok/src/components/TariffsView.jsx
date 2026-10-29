import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { apiRequest } from "../services/api";

const INITIAL_FILTERS = {
  validityWindow: "",
  minRate: "",
  maxRate: "",
};

const selectClass =
  "w-full appearance-none px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40";
const inputClass =
  "w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TariffsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...INITIAL_FILTERS });

  const [tariffPlans, setTariffPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    let cancelled = false;

    const fetchTariffs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        if (selectedStatus) params.set("status", selectedStatus);
        if (appliedFilters.validityWindow) {
          params.set("validityWindow", appliedFilters.validityWindow);
        }
        if (appliedFilters.minRate !== "") {
          params.set("minRate", appliedFilters.minRate);
        }
        if (appliedFilters.maxRate !== "") {
          params.set("maxRate", appliedFilters.maxRate);
        }
        if (createdFrom) params.set("createdFrom", createdFrom);
        if (createdTo) params.set("createdTo", createdTo);

        const query = params.toString();
        const response = await apiRequest(
          `/api/tariffs${query ? `?${query}` : ""}`,
        );

        if (!cancelled) {
          setTariffPlans(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setTariffPlans([]);
          setError(err.message || "Failed to load tariffs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTariffs();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, selectedStatus, appliedFilters, createdFrom, createdTo]);

  const totalItems = tariffPlans.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedTariffs = useMemo(
    () => tariffPlans.slice(startIndex, endIndex),
    [tariffPlans, startIndex, endIndex],
  );

  const applyDateRange = (days) => {
    if (!days) {
      setCreatedFrom("");
      setCreatedTo("");
      setCurrentPage(1);
      return;
    }

    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - (days - 1));
    setCreatedFrom(formatDate(fromDate));
    setCreatedTo(formatDate(today));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setCreatedFrom("");
    setCreatedTo("");
    setFilters({ ...INITIAL_FILTERS });
    setAppliedFilters({ ...INITIAL_FILTERS });
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!tariffPlans.length) {
      window.alert("No tariffs available to export");
      return;
    }

    const headers = [
      "Tariff ID",
      "Validity Window",
      "Base Rate",
      "Created At",
      "Status",
    ];
    const rows = tariffPlans.map((item) => [
      item.tariffId,
      item.validityWindow,
      item.baseRate,
      item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : "",
      item.status,
    ]);
    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");
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

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tariffs
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {totalItems.toLocaleString()} tariff plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            defaultValue=""
            onChange={(event) => applyDateRange(event.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <option value="">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tariff ID or validity window..."
              className="min-w-[220px] flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
            />

            <div className="relative min-w-[150px]">
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className={selectClass}
              >
                <option value="">All statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((previous) => !previous)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              More Filters
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetFilters}
              disabled={
                !searchTerm &&
                !selectedStatus &&
                !createdFrom &&
                !createdTo &&
                !Object.values(appliedFilters).some(Boolean)
              }
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700"
            >
              <Upload className="w-3.5 h-3.5 rotate-180" />
              Export
            </button>
            <button
              type="button"
              aria-label="Table view"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Validity window
                </label>
                <div className="relative">
                  <select
                    value={filters.validityWindow}
                    onChange={(event) =>
                      setFilters((previous) => ({
                        ...previous,
                        validityWindow: event.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    <option value="">All windows</option>
                    <option value="Peak">Peak</option>
                    <option value="Off-Peak">Off-Peak</option>
                    <option value="Late Night">Late Night</option>
                    <option value="24x7 Fleet Access">24x7 Fleet Access</option>
                    <option value="24x7 High Output">24x7 High Output</option>
                    <option value="DC Ultra Fast">DC Ultra Fast</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Minimum rate (₹/kWh)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minRate}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      minRate: event.target.value,
                    }))
                  }
                  placeholder="Minimum rate"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Maximum rate (₹/kWh)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxRate}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      maxRate: event.target.value,
                    }))
                  }
                  placeholder="Maximum rate"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Created from
                </label>
                <input
                  type="date"
                  value={createdFrom}
                  max={createdTo || undefined}
                  onChange={(event) => {
                    setCreatedFrom(event.target.value);
                    setCurrentPage(1);
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Created to
                </label>
                <input
                  type="date"
                  value={createdTo}
                  min={createdFrom || undefined}
                  onChange={(event) => {
                    setCreatedTo(event.target.value);
                    setCurrentPage(1);
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ ...filters });
                  setCurrentPage(1);
                  setFiltersOpen(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              {Array.from({ length: 5 }).map((_, index) => (
                <col key={index} style={{ width: "20%" }} />
              ))}
            </colgroup>
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Tariff ID</th>
                <th className="py-3.5 px-4">Validity Window</th>
                <th className="py-3.5 px-4 text-center">Base Rate</th>
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Loading tariffs...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && paginatedTariffs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No tariffs found for the selected filters.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                paginatedTariffs.map((item) => (
                  <tr
                    key={item.tariffId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C05621]">
                      {item.tariffId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.validityWindow || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                      {item.baseRate != null
                        ? `₹ ${Number(item.baseRate).toFixed(2)} / kWh`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-GB")
                          : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString("en-GB")
                          : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status?.toUpperCase() === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status
                          ? item.status.charAt(0) +
                            item.status.slice(1).toLowerCase()
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            Showing{" "}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}
            </strong>{" "}
            of <strong className="text-slate-800">{totalItems} items</strong>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40"
            >
              «
            </button>
            <button
              onClick={() =>
                setCurrentPage((previous) => Math.max(1, previous - 1))
              }
              disabled={currentPage === 1 || totalPages === 0}
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40"
            >
              ‹
            </button>
            <span>
              Page{" "}
              <strong className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200">
                {totalPages ? currentPage : 0}
              </strong>{" "}
              of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((previous) => Math.min(totalPages, previous + 1))
              }
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40"
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
