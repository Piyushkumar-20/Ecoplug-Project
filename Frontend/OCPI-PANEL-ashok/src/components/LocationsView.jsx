import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, Upload, LayoutGrid } from 'lucide-react';

const LocationsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCpo, setSelectedCpo] = useState('');

  const locations = [
    { id: 'LOC-0101', emsp: 'Statiq Platform', name: 'Connaught Place Hub', city: 'New Delhi', chargers: 2, power: '240 kW DC', address: 'Block A, Inner Circle, CP', date: '09-09-2026', time: '14:05:14', status: 'Online' },
    { id: 'LOC-0102', emsp: 'Tata Power', name: 'BKC Business Plaza', city: 'Mumbai', chargers: 6, power: '180 kW DC', address: 'G Block, BKC, Bandra East', date: '09-09-2026', time: '13:10:14', status: 'Online' },
    { id: 'LOC-0103', emsp: 'Ather Grid', name: 'Indiranagar Metro Hub', city: 'Bengaluru', chargers: 3, power: '120 kW DC', address: '100 Feet Rd, Indiranagar', date: '09-09-2026', time: '13:05:14', status: 'Online' },
    { id: 'LOC-0104', emsp: 'Zeon Charging', name: 'Cyber Hub Station', city: 'Gurugram', chargers: 1, power: '150 kW DC', address: 'DLF Cyber City, Phase 2', date: '09-09-2026', time: '11:40:14', status: 'Maintenance' },
    { id: 'LOC-0105', emsp: 'Adani TotalEnergies', name: 'HITEC City Park', city: 'Hyderabad', chargers: 4, power: '200 kW DC', address: 'Madhapur, HITEC City', date: '09-09-2026', time: '11:20:14', status: 'Online' },
    { id: 'LOC-0106', emsp: 'ChargeMOD', name: 'Anna Nagar Supercharger', city: 'Chennai', chargers: 6, power: '90 kW DC', address: '2nd Avenue, Anna Nagar', date: '09-09-2026', time: '10:55:14', status: 'Offline' }
  ];

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCpo = selectedCpo === '' || loc.emsp === selectedCpo;
    return matchesSearch && matchesCpo;
  });

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}


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
                <th className="py-3.5 px-4">Location ID</th>
                <th className="py-3.5 px-4">Station Name</th>
                <th className="py-3.5 px-4">City / Region</th>
                <th className="py-3.5 px-4 text-center">Chargers</th>
                <th className="py-3.5 px-4 text-center">Power Output</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLocations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A] cursor-pointer">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-700">{item.city}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.chargers} Chargers</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.power}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-[200px]">{item.address}</td>
                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">{item.date}</span>
                      <span className="text-[10px] text-slate-400 block">{item.time}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${item.status === 'Online' ? 'bg-[#ECFDF5] text-[#059669]' :
                      item.status === 'Maintenance' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-rose-100 text-rose-700'
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
            Showing <strong className="text-slate-800">1 - 25</strong> of <strong className="text-slate-800">54 items</strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">«</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">‹</button>
            <span>Page <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">1</span> of 3</span>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">›</button>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsView;
