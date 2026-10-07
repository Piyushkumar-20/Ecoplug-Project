import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Zap,
  TrendingUp,
  IndianRupee,
  Leaf,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Maximize2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Play,
  Globe,
  Battery,
  ShieldAlert
} from 'lucide-react';

const DashboardView = ({ selectedCpo }) => {
  const [activeTab, setActiveTab] = useState('Sessions');
  const [hoveredBar, setHoveredBar] = useState(17); // 18 Sep selected by default

  // Stats Data
  const stats = [
    {
      title: 'Charging Stations',
      value: '1,248',
      change: '+18%',
      bg: 'bg-sky-100/70',
      textColor: 'text-sky-700',
      icon: Building,
    },
    {
      title: 'Chargers',
      value: '5,642',
      change: '+22%',
      bg: 'bg-emerald-100/70',
      textColor: 'text-emerald-700',
      icon: Zap,
    },
    {
      title: 'Charging Sessions',
      value: '18,420',
      change: '+16%',
      bg: 'bg-purple-100/70',
      textColor: 'text-purple-700',
      icon: TrendingUp,
    },
    {
      title: 'Total Revenue',
      value: '₹ 12.48 L',
      change: '+28%',
      bg: 'bg-rose-100/70',
      textColor: 'text-rose-700',
      icon: IndianRupee,
    },
    {
      title: 'Failed Session',
      value: '142',
      change: '+3%',
      bg: 'bg-teal-100/70',
      textColor: 'text-teal-700',
      icon: Leaf,
    },
  ];

  // Charging Activity Data (30 Days)
  const barData = [
    180, 220, 310, 280, 240, 290, 350, 320, 380, 410,
    390, 430, 480, 520, 490, 560, 580, 642, 590, 540,
    510, 490, 530, 570, 550, 520, 480, 510, 540, 580
  ];

  // Recent Sessions
  const recentSessions = [
    { id: 'DL-CH-001', cpo: 'Statiq', amount: '₹ 320', time: '10:24 AM', status: 'Charging', badgeBg: 'bg-emerald-100 text-emerald-700', logoBg: 'bg-slate-900 text-white' },
    { id: 'MH-CH-034', cpo: 'Tata Power', amount: '₹ 540', time: '09:18 AM', status: 'Completed', badgeBg: 'bg-sky-100 text-sky-700', logoBg: 'bg-sky-600 text-white' },
    { id: 'KA-CH-078', cpo: 'Ather Grid', amount: '₹ 210', time: '08:45 AM', status: 'Completed', badgeBg: 'bg-sky-100 text-sky-700', logoBg: 'bg-emerald-600 text-white' },
    { id: 'TN-CH-110', cpo: 'Zeon Charging', amount: '₹ 420', time: '07:12 AM', status: 'Failed', badgeBg: 'bg-rose-100 text-rose-700', logoBg: 'bg-rose-600 text-white' },
    { id: 'GJ-CH-056', cpo: 'ChargeMOD', amount: '₹ 310', time: '06:32 AM', status: 'Completed', badgeBg: 'bg-sky-100 text-sky-700', logoBg: 'bg-teal-600 text-white' },
  ];

  // Top CPO Partners
  const topCPOs = [
    { rank: 1, name: 'Statiq', stations: 168, chargers: 842, sessions: '4,320', logo: 'S', color: 'bg-slate-900' },
    { rank: 2, name: 'Tata Power', stations: 142, chargers: 720, sessions: '3,215', logo: 'TP', color: 'bg-sky-600' },
    { rank: 3, name: 'Ather Grid', stations: 118, chargers: 642, sessions: '2,980', logo: 'A', color: 'bg-emerald-700' },
    { rank: 4, name: 'Zeon Charging', stations: 96, chargers: 518, sessions: '1,860', logo: 'Z', color: 'bg-rose-600' },
    { rank: 5, name: 'Adani TotalEnergies', stations: 84, chargers: 460, sessions: '1,245', logo: 'AT', color: 'bg-amber-600' },
  ];

  // Recent Onboardings
  const recentOnboardings = [
    { name: 'GreenVolt', city: 'Jaipur', stations: 12, chargers: 48, date: '10 Sep 2026', status: 'Active' },
    { name: 'ChargeZone', city: 'Lucknow', stations: 18, chargers: 62, date: '08 Sep 2026', status: 'Active' },
    { name: 'BlinkCharge', city: 'Indore', stations: 10, chargers: 36, date: '05 Sep 2026', status: 'Active' },
    { name: 'ElectraGrid', city: 'Bhopal', stations: 8, chargers: 28, date: '02 Sep 2026', status: 'Pending' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Welcome Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good Morning, Ashok!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Here's an overview of your eMSP network across {selectedCpo === 'All CPOs' ? 'all CPO partners' : selectedCpo}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date pill */}
          <div className="flex items-center space-x-2.5 px-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-normal leading-tight">Today</span>
              <span>12 Sep 2026, Saturday</span>
            </div>
          </div>

          {/* Banner Tag pill */}
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-amber-100/60 border border-amber-300/50 rounded-2xl text-xs font-bold text-amber-900">
            <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-500/30" />
            <span>Driving Sustainable Mobility Together</span>
            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center ml-1">
              <ArrowUpRight className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.textColor} flex items-center justify-center shadow-2xs`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block truncate mt-0.5">
                  {stat.title}
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
                <span className="text-[10px] font-normal text-slate-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Dashboard Row: Activity Bar Chart + Donut Status + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Charging Activity Chart (6 cols on lg) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Charging Activity</h3>

              <div className="flex items-center space-x-2">
                {/* Metric toggle */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  {['Sessions', 'Energy (kWh)', 'Revenue (₹)'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === tab
                        ? 'bg-[#FEF0A6] text-slate-900 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-hidden">
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="relative pt-8 pb-2">
              {/* Highlighted Tooltip */}
              {hoveredBar !== null && (
                <div
                  className="absolute -top-1 transform -translate-x-1/2 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-semibold shadow-lg z-10 transition-all pointer-events-none flex flex-col items-center"
                  style={{ left: `${(hoveredBar / 29) * 90 + 5}%` }}
                >
                  <span className="font-bold text-amber-300">{barData[hoveredBar]} Sessions</span>
                  <span className="text-[9px] text-slate-300">{hoveredBar + 1} Sep 2026</span>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1"></div>
                </div>
              )}

              {/* Chart Grid background lines */}
              <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-1.5 pt-4 border-b border-slate-200/80 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                {barData.map((val, idx) => {
                  const heightPercent = (val / 700) * 100;
                  const isSelected = idx === hoveredBar;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredBar(idx)}
                      className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end z-10"
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all duration-200 ${isSelected
                          ? 'bg-amber-400 shadow-md ring-2 ring-amber-300'
                          : 'bg-amber-100 hover:bg-amber-300'
                          }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
                <span>1 Sep</span>
                <span>5 Sep</span>
                <span>9 Sep</span>
                <span>13 Sep</span>
                <span>17 Sep</span>
                <span>21 Sep</span>
                <span>25 Sep</span>
                <span>29 Sep</span>
              </div>
            </div>
          </div>
        </div>

        {/* Station Status Donut (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Station Status</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-auto py-2 flex flex-col items-center">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Online 72% */}
                <path
                  className="text-emerald-500 stroke-current transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray="72, 100"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Charging 18% */}
                <path
                  className="text-cyan-500 stroke-current transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray="18, 100"
                  strokeDashoffset="-72"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Offline 7% */}
                <path
                  className="text-slate-400 stroke-current transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray="7, 100"
                  strokeDashoffset="-90"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Maintenance 3% */}
                <path
                  className="text-rose-500 stroke-current transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray="3, 100"
                  strokeDashoffset="-97"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900 leading-none">1,248</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Stations</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 text-[11px] font-medium">Online</span>
              <span className="font-bold text-slate-900 ml-auto text-[11px]">72%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
              <span className="text-slate-600 text-[11px] font-medium">Charging</span>
              <span className="font-bold text-slate-900 ml-auto text-[11px]">18%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-600 text-[11px] font-medium">Offline</span>
              <span className="font-bold text-slate-900 ml-auto text-[11px]">7%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-600 text-[11px] font-medium">Maintenance</span>
              <span className="font-bold text-slate-900 ml-auto text-[11px]">3%</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions List (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Sessions</h3>
              <Link to="/session" className="text-xs font-semibold text-sky-600 hover:underline flex items-center">
                <span>View All</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentSessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl ${session.logoBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                      {session.id.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{session.id}</h4>
                      <p className="text-[10px] font-medium text-slate-400">{session.cpo}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">{session.amount}</span>
                    <span className="text-[9px] text-slate-400 block">{session.time}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${session.badgeBg}`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Map + Top CPOs + Energy Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CPO Locations Map View (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">CPO Locations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Map Visual Box */}
            <div className="relative h-44 bg-sky-50/50 rounded-xl border border-sky-100 p-2 overflow-hidden flex items-center justify-center">
              <Globe className="w-32 h-32 text-sky-200 opacity-60 absolute" />

              {/* Map Location Pins */}
              <div className="absolute top-6 left-12 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
              <div className="absolute top-6 left-12 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />

              <div className="absolute top-16 left-20 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />
              <div className="absolute bottom-10 left-16 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />
              <div className="absolute top-20 right-12 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />
              <div className="absolute bottom-8 right-16 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />

              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-700 shadow-2xs">
                India Network
              </div>
            </div>

            {/* City Counts List */}
            <div className="space-y-1.5 text-xs">
              {[
                { city: 'Delhi', count: 142 },
                { city: 'Mumbai', count: 128 },
                { city: 'Bengaluru', count: 118 },
                { city: 'Hyderabad', count: 96 },
                { city: 'Chennai', count: 84 },
                { city: 'Pune', count: 76 },
              ].map((loc, i) => (
                <div key={i} className="flex items-center justify-between text-slate-700 hover:bg-slate-50 px-1.5 py-0.5 rounded-md">
                  <span className="text-[11px] font-medium">{loc.city}</span>
                  <span className="text-[11px] font-bold text-slate-900">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top CPO Partners Table (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Top CPO Partners</h3>
            <Link to="/profile" className="text-xs font-semibold text-sky-600 hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px]">
                  <th className="pb-2">#</th>
                  <th className="pb-2">CPO Name</th>
                  <th className="pb-2 text-right">Stations</th>
                  <th className="pb-2 text-right">Chargers</th>
                  <th className="pb-2 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCPOs.map((cpo) => (
                  <tr key={cpo.rank} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-400 text-[11px]">{cpo.rank}</td>
                    <td className="py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-md ${cpo.color} text-white font-bold text-[9px] flex items-center justify-center`}>
                          {cpo.logo}
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">{cpo.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-600 text-[11px]">{cpo.stations}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600 text-[11px]">{cpo.chargers}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 text-[11px]">{cpo.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Energy Consumption Line Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Energy Consumption</h3>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-slate-700">
              <option>This Month</option>
            </select>
          </div>

          <div className="relative pt-6">
            {/* Peak Tag */}
            <div className="absolute top-1 right-8 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md flex flex-col items-center z-10">
              <span className="text-emerald-400">28,420 kWh</span>
              <span className="text-[9px] text-slate-400">22 Sep 2026</span>
              <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1"></div>
            </div>

            {/* Smooth SVG Line Chart */}
            <div className="h-40 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                  d="M 0,90 Q 40,80 80,95 T 160,50 T 220,20 T 300,40 L 300,120 L 0,120 Z"
                  fill="url(#energyGrad)"
                />

                {/* Line stroke */}
                <path
                  d="M 0,90 Q 40,80 80,95 T 160,50 T 220,20 T 300,40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Highlight Point */}
                <circle cx="220" cy="20" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2">
              <span>1 Sep</span>
              <span>8 Sep</span>
              <span>15 Sep</span>
              <span>22 Sep</span>
              <span>30 Sep</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Row: Recent Onboardings + System Notifications + Promo Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* System Notifications Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">System Notifications</h3>
            <Link to="/complaints" className="text-xs font-semibold text-sky-600 hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            <div className="flex items-start space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Statiq added 5 new stations</p>
                <span className="text-[10px] text-slate-400">10 minutes ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Tata Power charger went offline</p>
                <span className="text-[10px] text-slate-400">25 minutes ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">New roaming request from ChargeZone</p>
                <span className="text-[10px] text-slate-400">1 hour ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-800">Settlement report for August is ready</p>
                <span className="text-[10px] text-slate-400">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empowering Promotional Card (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col justify-between group">
          {/* Background image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url('/assets/ev_empower_banner.png')` }}
          />

          <div className="relative z-10 space-y-2">
            <h3 className="text-base font-extrabold leading-snug text-white">
              Empowering <br />
              A Cleaner, Greener <br />
              Tomorrow
            </h3>

            <button className="mt-2 inline-flex items-center space-x-1.5 bg-[#FEF0A6] hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer">
              <span>Watch Overview</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Feature Badges */}
          <div className="relative z-10 grid grid-cols-4 gap-2 pt-4 border-t border-white/10 mt-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-1">
                <Zap className="w-3 h-3" />
              </div>
              <span className="text-[9px] text-slate-300 leading-tight">More Charging Stations</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-1">
                <Leaf className="w-3 h-3" />
              </div>
              <span className="text-[9px] text-slate-300 leading-tight">Cleaner Environment</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-lg bg-sky-400/20 text-sky-300 flex items-center justify-center mb-1">
                <Users className="w-3 h-3" />
              </div>
              <span className="text-[9px] text-slate-300 leading-tight">Stronger Partnerships</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center mb-1">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-[9px] text-slate-300 leading-tight">A Greener Tomorrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
