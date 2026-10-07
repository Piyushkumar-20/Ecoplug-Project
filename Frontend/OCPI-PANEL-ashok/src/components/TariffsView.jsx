import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';

const TariffsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');

  const tariffPlans = [
    { id: '#TRF-0101', emsp: 'Statiq Platform', name: 'Standard Peak Tariff', rate: '₹ 18.50 / kWh', window: 'Peak (08:00 - 22:00)', tax: '18% GST', margin: '₹ 1.50 / kWh', date: '09-09-2026', time: '14:05:14', status: 'Active' },
    { id: '#TRF-0102', emsp: 'Tata Power', name: 'Off-Peak Eco Tariff', rate: '₹ 14.00 / kWh', window: 'Off-Peak (22:00 - 08:00)', tax: '18% GST', margin: '₹ 1.00 / kWh', date: '09-09-2026', time: '13:10:14', status: 'Active' },
    { id: '#TRF-0103', emsp: 'Zeon Charging', name: 'Hyper Fast Charge Rate', rate: '₹ 22.00 / kWh', window: 'DC Ultra Fast (>150kW)', tax: '18% GST', margin: '₹ 2.00 / kWh', date: '09-09-2026', time: '13:05:14', status: 'Active' },
    { id: '#TRF-0104', emsp: 'Adani TotalEnergies', name: 'Fleet Preferred Rate', rate: '₹ 12.50 / kWh', window: '24x7 Fleet Access', tax: '18% GST', margin: '₹ 0.50 / kWh', date: '09-09-2026', time: '11:40:14', status: 'Active' },
    { id: '#TRF-0105', emsp: 'Ather Grid', name: 'Night Saver Discount', rate: '₹ 11.00 / kWh', window: 'Late Night (00:00 - 06:00)', tax: '18% GST', margin: '₹ 0.75 / kWh', date: '09-09-2026', time: '11:20:14', status: 'Active' },
    { id: '#TRF-0106', emsp: 'ChargeMOD', name: 'Highway Express Supercharger', rate: '₹ 24.50 / kWh', window: '24x7 High Output', tax: '18% GST', margin: '₹ 2.50 / kWh', date: '09-09-2026', time: '10:55:14', status: 'Draft' }
  ];

  const filteredTariffs = tariffPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCpo = selectedCpo === '' || plan.emsp === selectedCpo;
    return matchesSearch && matchesCpo;
  });

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tariffs</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">38 tariff plans</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button className="inline-flex items-center space-x-2 bg-[#C05621] hover:bg-[#A0461A] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Tariff Plan</span>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tariff ID / Plan Name"
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
                <th className="py-3.5 px-4">Tariff ID</th>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">eMSP Partner</th>
                <th className="py-3.5 px-4">Validity Window</th>
                <th className="py-3.5 px-4 text-center">Base Rate</th>
                <th className="py-3.5 px-4 text-center">eMSP Margin</th>
                <th className="py-3.5 px-4 text-center">Tax (GST)</th>
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTariffs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.emsp}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.window}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">{item.rate}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.margin}</td>
                  <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{item.tax}</td>
                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">{item.date}</span>
                      <span className="text-[10px] text-slate-400 block">{item.time}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'
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
            Showing <strong className="text-slate-800">1 - 25</strong> of <strong className="text-slate-800">38 items</strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">«</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">‹</button>
            <span>Page <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">1</span> of 2</span>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">›</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffsView;
