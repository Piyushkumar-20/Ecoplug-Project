import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { apiRequest } from "../services/api";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const SessionsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCpo, setSelectedCpo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sessions, setSessions] = useState([]);
  const [emspOptions, setEmspOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // Fetch sessions whenever the search, filters or page changes.
  useEffect(() => {
    let cancelled = false;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(rowsPerPage),
        });

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        if (selectedCpo) {
          params.set("emsp", selectedCpo);
        }

        if (selectedStatus) {
          params.set("status", selectedStatus);
        }

        if (startDate) {
          params.set("startDate", startDate);
        }

        if (endDate) {
          params.set("endDate", endDate);
        }

        const response = await apiRequest(`/api/sessions?${params.toString()}`);

        if (cancelled) return;

        setSessions(Array.isArray(response.data) ? response.data : []);

        setEmspOptions(
          Array.isArray(response.filters?.emspOptions)
            ? response.filters.emspOptions
            : [],
        );

        setPagination(
          response.pagination || {
            page: currentPage,
            limit: rowsPerPage,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (err) {
        if (!cancelled) {
          setSessions([]);
          setError(err.message || "Failed to load sessions");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSessions();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    selectedCpo,
    selectedStatus,
    startDate,
    endDate,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCpo("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const applyLast30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(today.getDate() - 29);

    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedCpo || selectedStatus || startDate || endDate,
  );

  const firstItem =
    pagination.total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

  const lastItem = Math.min(currentPage * rowsPerPage, pagination.total);

  return (
    <div className="space-y-5 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Charging Sessions
          </h1>

          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {pagination.total.toLocaleString()} sessions
          </p>
        </div>  
      </div>

      {/* Search and filters */}
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
              placeholder="Search session, driver, vehicle, station..."
              className="min-w-[220px] flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
            />

            <div className="relative min-w-[180px]">
              <select
                value={selectedCpo}
                onChange={(event) => {
                  setSelectedCpo(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="">All eMSPs</option>

                {emspOptions.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner}
                  </option>
                ))}
              </select>

              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative min-w-[150px]">
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="CHARGING">Charging</option>
                <option value="FAILED">Failed</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset filters
          </button>
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sessions-start-date"
              className="text-xs font-semibold text-slate-600"
            >
              Start date
            </label>

            <input
              id="sessions-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="sessions-end-date"
              className="text-xs font-semibold text-slate-600"
            >
              End date
            </label>

            <input
              id="sessions-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            />
          </div>

          <div className="text-xs text-slate-400 pb-2">
            Filters are applied automatically.
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
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
              {loading && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    Loading sessions...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && sessions.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No sessions found for the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                sessions.map((item) => {
                  const normalizedStatus = item.status?.toUpperCase();

                  const statusClass =
                    normalizedStatus === "CHARGING"
                      ? "bg-cyan-100 text-cyan-800"
                      : normalizedStatus === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : normalizedStatus === "ACTIVE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700";

                  return (
                    <tr
                      key={item.id ?? item.sessionId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C05621]">
                        {item.id != null
                          ? `SES-${item.id}`
                          : item.sessionId || "—"}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.driverName ||
                          item.driver_name ||
                          item.driver?.name ||
                          "Not linked"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {item.evVehicle ||
                          item.ev_vehicle ||
                          item.vehicleRegistration ||
                          item.vehicle_registration ||
                          item.vehicle?.registrationNumber ||
                          item.vehicleMac ||
                          item.vehicle_mac ||
                          "Not linked"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 truncate max-w-[180px]">
                        {item.stationName || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {item.emspPartner || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                        {item.energyKwh != null
                          ? `${Number(item.energyKwh).toFixed(2)} kWh`
                          : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-600">
                        {item.durationMinutes != null
                          ? `${item.durationMinutes} mins`
                          : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {item.billingAmount != null
                          ? `${item.currency === "INR" ? "₹" : item.currency || ""} ${Number(item.billingAmount).toFixed(2)}`
                          : "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-800 block">
                            {item.startedAt
                              ? new Date(item.startedAt).toLocaleDateString(
                                  "en-GB",
                                )
                              : "—"}
                          </span>

                          <span className="text-[10px] text-slate-400 block">
                            {item.startedAt
                              ? new Date(item.startedAt).toLocaleTimeString(
                                  "en-GB",
                                )
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${statusClass}`}
                        >
                          {item.status
                            ? item.status.charAt(0) +
                              item.status.slice(1).toLowerCase()
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              {firstItem} - {lastItem}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800">{pagination.total} items</strong>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={
                loading || currentPage === 1 || pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) => Math.max(1, previous - 1))
              }
              disabled={
                loading || currentPage === 1 || pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <span>
              Page{" "}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">
                {pagination.totalPages === 0 ? 0 : currentPage}
              </span>{" "}
              of {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(pagination.totalPages, previous + 1),
                )
              }
              disabled={
                loading ||
                currentPage >= pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={
                loading ||
                currentPage >= pagination.totalPages ||
                pagination.totalPages === 0
              }
              className="px-2 py-1 rounded-md hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
