import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  MoreVertical, 
  Activity,
  LogOut,
  Bell,
  Settings,
  Shield,
  Download,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Audit Data Fields: Student Name, Registered University Affiliate, Latest Test Matrix, Last Active Timestamp
  const [students] = useState([
    { id: "STU-001", name: "Siddharth Malani", affiliate: "MIT", testMatrix: "Baseline 101", lastActive: "2026-05-29 14:30" },
    { id: "STU-002", name: "Emma Watson", affiliate: "Stanford", testMatrix: "Stress Inventory B", lastActive: "2026-05-28 09:15" },
    { id: "STU-003", name: "James Chen", affiliate: "Harvard", testMatrix: "Baseline 101", lastActive: "2026-05-29 16:45" },
    { id: "STU-004", name: "Sophia Martinez", affiliate: "MIT", testMatrix: "Anxiety Scale C", lastActive: "2026-05-25 11:20" },
    { id: "STU-005", name: "Liam O'Connor", affiliate: "NYU", testMatrix: "Baseline 101", lastActive: "2026-04-10 08:00" },
  ]);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    name: "",
    affiliate: "",
    testMatrix: "",
    lastActive: ""
  });

  // Apply filters and sorting
  let processedData = [...students];
  
  // Search query filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    processedData = processedData.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query) ||
      student.affiliate.toLowerCase().includes(query)
    );
  }

  // Column specific filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      processedData = processedData.filter(student => 
        String(student[key as keyof typeof student]).toLowerCase().includes(filters[key].toLowerCase())
      );
    }
  });

  // Sorting
  if (sortConfig) {
    processedData.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof typeof a];
      const bVal = b[sortConfig.key as keyof typeof b];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      affiliate: "",
      testMatrix: "",
      lastActive: ""
    });
    setSearchQuery("");
  };

  // Stagger entry animations
  const pageContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
  };

  const cardGridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 14 } }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-indigo-100">
      
      {/* Top Navigation / App Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Shield className="h-5 w-5" />
          </motion.div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">WellMindly Admin Console</span>
            <span className="ml-3 inline-flex px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-100 uppercase tracking-wider">
              System Administrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </motion.button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-slate-900 leading-none">{user?.firstName || "Admin"} {user?.lastName || "User"}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{user?.email || "admin@wellmindly.com"}</p>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-slate-700 shadow-md flex items-center justify-center font-extrabold text-white text-xs cursor-pointer"
            >
              {(user?.firstName?.[0] || "A")}{(user?.lastName?.[0] || "U")}
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.1, color: "var(--color-red-600)" }}
              whileTap={{ scale: 0.9 }}
              onClick={logout} 
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl bg-slate-50 cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8">
        <motion.div 
          variants={pageContainerVariants}
          initial="hidden"
          animate="show"
          className="max-w-[1400px] mx-auto space-y-8"
        >
          
          {/* Page Header */}
          <motion.div variants={headerVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-1">Real-time aggregate health metrics and global student directory audit.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
                System Live
              </span>
            </div>
          </motion.div>

          {/* TOP BAR: System-wide Health Aggregates */}
          <motion.div 
            variants={cardGridVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            
            {/* Aggregate 1: Total Students Registered */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-5 transition-shadow cursor-pointer relative overflow-hidden"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Students</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">12,450</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">+12% this mo</span>
                </div>
              </div>
            </motion.div>

            {/* Aggregate 2: Assessments Completed Globally */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-5 transition-shadow cursor-pointer relative overflow-hidden"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Global Assessments</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">8,932</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">+340 this wk</span>
                </div>
              </div>
            </motion.div>

            {/* Aggregate 3: Active System Alerts */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(239 68 68 / 0.08), 0 8px 10px -6px rgb(239 68 68 / 0.08)" }}
              className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm flex items-center gap-5 transition-shadow cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
              <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black text-red-600/80 uppercase tracking-widest mb-1.5">Active Alerts</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">24</span>
                  <span className="text-xs font-semibold text-slate-400">flagged for audit</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* MAIN WORKSPACE: Detailed Analytical Summary Data Table */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col"
          >
            {/* Table Toolbar */}
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-slate-50/40">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-indigo-500" /> Administrative Audit & Risk Directory
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search name, ID, affiliate..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all w-full sm:w-60 shadow-sm"
                  />
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5" /> Clear Filters
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white border border-transparent rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Export Audit
                </motion.button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed min-w-[800px]">
                <thead className="bg-slate-50/50 border-b border-slate-200/80 text-slate-500">
                  <tr>
                    {/* Column 1: Student Name */}
                    <th className="px-6 py-4 align-top w-[25%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('name')}>
                        <span>Student Name</span>
                        {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600"/> : <ChevronDown className="h-4 w-4 text-indigo-600"/>) : <ChevronUp className="h-4 w-4 opacity-20"/>}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Filter name..." 
                        className="mt-3.5 w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold normal-case bg-white shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
                        value={filters.name}
                        onChange={(e) => setFilters({...filters, name: e.target.value})}
                      />
                    </th>
                    
                    {/* Column 2: Registered University Affiliate */}
                    <th className="px-6 py-4 align-top w-[25%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('affiliate')}>
                        <span>University Affiliate</span>
                        {sortConfig?.key === 'affiliate' ? (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600"/> : <ChevronDown className="h-4 w-4 text-indigo-600"/>) : <ChevronUp className="h-4 w-4 opacity-20"/>}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Filter affiliate..." 
                        className="mt-3.5 w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold normal-case bg-white shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
                        value={filters.affiliate}
                        onChange={(e) => setFilters({...filters, affiliate: e.target.value})}
                      />
                    </th>

                    {/* Column 3: Latest Test Matrix */}
                    <th className="px-6 py-4 align-top w-[22%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('testMatrix')}>
                        <span>Latest Test Matrix</span>
                        {sortConfig?.key === 'testMatrix' ? (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600"/> : <ChevronDown className="h-4 w-4 text-indigo-600"/>) : <ChevronUp className="h-4 w-4 opacity-20"/>}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Filter matrix..." 
                        className="mt-3.5 w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold normal-case bg-white shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
                        value={filters.testMatrix}
                        onChange={(e) => setFilters({...filters, testMatrix: e.target.value})}
                      />
                    </th>

                    {/* Column 4: Last Active Timestamp */}
                    <th className="px-6 py-4 align-top w-[18%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('lastActive')}>
                        <span>Last Active</span>
                        {sortConfig?.key === 'lastActive' ? (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600"/> : <ChevronDown className="h-4 w-4 text-indigo-600"/>) : <ChevronUp className="h-4 w-4 opacity-20"/>}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Filter timestamp..." 
                        className="mt-3.5 w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold normal-case bg-white shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
                        value={filters.lastActive}
                        onChange={(e) => setFilters({...filters, lastActive: e.target.value})}
                      />
                    </th>

                    {/* Column 5: Actions */}
                    <th className="px-6 py-4 align-top text-right w-[10%]">
                      <div className="font-bold uppercase tracking-wider text-[10px] pt-1.5">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {processedData.length > 0 ? (
                      processedData.map((student) => (
                        <motion.tr 
                          key={student.id} 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 150, damping: 20 }}
                          className="hover:bg-slate-50/60 transition-colors group/row"
                        >
                          <td className="px-6 py-4.5">
                            <p className="font-extrabold text-slate-800 group-hover/row:text-indigo-600 transition-colors">{student.name}</p>
                            <p className="text-slate-400 text-[10px] font-bold mt-0.5">{student.id}</p>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                              {student.affiliate}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100/50">
                              {student.testMatrix}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-slate-500 font-bold font-mono text-xs">
                            {student.lastActive}
                          </td>
                          <td className="px-6 py-4.5 text-right relative">
                            <motion.button 
                              whileHover={{ scale: 1.05, backgroundColor: "var(--color-slate-100)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setActiveDropdownId(activeDropdownId === student.id ? null : student.id)}
                              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer inline-flex"
                            >
                              <MoreVertical className="h-4.5 w-4.5" />
                            </motion.button>
                            
                            {/* Premium Dropdown with AnimatePresence */}
                            <AnimatePresence>
                              {activeDropdownId === student.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-30 cursor-default" 
                                    onClick={() => setActiveDropdownId(null)} 
                                  />
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute right-12 top-2 w-40 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 py-2 z-40 text-left overflow-hidden"
                                  >
                                    <button 
                                      onClick={() => setActiveDropdownId(null)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => setActiveDropdownId(null)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      Send Audit Email
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button 
                                      onClick={() => setActiveDropdownId(null)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-black text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      Revoke Access
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr layout>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">
                          No audited students match the current filters.
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Table Pagination / Footer */}
            <div className="p-5 border-t border-slate-150 bg-white flex items-center justify-between text-xs font-bold text-slate-400">
              <p>Showing 1 to {processedData.length} of 12,450 audited students</p>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Previous
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
