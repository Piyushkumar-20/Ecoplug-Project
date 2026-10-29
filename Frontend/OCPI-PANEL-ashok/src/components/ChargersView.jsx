import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { apiRequest } from "../services/api";

const INITIAL_FILTERS = {
  status: "",
  connectorType: "",
  locationId: "",
  minOutput: "",
  maxOutput: "",
  lastActiveDays: "",
};

const selectClass =
  "w-full appearance-none px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40";
const inputClass =
  "w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white";

const ChargersView = () => {
  const [searchId, setSearchId] = useState("");
  const [selectedCpo, setSelectedCpo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...INITIAL_FILTERS });

  const [chargers, setChargers] = useState([]);
  const [emspOptions, setEmspOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load the unfiltered company charger list once to populate all eMSP options.
  useEffect(() => {
    let cancelled = false;

    const loadEmspOptions = async () => {
      try {
        const response = await apiRequest("/api/chargers");
        if (cancelled) return;

        const names = (Array.isArray(response.data) ? response.data : [])
          .map((item) => String(item.emsp || "").trim())
          .filter(Boolean);

        setEmspOptions([...new Set(names)].sort((a, b) => a.localeCompare(b)));
      } catch {
        // The main charger request still reports any API failure.
      }
    };

    loadEmspOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchChargers = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (searchId.trim()) params.set("search", searchId.trim());
        if (selectedCpo) params.set("emsp", selectedCpo);
        if (appliedFilters.status) params.set("status", appliedFilters.status);
        if (appliedFilters.connectorType) {
          params.set("connectorType", appliedFilters.connectorType);
        }
        if (appliedFilters.locationId.trim()) {
          params.set("locationId", appliedFilters.locationId.trim());
        }
        if (appliedFilters.minOutput !== "") {
          params.set("minOutput", appliedFilters.minOutput);
        }
        if (appliedFilters.maxOutput !== "") {
          params.set("maxOutput", appliedFilters.maxOutput);
        }
        if (appliedFilters.lastActiveDays) {
          params.set("lastActiveDays", appliedFilters.lastActiveDays);
        }

        const query = params.toString();
        const response = await apiRequest(
          `/api/chargers${query ? `?${query}` : ""}`,
        );

        if (cancelled) return;
        setChargers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (!cancelled) {
          setChargers([]);
          setError(err.message || "Failed to load chargers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChargers();
    return () => {
      cancelled = true;
    };
  }, [searchId, selectedCpo, appliedFilters]);

  const totalItems = chargers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedChargers = useMemo(
    () => chargers.slice(startIndex, endIndex),
    [chargers, startIndex, endIndex],
  );

  const resetFilters = () => {
    setSearchId("");
    setSelectedCpo("");
    setFilters({ ...INITIAL_FILTERS });
    setAppliedFilters({ ...INITIAL_FILTERS });
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!chargers.length) {
      window.alert("No chargers available to export");
      return;
    }

    const headers = [
      "Charger ID",
      "eMSP",
      "Hardware Model",
      "Location",
      "Connector Type",
      "Max Output (kW)",
      "Last Active",
      "Status",
    ];

    const rows = chargers.map((item) => [
      item.displayChargerId || item.chargerId,
      item.emsp,
      item.hardwareModel,
      item.locationName,
      item.displayConnectorType || item.connectorType,
      item.maxOutputKW,
      item.lastActive,
      item.displayStatus || item.status,
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
    link.download = "chargers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chargers
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {totalItems.toLocaleString()} chargers
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <input
              type="search"
              value={searchId}
              onChange={(event) => {
                setSearchId(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search charger, station or model..."
              className="min-w-[220px] flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
            />

            <div className="relative min-w-[180px]">
              <select
                value={selectedCpo}
                onChange={(event) => {
                  setSelectedCpo(event.target.value);
                  setCurrentPage(1);
                }}
                className={selectClass}
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
                value={appliedFilters.status}
                onChange={(event) => {
                  const status = event.target.value;
                  setFilters((previous) => ({ ...previous, status }));
                  setAppliedFilters((previous) => ({ ...previous, status }));
                  setCurrentPage(1);
                }}
                className={selectClass}
              >
                <option value="">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="CHARGING">Charging</option>
                <option value="PREPARING">Preparing</option>
                <option value="FINISHING">Finishing</option>
                <option value="SUSPENDED_EV">Suspended (EV)</option>
                <option value="SUSPENDED_EVSE">Suspended (EVSE)</option>
                <option value="RESERVED">Reserved</option>
                <option value="FAULTED">Faulted</option>
                <option value="INOPERATIVE">Offline</option>
                <option value="UNKNOWN">Unknown</option>
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
                !searchId &&
                !selectedCpo &&
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Connector type
                </label>
                <div className="relative">
                  <select
                    value={filters.connectorType}
                    onChange={(event) =>
                      setFilters((previous) => ({
                        ...previous,
                        connectorType: event.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    <option value="">All connector types</option>
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Location ID or name
                </label>
                <input
                  value={filters.locationId}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      locationId: event.target.value,
                    }))
                  }
                  placeholder="Enter location ID or name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Last active within
                </label>
                <div className="relative">
                  <select
                    value={filters.lastActiveDays}
                    onChange={(event) =>
                      setFilters((previous) => ({
                        ...previous,
                        lastActiveDays: event.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    <option value="">Any time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Minimum output (kW)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minOutput}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      minOutput: event.target.value,
                    }))
                  }
                  placeholder="Minimum kW"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Maximum output (kW)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxOutput}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      maxOutput: event.target.value,
                    }))
                  }
                  placeholder="Maximum kW"
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
              {loading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Loading chargers...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && paginatedChargers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No chargers found for the selected filters.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                paginatedChargers.map((item) => (
                  <tr
                    key={item.id || item.chargerId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C05621]">
                      {item.displayChargerId || item.chargerId || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.emsp || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.hardwareModel || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                      {item.locationName || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.displayConnectorType || item.connectorType || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.maxOutputKW != null
                        ? `${item.maxOutputKW} kW`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {item.lastActive
                          ? new Date(item.lastActive).toLocaleDateString(
                              "en-GB",
                            )
                          : "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.lastActive
                          ? new Date(item.lastActive).toLocaleTimeString(
                              "en-GB",
                            )
                          : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          ["AVAILABLE"].includes(
                            String(item.status).toUpperCase(),
                          )
                            ? "bg-emerald-50 text-emerald-700"
                            : ["CHARGING", "PREPARING", "FINISHING"].includes(
                                  String(item.status).toUpperCase(),
                                )
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.displayStatus || item.status || "Unknown"}
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

export default ChargersView;
