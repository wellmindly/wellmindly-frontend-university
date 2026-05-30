import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2,
  Activity,
  TrendingUp,
  BrainCircuit,
  Clock,
  ShieldAlert,
  LogOut,
  Bell,
  Settings,
  Compass,
  ArrowUpRight,
  Download,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UniversityDashboard() {
  const { user, logout } = useAuth();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<"month" | "quarter" | "ytd">("month");

  // Macro-level Cohort data
  const timeframeData = {
    month: [35, 42, 58, 65, 82, 74, 88],
    quarter: [45, 52, 60, 58, 70, 75, 80],
    ytd: [30, 48, 55, 62, 74, 68, 85]
  };

  const chartWeeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Current"];

  const currentChartData = timeframeData[activeTimeframe];

  // Page entry stagger
  const pageVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 14 } }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-teal-100">
      
      {/* Top Navigation / App Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/10 cursor-pointer"
          >
            <Building2 className="h-5 w-5" />
          </motion.div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">WellMindly University Portal</span>
            <span className="ml-3 inline-flex px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-extrabold border border-teal-100 uppercase tracking-wider">
              Campus Administration
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
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
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
              <p className="text-xs font-black text-slate-900 leading-none">{user?.firstName || "University"} {user?.lastName || "Admin"}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{user?.email || "admin@university.edu"}</p>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-800 border border-teal-500 shadow-md flex items-center justify-center font-extrabold text-white text-xs cursor-pointer"
            >
              {(user?.firstName?.[0] || "U")}{(user?.lastName?.[0] || "A")}
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
          variants={pageVariants}
          initial="hidden"
          animate="show"
          className="max-w-[1400px] mx-auto space-y-8"
        >
          
          {/* Page Header */}
          <motion.div variants={headerVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Macroscopic Campus Trends</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-1 flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                Strict therapeutic student anonymity enforced. Anonymized cohort matrices only.
              </p>
            </div>
            
            {/* Timeframe Switcher Tablist */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 rounded-2xl p-1 shrink-0 self-start md:self-auto">
              <button 
                onClick={() => setActiveTimeframe("month")}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTimeframe === "month" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
              >
                This Month
              </button>
              <button 
                onClick={() => setActiveTimeframe("quarter")}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTimeframe === "quarter" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
              >
                Last Quarter
              </button>
              <button 
                onClick={() => setActiveTimeframe("ytd")}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTimeframe === "ytd" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
              >
                YTD
              </button>
            </div>
          </motion.div>

          {/* TOP BAR: High-Level Aggregate Metrics */}
          <motion.div 
            variants={gridVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            
            {/* Metric 1: Campus Average Mental Wellness Score with Circular Progress Gauge */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border border-teal-100 self-start w-fit">
                  <TrendingUp className="h-3.5 w-3.5" /> +2.4 pts vs baseline
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Campus Wellness Index</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">68</span>
                    <span className="text-sm font-black text-slate-400">/100</span>
                  </div>
                </div>
              </div>
              
              {/* Premium Circular SVG Progress Bar */}
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg className="h-full w-full rotate-[-90deg]">
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-slate-100 fill-none" 
                    strokeWidth="6" 
                  />
                  <motion.circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-teal-500 fill-none" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "213.6", strokeDashoffset: "213.6" }}
                    animate={{ strokeDashoffset: 213.6 - (213.6 * 68) / 100 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-teal-500" />
                </div>
              </div>
            </motion.div>

            {/* Metric 2: Total Platform Engagement */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border border-indigo-100 self-start w-fit">
                  <TrendingUp className="h-3.5 w-3.5" /> +15.2% this mo
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Total Platform Engagement</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">14,520</span>
                    <span className="text-[10px] font-extrabold text-slate-400">hours logged</span>
                  </div>
                </div>
              </div>
              
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="h-7 w-7" />
              </div>
            </motion.div>

            {/* Metric 3: Critical Intervention Thresholds */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(245 158 11 / 0.08), 0 8px 10px -6px rgb(245 158 11 / 0.08)" }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden transition-shadow"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border border-amber-100 self-start w-fit">
                  <BrainCircuit className="h-3.5 w-3.5" /> Elevated stress markers
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">At-Risk Cohort Ratio</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-amber-600 leading-none tracking-tight">12%</span>
                    <span className="text-xs font-bold text-slate-400">of student population</span>
                  </div>
                </div>
              </div>
              
              <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                <Compass className="h-7 w-7" />
              </div>
              
              {/* Glowing layout corner background */}
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-100 rounded-full blur-2xl opacity-40 pointer-events-none" />
            </motion.div>
          </motion.div>

          {/* Severity Segmentation & Export Controls */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                  <BrainCircuit className="h-5 w-5 text-indigo-600" /> Severity Segmentation
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Distribution of cohort by assessed risk tiers</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white border border-transparent rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </motion.button>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mild (Safe Green) */}
              <div className="relative group p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100 hover:bg-emerald-50 transition-colors cursor-pointer">
                 <div className="flex justify-between items-start mb-4">
                   <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                     <Activity className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">Mild Risk</span>
                 </div>
                 <div className="text-3xl font-black text-slate-900 mb-1">64%</div>
                 <div className="text-xs font-bold text-slate-500">of student cohort</div>
                 
                 <div className="mt-4 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "64%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-emerald-500 rounded-full" />
                 </div>
              </div>
              
              {/* Moderate (Cautionary Yellow) */}
              <div className="relative group p-6 rounded-2xl bg-amber-50/30 border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer">
                 <div className="flex justify-between items-start mb-4">
                   <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                     <AlertTriangle className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">Moderate Risk</span>
                 </div>
                 <div className="text-3xl font-black text-slate-900 mb-1">24%</div>
                 <div className="text-xs font-bold text-slate-500">of student cohort</div>
                 
                 <div className="mt-4 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "24%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-amber-500 rounded-full" />
                 </div>
              </div>
              
              {/* Severe (Escalation Red) */}
              <div className="relative group p-6 rounded-2xl bg-red-50/30 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer">
                 <div className="flex justify-between items-start mb-4">
                   <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                     <ShieldAlert className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2.5 py-1 rounded-lg">Severe Risk</span>
                 </div>
                 <div className="text-3xl font-black text-slate-900 mb-1">12%</div>
                 <div className="text-xs font-bold text-slate-500">of student cohort</div>
                 
                 <div className="mt-4 h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "12%" }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-red-500 rounded-full" />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* MAIN WORKSPACE: Visualizing Macroscopic Trends (NO identifying data) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-teal-600" /> Platform Engagement Trajectory
              </h2>
              <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-slate-300/30">
                Anonymized Aggregated Data
              </span>
            </div>
            
            <div className="p-8">
              {/* Elegant Interactive SVG Bar Chart */}
              <div className="w-full h-80 relative flex items-end justify-between px-2 sm:px-6 pb-8 border-b border-slate-200/80 border-l border-l-slate-200/80 bg-slate-50/20 rounded-bl-lg">
                
                {/* Y-Axis labels */}
                <div className="absolute left-0 top-0 bottom-8 -ml-8 sm:-ml-10 flex flex-col justify-between text-[10px] font-extrabold text-slate-400">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                </div>
                
                {/* Chart Grid Lines */}
                <div className="absolute left-0 right-0 top-0 border-t border-slate-200/40 border-dashed" />
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-200/40 border-dashed" />
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-200/40 border-dashed" />
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-200/40 border-dashed" />

                {/* Animated Bars */}
                {currentChartData.map((height, i) => {
                  const isHovered = hoveredBar === i;
                  return (
                    <div 
                      key={i} 
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="relative w-[10%] flex flex-col items-center justify-end h-full z-10 cursor-pointer"
                    >
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        whileHover={{ scaleX: 1.05 }}
                        transition={{ 
                          height: { type: "spring", stiffness: 100, damping: 15, delay: i * 0.05 },
                          scaleX: { duration: 0.15 }
                        }}
                        style={{
                          boxShadow: isHovered ? "0 10px 25px -5px rgba(20, 184, 166, 0.4)" : "none"
                        }}
                        className={`w-full rounded-t-xl transition-all ${isHovered ? "bg-gradient-to-t from-teal-600 to-teal-400 opacity-100" : "bg-gradient-to-t from-teal-500/80 to-teal-400/80"}`}
                      />
                      
                      {/* Interactive dynamic tooltip with scale bounce */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute -top-14 z-20 bg-slate-900 text-white text-[10px] font-black px-3.5 py-2.5 rounded-2xl pointer-events-none shadow-xl border border-slate-800 flex flex-col items-center gap-1"
                          >
                            <span className="text-slate-400 uppercase tracking-widest font-black text-[8px]">Engagement</span>
                            <span className="text-teal-400 font-extrabold text-sm">{height}%</span>
                            {/* Small Arrow indicator */}
                            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 border-r border-b border-slate-800" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* X-Axis labels */}
                <div className="absolute left-0 right-0 -bottom-8 flex justify-between px-2 sm:px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {chartWeeks.map((week, idx) => (
                    <span key={idx} className="w-[10%] text-center">{week}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Chart Insight Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                <p className="text-xs font-semibold text-slate-500">
                  Campus-wide cohort activity is currently trending <span className="text-teal-600 font-extrabold">upward</span> by 4.2% week-over-week.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Last updated: Just now</span>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
