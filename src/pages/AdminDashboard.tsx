import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  FileText,
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
  ChevronDown,
  HeartPulse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { apiErrorMessage } from "../services/api";
import type { AdminMetrics, AdminStudent } from "../types";

/** A dash, not a zero: a failed fetch must not read as a real measurement of nothing. */
const EM_DASH = "—";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // Both endpoints are ADMIN-only (backend/src/routes/admin.ts) and are the same
  // ones the standalone admin panel reads, so this screen shows the real system,
  // not a parallel set of figures. See tasks/BUGS.md B-161.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, s] = await Promise.all([
          api.get<AdminMetrics>("/admin/metrics"),
          api.get<{ students: AdminStudent[] }>("/admin/students"),
        ]);
        if (!cancelled) {
          setMetrics(m.data);
          setStudents(s.data?.students ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(apiErrorMessage(err, "System metrics are unavailable. Check your connection and try again."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const num = (v: number | null | undefined) =>
    typeof v === "number" && Number.isFinite(v) ? v.toLocaleString() : EM_DASH;

  const registered = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? EM_DASH
      : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  const rows = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
        email: s.email,
        affiliate: s.university?.name || "Unaffiliated",
        createdAt: s.createdAt,
        registered: registered(s.createdAt),
      })),
    [students]
  );

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    name: "",
    affiliate: "",
    registered: ""
  });

  // Apply filters and sorting
  let processedData = [...rows];

  // Search query filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    processedData = processedData.filter(student =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
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

  // Sorting. `registered` is a formatted string, so sort it on the raw timestamp.
  if (sortConfig) {
    processedData.sort((a, b) => {
      const k = sortConfig.key === 'registered' ? 'createdAt' : sortConfig.key;
      const aVal = a[k as keyof typeof a];
      const bVal = b[k as keyof typeof b];
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
      registered: ""
    });
    setSearchQuery("");
  };

  /** Exports exactly the rows currently on screen — no invented columns, no server round-trip. */
  const exportCsv = () => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
      ["Student", "Email", "University Affiliate", "Registered"].map(esc).join(","),
      ...processedData.map((r) => [r.name, r.email, r.affiliate, r.registered].map(esc).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `WellMindly_Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard access can be refused (insecure context, denied permission).
      // Say so rather than showing a success state for something that did not happen.
      setCopied("Clipboard unavailable");
      window.setTimeout(() => setCopied(null), 2400);
    }
    setActiveDropdownId(null);
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
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10 cursor-pointer shrink-0"
          >
            <Shield className="h-5 w-5" />
          </motion.div>
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base truncate">WellMindly Admin Console</span>
            <span className="hidden lg:inline-flex shrink-0 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-100 uppercase tracking-wider">
              System Administrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl cursor-pointer"
            aria-label="Notifications"
          >
            {/* No unread indicator: there is no notification feed behind this button, so a
                red dot would be asserting unread items that do not exist. */}
            <Bell className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl cursor-pointer"
            aria-label="Settings"
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

          {loadError && (
            <motion.div
              variants={cardVariants}
              className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-xs font-bold text-red-800"
              role="alert"
            >
              {loadError}
            </motion.div>
          )}

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
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Registered Students</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {loading ? <span className="text-slate-300">···</span> : loadError ? EM_DASH : num(students.length)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {/* "accounts", not "students": totalUniqueUsers counts every account with
                        a submission, including staff. It read 12 against 11 students because
                        an ADMIN account has quiz results — see tasks/BUGS.md B-161. */}
                    {num(metrics?.totalUniqueUsers)} accounts have submitted
                  </span>
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
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {loading ? <span className="text-slate-300">···</span> : num(metrics?.totalSubmissions)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    across {num(metrics?.quizMetrics?.length)} instruments
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Aggregate 3: Daily check-in mood. Not an alert count — the classification
                column this console would have to match on is unreliable (BUGS.md B-158),
                so a "flagged for audit" figure would be a guess dressed as a number. */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-5 transition-shadow cursor-pointer relative overflow-hidden"
            >
              <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-inner">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Avg Daily Mood</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {loading ? (
                      <span className="text-slate-300">···</span>
                    ) : typeof metrics?.avgDailyMood === "number" ? (
                      `${metrics.avgDailyMood.toFixed(1)} / 5.0`
                    ) : (
                      EM_DASH
                    )}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {num(metrics?.totalCheckins)} check-ins
                  </span>
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
                <Activity className="h-5 w-5 text-indigo-500" /> Registered Student Directory
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, affiliate..."
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
                  onClick={exportCsv}
                  disabled={processedData.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white border border-transparent rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </motion.button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed min-w-[800px]">
                <thead className="bg-slate-50/50 border-b border-slate-200/80 text-slate-500">
                  <tr>
                    {/* Column 1: Student Name */}
                    <th className="px-6 py-4 align-top w-[34%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('name')}>
                        <span>Student</span>
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
                    <th className="px-6 py-4 align-top w-[28%]">
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

                    {/* Column 3: Registration date. The two columns that used to sit here —
                        "Latest Test Matrix" and "Last Active" — had no source: GET
                        /api/admin/students returns neither a per-student quiz summary nor a
                        last-activity timestamp. See tasks/BUGS.md B-161. */}
                    <th className="px-6 py-4 align-top w-[24%]">
                      <div className="flex items-center justify-between cursor-pointer hover:text-slate-800 transition-colors font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSort('registered')}>
                        <span>Registered</span>
                        {sortConfig?.key === 'registered' ? (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-indigo-600"/> : <ChevronDown className="h-4 w-4 text-indigo-600"/>) : <ChevronUp className="h-4 w-4 opacity-20"/>}
                      </div>
                      <input
                        type="text"
                        placeholder="Filter date..."
                        className="mt-3.5 w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold normal-case bg-white shadow-sm transition-all focus:ring-4 focus:ring-indigo-50"
                        value={filters.registered}
                        onChange={(e) => setFilters({...filters, registered: e.target.value})}
                      />
                    </th>

                    {/* Column 4: Actions */}
                    <th className="px-6 py-4 align-top text-right w-[14%]">
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
                            <p className="text-slate-400 text-[10px] font-bold mt-0.5">{student.email}</p>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                              {student.affiliate}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-slate-500 font-bold font-mono text-xs">
                            {student.registered}
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
                                    className="absolute right-12 top-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 py-2 z-40 text-left overflow-hidden"
                                  >
                                    {/* Only actions this app can actually carry out. The
                                        previous menu offered "Send Audit Email" and "Revoke
                                        Access"; neither had an endpoint and both silently did
                                        nothing. Student-level detail belongs in the dedicated
                                        admin console, not in the portal whose contract is
                                        aggregate-only. See tasks/BUGS.md B-161. */}
                                    <button
                                      onClick={() => copy("Email copied", student.email)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      Copy email
                                    </button>
                                    <button
                                      onClick={() => copy("Student ID copied", student.id)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      Copy student ID
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
                        <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">
                          {loading
                            ? "Loading the student directory…"
                            : loadError
                            ? "The directory could not be loaded."
                            : students.length === 0
                            ? "No students are registered yet."
                            : "No students match the current filters."}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Table Footer. The whole directory is fetched in one call, so there is nothing
                to page through — showing Previous/Next would be two more controls that do
                nothing. The count is the real row count, not a fixed literal. */}
            <div className="p-5 border-t border-slate-150 bg-white flex items-center justify-between gap-4 text-xs font-bold text-slate-400">
              <p>
                {processedData.length === students.length
                  ? `${students.length} registered student${students.length === 1 ? "" : "s"}`
                  : `${processedData.length} of ${students.length} students match`}
              </p>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg"
                    role="status"
                  >
                    {copied}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
