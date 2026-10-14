
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';
import { apiRequest } from '../services/api';


const TariffsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');

  const [tariffPlans, setTariffPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiRequest('/api/tariffs');

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
  }, []);


    
const filteredTariffs = tariffPlans.filter((plan) => {
  const tariffId = String(plan.tariffId || '');
  const validityWindow = String(plan.validityWindow || '');

  const matchesSearch =
    tariffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validityWindow.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesSearch;
});

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
               
                <th className="py-3.5 px-4">Validity Window</th>
                <th className="py-3.5 px-4 text-center">Base Rate</th>
                
                
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTariffs.map((item) => (
                <tr key={item.tariffId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.tariffId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.validityWindow || '—'}</td>
                  
                  <td className="py-3.5 px-4 text-slate-600">{item.validityWindow || '—'}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">{item.baseRate != null? `₹ ${Number(item.baseRate).toFixed(2)} / kWh`: '—'}</td>
                  
                  
                  <td className="py-3.5 px-4">
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
                      item.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'
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
