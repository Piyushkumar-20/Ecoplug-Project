import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  Upload,
  LayoutGrid,
  Search,
  RotateCcw,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  User,
  Phone,
  Mail,
  MapPin,
  Send,
  Trash2,
  Check,
  Tag,
  AlertTriangle
} from 'lucide-react';

const initialComplaints = [
  {
    id: '273117',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.DC354874_1',
    stationName: 'Ecoplug GANPATI DH...',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    tat: '2h 16m',
    date: '09-09-2026',
    time: '14:05:14',
    status: 'Resolved',
    user: 'Suresh Kumar',
    phone: '+91 98765 43210',
    email: 'suresh.k@gmail.com',
    vehicle: 'Tata Nexon EV Max',
    notes: [
      { sender: 'System', time: '09-09-2026 14:05:14', text: 'Ticket automatically raised via eMSP API.' },
      { sender: 'Ashok (Manager)', time: '09-09-2026 15:10:00', text: 'Remote reset issued for charger IN*EPL.DC354874_1.' }
    ]
  },
  {
    id: '273112',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.010232',
    stationName: 'Ecoplug Shri Ji Resort',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    tat: '3h 10m',
    date: '09-09-2026',
    time: '13:10:14',
    status: 'Resolved',
    user: 'Kavita Roy',
    phone: '+91 98112 34567',
    email: 'kavita.roy@outlook.com',
    vehicle: 'MG ZS EV',
    notes: [
      { sender: 'System', time: '09-09-2026 13:10:14', text: 'Session stop request pending.' }
    ]
  },
  {
    id: '273111',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.8476',
    stationName: 'Ecoplug Hotel Mayan...',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'High',
    tat: '3h 15m',
    date: '09-09-2026',
    time: '13:05:14',
    status: 'Open',
    user: 'Rahul Verma',
    phone: '+91 97654 32109',
    email: 'rahul.v@yahoo.com',
    vehicle: 'Ather 450X',
    notes: [{ sender: 'System', time: '09-09-2026 13:05:14', text: 'Gun lock error detected.' }]
  },
  {
    id: '273098',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL*EPLDC93413_1',
    stationName: 'Laxmi Nagar (MCD P...',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    tat: '4h 38m',
    date: '09-09-2026',
    time: '11:40:14',
    status: 'In Progress',
    user: 'Deepak Sharma',
    phone: '+91 99887 76655',
    email: 'deepak.s@gmail.com',
    vehicle: 'Hyundai Ioniq 5',
    notes: [{ sender: 'Tech Support', time: '09-09-2026 12:00:00', text: 'Technician assigned to inspect HMI.' }]
  },
  {
    id: '273092',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.DC1853379_1',
    stationName: 'Ecoplug Lords SKD R...',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    tat: '4h 56m',
    date: '09-09-2026',
    time: '11:20:14',
    status: 'Resolved',
    user: 'Neha Gupta',
    phone: '+91 98334 11223',
    email: 'neha.gupta@corp.com',
    vehicle: 'BYD Atto 3',
    notes: []
  },
  {
    id: '273088',
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.AC838474_1',
    stationName: 'Ecoplug R K Family R...',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    tat: '5h 18m',
    date: '09-09-2026',
    time: '10:55:14',
    status: 'Resolved',
    user: 'Amitabh Sen',
    phone: '+91 91234 56789',
    email: 'amitabh.sen@tech.in',
    vehicle: 'Tata Tiago EV',
    notes: []
  }
];

const ComplaintsView = () => {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [complaintIdSearch, setComplaintIdSearch] = useState('');
  const [sessionIdSearch, setSessionIdSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newResponseText, setNewResponseText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    emsp: 'Statiq Platform',
    chargerName: 'IN*EPL.NEW01',
    stationName: '',
    complaintType: 'Charging Session',
    subType: 'Charging Not Stopping',
    priority: 'Medium',
    user: ''
  });

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesId = item.id.toLowerCase().includes(complaintIdSearch.toLowerCase()) ||
        item.stationName.toLowerCase().includes(complaintIdSearch.toLowerCase()) ||
        item.user.toLowerCase().includes(complaintIdSearch.toLowerCase());
      const matchesSession = sessionIdSearch === '' || item.emsp === sessionIdSearch;
      return matchesId && matchesSession;
    });
  }, [complaints, complaintIdSearch, sessionIdSearch]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newResponseText.trim() || !selectedTicket) return;
    const newNote = {
      sender: 'Ashok (Manager)',
      time: 'Just now',
      text: newResponseText.trim()
    };
    const updatedNotes = [...(selectedTicket.notes || []), newNote];
    const updatedTicket = { ...selectedTicket, notes: updatedNotes };
    setComplaints(prev => prev.map(c => c.id === selectedTicket.id ? updatedTicket : c));
    setSelectedTicket(updatedTicket);
    setNewResponseText('');
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicketForm.stationName || !newTicketForm.user) return;
    const newId = `#${Math.floor(273000 + Math.random() * 900)}`;
    const newTicket = {
      id: newId,
      emsp: newTicketForm.emsp,
      chargerName: newTicketForm.chargerName,
      stationName: newTicketForm.stationName,
      complaintType: newTicketForm.complaintType,
      subType: newTicketForm.subType,
      priority: newTicketForm.priority,
      tat: '0h 05m',
      date: '09-09-2026',
      time: '16:00:00',
      status: 'Open',
      user: newTicketForm.user,
      phone: '+91 98000 00000',
      email: 'user@ecoplug.in',
      vehicle: 'EV',
      notes: [{ sender: 'System', time: 'Just now', text: 'Ticket logged manually.' }]
    };
    setComplaints([newTicket, ...complaints]);
    setIsCreateModalOpen(false);
    setNewTicketForm({
      emsp: 'Statiq Platform',
      chargerName: 'IN*EPL.NEW01',
      stationName: '',
      complaintType: 'Charging Session',
      subType: 'Charging Not Stopping',
      priority: 'Medium',
      user: ''
    });
  };

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Top Header & Actions */}


      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Tickets</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{complaints.length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-rose-600">Open Tickets</p>
            <h3 className="text-xl font-extrabold text-rose-700 mt-0.5">{complaints.filter(c => c.status === 'Open').length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-600">In Progress</p>
            <h3 className="text-xl font-extrabold text-amber-700 mt-0.5">{complaints.filter(c => c.status === 'In Progress').length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-600">Resolved</p>
            <h3 className="text-xl font-extrabold text-emerald-700 mt-0.5">{complaints.filter(c => c.status === 'Resolved').length}</h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Left Inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Complaint ID Search */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={complaintIdSearch}
              onChange={(e) => setComplaintIdSearch(e.target.value)}
              placeholder="Complaint ID / Station / User"
              className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white transition-all"
            />
          </div>

        </div>

        {/* Right Actions */}
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

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-slate-200/80 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">eMSP</th>
                <th className="py-3.5 px-4">Charger Name</th>
                <th className="py-3.5 px-4">Station Name</th>
                <th className="py-3.5 px-4">Complaint Type</th>
                <th className="py-3.5 px-4">Sub Type</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">TAT</th>
                <th className="py-3.5 px-4">Raised At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredComplaints.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedTicket(item)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#C05621] underline hover:text-[#A0461A]">
                    {item.id}
                  </td>

                  {/* eMSP */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.emsp}</td>

                  {/* Charger Name */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{item.chargerName}</td>

                  {/* Station Name */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[180px]">{item.stationName}</td>

                  {/* Complaint Type */}
                  <td className="py-3.5 px-4 text-slate-700">{item.complaintType}</td>

                  {/* Sub Type */}
                  <td className="py-3.5 px-4 text-slate-600">{item.subType}</td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${item.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>
                      {item.priority}
                    </span>
                  </td>

                  {/* TAT */}
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{item.tat}</td>

                  {/* Raised At */}
                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">{item.date}</span>
                      <span className="text-[10px] text-slate-400 block">{item.time}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${item.status === 'Resolved' ? 'bg-[#ECFDF5] text-[#059669]' :
                      item.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'
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
            Showing <strong className="text-slate-800">1 - {filteredComplaints.length}</strong> of <strong className="text-slate-800">{complaints.length} items</strong>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">«</button>
            <span>Page <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900 border border-slate-200">1</span> of 1</span>
            <button className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700">»</button>
          </div>
        </div>
      </div>

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-400 text-xs">{selectedTicket.id}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedTicket.stationName}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p>User: <strong>{selectedTicket.user}</strong></p>
                <p>Type: <strong>{selectedTicket.complaintType} - {selectedTicket.subType}</strong></p>
                <p>Charger: <strong className="font-mono">{selectedTicket.chargerName}</strong></p>
                <p>Status: <strong className="text-emerald-600">{selectedTicket.status}</strong></p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Activity Log & Responses</h4>
                {selectedTicket.notes?.map((n, i) => (
                  <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{n.sender}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{n.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newResponseText}
                  onChange={(e) => setNewResponseText(e.target.value)}
                  placeholder="Type note or response..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <button type="submit" className="bg-[#C05621] text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-xs font-bold">Add New Complaint</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateTicketSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Station Name *</label>
                <input required type="text" value={newTicketForm.stationName} onChange={(e) => setNewTicketForm({ ...newTicketForm, stationName: e.target.value })} placeholder="Ecoplug Resort Hub" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">User Name *</label>
                <input required type="text" value={newTicketForm.user} onChange={(e) => setNewTicketForm({ ...newTicketForm, user: e.target.value })} placeholder="Ramesh Kumar" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 font-bold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#C05621] text-white font-bold rounded-xl cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;
