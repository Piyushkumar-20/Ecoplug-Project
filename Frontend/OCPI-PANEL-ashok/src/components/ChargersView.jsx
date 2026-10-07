import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';

const ChargersView = () => {
  const [searchId, setSearchId] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');

  const chargers = [
    { id: 'CHG-9901', emsp: 'Statiq Platform', name: 'ABB Terra 180 Fast Charger', location: 'Ecoplug GANPATI DH...', connector: 'CCS2 / CHAdeMO', output: '180 kW', usage: '82%', date: '09-09-2026', time: '14:05:14', status: 'Charging' },
    { id: 'CHG-9902', emsp: 'Tata Power', name: 'Delta City Charger 120', location: 'Ecoplug Shri Ji Resort', connector: 'CCS2 Dual', output: '120 kW', usage: '100%', date: '09-09-2026', time: '13:10:14', status: 'Charging' },
    { id: 'CHG-9903', emsp: 'Ather Grid', name: 'Ather Grid FastPod', location: 'Ecoplug Hotel Mayan...', connector: 'Ather Proprietary', output: '60 kW', usage: '0%', date: '09-09-2026', time: '13:05:14', status: 'Available' },
    { id: 'CHG-9904', emsp: 'Zeon Charging', name: 'Siemens Sicharge D', location: 'Laxmi Nagar (MCD P...', connector: 'CCS2 Ultra', output: '300 kW', usage: '0%', date: '09-09-2026', time: '11:40:14', status: 'Offline' },
    { id: 'CHG-9905', emsp: 'Adani TotalEnergies', name: 'Tritium Veefil-PK 175', location: 'Ecoplug Lords SKD R...', connector: 'CCS2 / Type 2', output: '175 kW', usage: '45%', date: '09-09-2026', time: '11:20:14', status: 'Charging' },
    { id: 'CHG-9906', emsp: 'Relux', name: 'Alpitronic Hypercharger HYC300', location: 'Ecoplug R K Family R...', connector: 'CCS2 High Power', output: '300 kW', usage: '0%', date: '09-09-2026', time: '10:55:14', status: 'Available' },
    { id: 'CHG-9907', emsp: 'Fortum Charge', name: 'Kempower Satellite C-Series', location: 'Ecoplug Dhaba 90\'S', connector: 'CCS2 Modular', output: '200 kW', usage: '60%', date: '09-09-2026', time: '10:20:14', status: 'Charging' }
  ];

  const filteredChargers = chargers.filter(c => {
    const matchesId = c.id.toLowerCase().includes(searchId.toLowerCase()) ||
      c.name.toLowerCase().includes(searchId.toLowerCase()) ||
      c.location.toLowerCase().includes(searchId.toLowerCase());
    const matchesCpo = selectedCpo === '' || c.emsp === selectedCpo;
    return matchesId && matchesCpo;
  });

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

          <button className="inline-flex items-center space-x-2 bg-[#C05621] hover:bg-[#A0461A] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Charger</span>
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
              onChange={(e) => setSearchId(e.target.value)}
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
              <option value="Statiq Platform">Statiq Platform</option>
              <option value="Tata Power">Tata Power</option>
              <option value="Ather Grid">Ather Grid</option>
              <option value="Zeon Charging">Zeon Charging</option>
              <option value="Adani TotalEnergies">Adani TotalEnergies</option>
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
            <span>Export</span>
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
              {filteredChargers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.emsp}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">{item.location}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{item.connector}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.output}</td>

                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">{item.date}</span>
                      <span className="text-[10px] text-slate-400 block">{item.time}</span>
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
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 cursor-pointer">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div>
            Showing <strong className="text-slate-800">1 - 25</strong> of <strong className="text-slate-800">148 items</strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">«</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">‹</button>
            <span>Page <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">1</span> of 6</span>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">›</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargersView;
