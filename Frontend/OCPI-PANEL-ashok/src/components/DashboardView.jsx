import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { apiRequest } from "../services/api";

import {
  Building,
  Zap,
  TrendingUp,
  IndianRupee,
  Leaf,
  ChevronRight,
  Maximize2,
} from "lucide-react";

const DashboardView = ( ) => {
  const [activeTab, setActiveTab] = useState("Sessions");

  const [hoveredBar, setHoveredBar] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  const [dashboardData, setDashboardData] = useState(null);

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState("");
  const [selectedChargerStatus, setSelectedChargerStatus] = useState(null);
  const [hoveredChargerStatus, setHoveredChargerStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const response = await apiRequest("/api/dashboard");

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message || "Unable to fetch dashboard data",
          );
        }

        if (isMounted) {
          setDashboardData(response.data);

          setDashboardError("");
        }
      } catch (error) {
        console.error("Dashboard API error:", error);

        if (isMounted) {
          setDashboardError(error.message || "Dashboard request failed");
        }
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    fetchDashboard();

    const intervalId = window.setInterval(fetchDashboard, 30000);

    return () => {
      isMounted = false;

      window.clearInterval(intervalId);
    };
  }, []);

  // Stats Data

  const summary = dashboardData?.summary ?? {};

  const revenueByCurrency = dashboardData?.revenueByCurrency ?? [];

  const sessionStatuses = dashboardData?.sessionStatus ?? [];

  const totalRevenue = revenueByCurrency

    .filter((item) => item.currency === "INR")

    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const failedSessions = sessionStatuses

    .filter((item) => item.status?.toUpperCase() === "FAILED")

    .reduce((total, item) => total + Number(item.count || 0), 0);

  const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

  const stats = [
    {
      title: "Total Revenue",

      value: `₹${totalRevenue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
      })}`,

      change: "Live",

      bg: "bg-rose-100/70",

      textColor: "text-rose-700",

      icon: IndianRupee,
    },

    {
      title: "Chargers",

      value: formatCount(summary.totalChargers),

      change: "Live",

      bg: "bg-emerald-100/70",

      textColor: "text-emerald-700",

      icon: Zap,
    },

    {
      title: "Charging Sessions",

      value: formatCount(summary.totalSessions),

      change: "Live",

      bg: "bg-purple-100/70",

      textColor: "text-purple-700",

      icon: TrendingUp,
    },

    {
      title: "Charging Stations",

      value: formatCount(summary.totalLocations),

      change: "Live",

      bg: "bg-sky-100/70",

      textColor: "text-sky-700",

      icon: Building,
    },

    {
      title: "Failed Session",

      value: formatCount(failedSessions),

      change: "Live",

      bg: "bg-teal-100/70",

      textColor: "text-teal-700",

      icon: Leaf,
    },
  ];

  // Charging Activity data from the dashboard API
  const dailyActivity = dashboardData?.dailyActivity ?? [];

  const chartData = React.useMemo(() => {
    const now = new Date();
    const start =
      selectedPeriod === "Last Month"
        ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);
    const end =
      selectedPeriod === "Last Month"
        ? new Date(now.getFullYear(), now.getMonth(), 0)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const valuesByDay = new Map(
      dailyActivity.map((item) => [String(item.day).slice(0, 10), item]),
    );
    const result = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;
      const item = valuesByDay.get(dateKey);
      let value = 0;

      if (activeTab === "Sessions") value = Number(item?.sessions ?? 0);
      else if (activeTab === "Energy (kWh)")
        value = Number(item?.energyKwh ?? 0);
      else value = Number(item?.revenue ?? 0);

      result.push({
        date: dateKey,
        label: `${date.getDate()} ${date.toLocaleString("en-IN", { month: "short" })}`,
        value,
      });
    }
    return result;
  }, [dailyActivity, activeTab, selectedPeriod]);

  const maxChartValue = Math.max(1, ...chartData.map((item) => item.value));
  const selectedChartItem = hoveredBar !== null ? chartData[hoveredBar] : null;
  const chartMetricLabel =
    activeTab === "Sessions"
      ? "Sessions"
      : activeTab === "Energy (kWh)"
        ? "kWh"
        : "₹";

  // Recent Sessions from the dashboard API
  const recentSessions = (dashboardData?.recentSessions ?? []).map((item) => {
    const status = String(item.status ?? "UNKNOWN").toUpperCase();
    const statusStyles = {
      COMPLETED: "bg-sky-100 text-sky-700",
      CHARGING: "bg-emerald-100 text-emerald-700",
      ACTIVE: "bg-emerald-100 text-emerald-700",
      FAILED: "bg-rose-100 text-rose-700",
      PENDING: "bg-amber-100 text-amber-700",
      UNKNOWN: "bg-slate-100 text-slate-600",
    };
    const startedAt = item.startedAt ? new Date(item.startedAt) : null;
    const validDate = startedAt && !Number.isNaN(startedAt.getTime());

    return {
      id: item.chargerId || item.sessionId || "Session",
      sessionId: item.sessionId,
      cpo:
        [item.stationName, item.city].filter(Boolean).join(" · ") ||
        "Station details unavailable",
      amount:
        item.billingAmount == null
          ? "—"
          : `${item.currency === "INR" ? "₹" : `${item.currency || ""} `}${Number(item.billingAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      time: validDate
        ? startedAt.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "—",
      status: status.charAt(0) + status.slice(1).toLowerCase(),
      badgeBg: statusStyles[status] || statusStyles.UNKNOWN,
      logoBg:
        status === "FAILED"
          ? "bg-rose-600 text-white"
          : status === "CHARGING" || status === "ACTIVE"
            ? "bg-emerald-600 text-white"
            : "bg-slate-900 text-white",
      energyKwh: item.energyKwh,
    };
  });

  const chargerStatusRows = dashboardData?.chargerStatus ?? [];
  const chargerStatusConfig = [
    {
      key: "AVAILABLE",
      label: "Available",
      color: "text-emerald-500",
      dot: "bg-emerald-500",
    },
    {
      key: "UNKNOWN",
      label: "Unknown",
      color: "text-slate-400",
      dot: "bg-slate-400",
    },
    {
      key: "INOPERATIVE",
      label: "Inoperative",
      color: "text-rose-500",
      dot: "bg-rose-500",
    },
  ];
  const chargerStatusData = chargerStatusConfig.map((config) => ({
    ...config,
    count: Number(
      chargerStatusRows.find(
        (row) => String(row.status).toUpperCase() === config.key,
      )?.count ?? 0,
    ),
  }));
  const totalChargersForStatus = chargerStatusData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  let statusOffset = 0;
  const chargerStatusSegments = chargerStatusData.map((item) => {
    const percentage = totalChargersForStatus
      ? (item.count / totalChargersForStatus) * 100
      : 0;
    const segment = { ...item, percentage, offset: statusOffset };
    statusOffset += percentage;
    return segment;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Metric Cards Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(180px,auto)] gap-4 items-stretch">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className={`${
                i === 0
                  ? "lg:col-span-2 lg:row-span-2 bg-[#211F26] text-white p-5 rounded-2xl border border-slate-800 shadow-md hover:-translate-y-1 hover:shadow-xl flex flex-col"
                  : "lg:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:-translate-y-1 hover:shadow-md"
              } transition-all duration-300`}
            >
              {/* Icon */}

              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl ${
                    i === 0
                      ? "bg-white/10 text-purple-300"
                      : `${stat.bg} ${stat.textColor}`
                  } flex items-center justify-center shadow-2xs`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Value + Title */}

              <div className="mt-3 flex-1 flex flex-col justify-center">
                <span
                  className={`${
                    i === 0
                      ? "text-3xl text-white"
                      : "text-xl sm:text-2xl text-slate-900"
                  } font-black tracking-tight block`}
                >
                  {dashboardLoading && !dashboardData
                    ? "Loading..."
                    : dashboardError && !dashboardData
                      ? "—"
                      : stat.value}
                </span>

                <span
                  className={`text-[11px] font-semibold ${
                    i === 0 ? "text-slate-300" : "text-slate-500"
                  } block truncate mt-0.5`}
                >
                  {stat.title}
                </span>
              </div>

              {/* Revenue Mini Chart - Only First Card */}

              {i === 0 && (
                <div className="mt-3 h-20 relative">
                  {/* Tooltip */}

                  <div className="absolute top-0 left-[40%] bg-white text-slate-900 px-2 py-1 rounded-md text-[9px] font-bold shadow-md z-10">
                    ↑ 28%
                  </div>

                  <svg
                    className="w-full h-full"
                    viewBox="0 0 300 80"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 65

                   C15 35, 25 50, 40 42

                   S65 60, 80 35

                   S105 20, 120 38

                   S145 55, 160 30

                   S185 42, 200 48

                   S225 35, 240 52

                   S270 45, 300 18"
                      fill="none"
                      stroke="#B56CFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Change */}

              <div
                className={`${
                  i === 0
                    ? "mt-2 pt-2 border-t border-white/10 text-purple-300"
                    : "mt-2.5 pt-2 border-t border-slate-100 text-emerald-600"
                } flex items-center space-x-1 text-[11px] font-bold`}
              >
                <TrendingUp className="w-3 h-3" />

                <span>{stat.change}</span>

                <span className="text-[10px] font-normal text-slate-400">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Dashboard Row: Activity Bar Chart + Donut Status + Recent Sessions */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Charging Activity Chart (8 cols on lg) */}

        <div className="lg:col-span-8 self-start h-fit bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Charging Activity
              </h3>

              <div className="flex items-center space-x-2">
                {/* Metric toggle */}

                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  {["Sessions", "Energy (kWh)", "Revenue (₹)"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        activeTab === tab
                          ? "bg-[#FEF0A6] text-slate-900 font-bold shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedPeriod}
                  onChange={(event) => {
                    setSelectedPeriod(event.target.value);
                    setHoveredBar(null);
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-hidden"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}

            <div className="relative pt-8 pb-2">
              {/* Highlighted Tooltip */}

              {selectedChartItem && (
                <div
                  className="absolute -top-1 transform -translate-x-1/2 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold shadow-lg z-10 transition-all pointer-events-none flex flex-col items-center"
                  style={{
                    left: `${chartData.length > 1 ? (hoveredBar / (chartData.length - 1)) * 90 + 5 : 50}%`,
                  }}
                >
                  <span className="font-bold text-amber-300">
                    {selectedChartItem.value.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {chartMetricLabel}
                  </span>
                  <span className="text-[9px] text-slate-300">
                    {selectedChartItem.label}
                  </span>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1"></div>
                </div>
              )}

              {/* Chart Grid background lines */}

              <div className="h-64 w-full flex items-end justify-between gap-1 sm:gap-1.5 pt-4 border-b border-slate-200/80 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full" />

                  <div className="border-b border-dashed border-slate-300 w-full" />

                  <div className="border-b border-dashed border-slate-300 w-full" />

                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                {chartData.map((item, idx) => {
                  const heightPercent = (item.value / maxChartValue) * 100;
                  const isSelected = idx === hoveredBar;
                  return (
                    <div
                      key={item.date}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                      onClick={() => setHoveredBar(idx)}
                      title={`${item.label}: ${item.value.toLocaleString("en-IN")}`}
                      className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end z-10"
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          isSelected
                            ? "bg-amber-400 shadow-md ring-2 ring-amber-300"
                            : "bg-amber-100 hover:bg-amber-300"
                        }`}
                        style={{
                          height: `${item.value > 0 ? Math.max(heightPercent, 1.5) : 0}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}

              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
                {chartData.length > 0 &&
                  Array.from(
                    new Set([
                      0,
                      Math.floor((chartData.length - 1) / 3),
                      Math.floor(((chartData.length - 1) * 2) / 3),
                      chartData.length - 1,
                    ]),
                  ).map((idx) => (
                    <span key={chartData[idx].date}>
                      {chartData[idx].label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Station Status Donut (4 cols on lg) */}

        <div className="lg:col-span-4 self-start h-fit bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Station Status</h3>

            <button className="text-slate-400 hover:text-slate-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 flex flex-col items-center">
            {/* Clickable and hoverable charger status donut */}
           <div className="relative w-48 h-48 flex items-center justify-center outline-none border-0 ring-0 focus:outline-none focus:ring-0">
              <svg
                className="w-full h-full transform -rotate-90 overflow-visible outline-none focus:outline-none"
                viewBox="0 0 36 36"
                role="img"
                aria-label="Charger status breakdown"
              >
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {chargerStatusSegments.map((segment) => {
                  const isSelected = selectedChargerStatus === segment.key;
                  const isHovered = hoveredChargerStatus === segment.key;
                  return (
                    <path
                      key={segment.key}
                      className={`${segment.color} stroke-current cursor-pointer transition-all duration-200`}
                      strokeWidth={isSelected || isHovered ? 5 : 4}
                      strokeDasharray={`${segment.percentage}, ${100 - segment.percentage}`}
                      strokeDashoffset={`${-segment.offset}`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      role="button"
                      
                      aria-label={`${segment.label}: ${segment.count} chargers`}
                      onClick={() =>
                        setSelectedChargerStatus(
                          selectedChargerStatus === segment.key ? null : segment.key,
                        )
                      }
                      onMouseEnter={() => setHoveredChargerStatus(segment.key)}
                      onMouseLeave={() => setHoveredChargerStatus(null)}
                     
                    >
                      <title>{`${segment.label}: ${formatCount(segment.count)} chargers`}</title>
                    </path>
                  );
                })}
              </svg>

              {/* Total remains visible in the centre at all times */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {formatCount(summary.totalChargers)}
                </span>
                <span className="mt-1 text-[11px] font-semibold text-slate-400">
                  Total Chargers
                </span>
              </div>
            </div>

            {/* Selected/hovered status detail is shown below the donut, never over the total */}
            {(() => {
              const activeStatusKey = hoveredChargerStatus || selectedChargerStatus;
              const activeStatus = chargerStatusData.find(
                (item) => item.key === activeStatusKey,
              );
              return activeStatus ? (
                <div className="mt-2 min-h-8 rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-center text-xs text-slate-700">
                  <span className={`inline-block w-2 h-2 rounded-full ${activeStatus.dot} mr-2`} />
                  <span className="font-semibold">{activeStatus.label}:</span>{" "}
                  <span className="font-bold">{formatCount(activeStatus.count)} chargers</span>
                  <button 
                    type="button"
                    className="ml-2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear selected charger status"
                    onClick={() => {
                      setSelectedChargerStatus(null);
                      setHoveredChargerStatus(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="mt-2 min-h-8 flex items-center text-center text-[11px] text-slate-400">
                  Hover or click a colour to view its count
                </div>
              );
            })()}
          </div>

          {/* Live charger status legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {chargerStatusData.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() =>
                  setSelectedChargerStatus(
                    selectedChargerStatus === item.key ? null : item.key,
                  )
                }
                onMouseEnter={() => setHoveredChargerStatus(item.key)}
                onMouseLeave={() => setHoveredChargerStatus(null)}
                className={`flex items-center space-x-1.5 text-left rounded-md px-1.5 py-1 transition-colors cursor-pointer ${
                  selectedChargerStatus === item.key
                    ? "bg-slate-100 ring-1 ring-slate-200"
                    : "hover:bg-slate-50"
                }`}
                aria-pressed={selectedChargerStatus === item.key}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.dot} shrink-0`}
                />
                <span className="text-slate-600 text-[11px] font-medium">
                  {item.label}
                </span>
                <span className="font-bold text-slate-900 ml-auto text-[11px]">
                  {item.count.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sessions on its own row */}

        <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Sessions
              </h3>

              <Link
                to="/session"
                className="text-xs font-semibold text-sky-600 hover:underline flex items-center"
              >
                <span>View All</span>

                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl ${session.logoBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                    >
                      {String(session.id ?? "—").substring(0, 2)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {session.id}
                      </h4>

                      <p className="text-[10px] font-medium text-slate-400">
                        {session.cpo}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {session.amount}
                    </span>

                    <span className="text-[9px] text-slate-400 block">
                      {session.time}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${session.badgeBg}`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
