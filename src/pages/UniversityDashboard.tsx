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
import { jsPDF } from "jspdf";

export function UniversityDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'landscape' | 'warning' | 'engagement' | 'outcomes' | 'reports'>('overview');
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

  // Sidebar Menu Config
  const menuItems = [
    { id: 'overview' as const, label: 'Campus Overview', icon: Building2 },
    { id: 'landscape' as const, label: 'Emotional Landscape', icon: Activity },
    { id: 'warning' as const, label: 'Early Warning', icon: ShieldAlert },
    { id: 'engagement' as const, label: 'Engagement & Coverage', icon: TrendingUp },
    { id: 'outcomes' as const, label: 'Outcomes & ROI', icon: Compass },
    { id: 'reports' as const, label: 'Reports', icon: Download },
  ];

  // PDF Download Handler
  const handleDownloadSampleReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Colors
    const plum = "#4d295b";
    const teal = "#14b8a6";

    // Header
    doc.setFillColor(77, 41, 91); // Plum
    doc.rect(0, 0, 210, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("WellMindly Campus Analytics", 15, 18);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);
    doc.text("Anonymized aggregate reports for campus administration", 15, 25);
    doc.text("Gulf International University — Spring Cohort", 15, 30);

    // Metadata
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 55, 180, 25, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 55, 180, 25, "S");

    doc.setTextColor(71, 85, 105);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("REPORT METADATA", 20, 61);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Generated: June 2026", 20, 67);
    doc.text("License Type: Campus-Wide Beta", 20, 72);
    doc.text("Total Registered Seats: 8,000", 110, 67);
    doc.text("Cohort Coverage / Active: 61% (4,880 active)", 110, 72);

    // Section 1: Executive Summary
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("1. Executive Summary", 15, 95);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const summaryText = "WellMindly provides a safe, anonymous precursor to clinical support systems. This report compiles macroscopic, aggregate emotional landscape trends. Student identities are protected by strict cryptographic tenant isolation. No individual names, emails, check-ins, or chat logs are ever visible to campus administration.";
    const splitSummary = doc.splitTextToSize(summaryText, 180);
    doc.text(splitSummary, 15, 101);

    // Section 2: Macro-Level Cohort Indicators
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("2. Macro-Level Indicators", 15, 125);

    // Draw score card
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 131, 55, 30, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text("6.8 / 10", 25, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Campus Wellness Index", 21, 152);

    // Draw engagement card
    doc.setFillColor(241, 245, 249);
    doc.rect(77, 131, 55, 30, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text("61%", 94, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Student Cohort Coverage", 83, 152);

    // Draw referral card
    doc.setFillColor(241, 245, 249);
    doc.rect(140, 131, 55, 30, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text("4.2%", 157, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Support Opt-In Rate", 149, 152);

    // Section 3: Severity Segmentation
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("3. Severity Segmentation (Risk Distribution)", 15, 175);

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    // Mild Risk: 64%
    doc.text("Mild Tiers (Safe / Self-Discovery Enabled)", 15, 183);
    doc.setFillColor(224, 242, 254);
    doc.rect(15, 186, 180, 4, "F");
    doc.setFillColor(14, 165, 233);
    doc.rect(15, 186, 180 * 0.64, 4, "F");
    doc.text("64%", 185, 183);

    // Moderate Risk: 24%
    doc.text("Moderate Tiers (Surfacing Peer Coaching Sessions)", 15, 196);
    doc.setFillColor(254, 243, 199);
    doc.rect(15, 199, 180, 4, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(15, 199, 180 * 0.24, 4, "F");
    doc.text("24%", 185, 196);

    // Severe Risk: 12%
    doc.text("Severe Tiers (Helpline Directory Routing)", 15, 209);
    doc.setFillColor(254, 226, 226);
    doc.rect(15, 212, 180, 4, "F");
    doc.setFillColor(239, 68, 68);
    doc.rect(15, 212, 180 * 0.12, 4, "F");
    doc.text("12%", 185, 209);

    // Section 4: Key Insights & Recommendations
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("4. Academic Insights & Intervention Strategy", 15, 230);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("• Stress spikes are concentrated around pre-exam period (Weeks 10-11). Recommended action: launch targeted peer support campaigns in Week 9.", 15, 237);
    doc.text("• Medicine and Engineering faculties report elevated burnout flags. Action: coordinate with department deans to embed relaxation resources.", 15, 243);
    doc.text("• Early onboarding has protected student retention: engaged student cohorts show a 93% term retention vs 86% in control groups.", 15, 249);

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENTIAL · PREPARED FOR GULF INTERNATIONAL UNIVERSITY · POWERED BY WELLMINDLY", 15, 280);
    doc.text("Page 1 of 1", 185, 280);

    doc.save("WellMindly_GIU_Sample_Report.pdf");
  };

  // Helper for progress bar
  const renderProgressBar = (label: string, percentage: number, color: string, rightLabel?: string) => (
    <div className="space-y-1.5" key={label}>
      <div className="flex justify-between text-xs font-bold text-slate-700">
        <span>{label}</span>
        <span className="text-slate-400">{rightLabel || `${percentage}%`}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <motion.div
      key="overview-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cohort Coverage</div>
          <div className="text-3xl font-black text-slate-900">61%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Checked in ≥1× this term</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campus Wellbeing Index</div>
            <div className="text-3xl font-black text-teal-600">6.8 <span className="text-xs text-slate-400">/10</span></div>
            <div className="text-[10px] text-teal-600 font-bold mt-1">▲ 0.3 vs last term</div>
          </div>
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
            <svg className="h-full w-full rotate-[-90deg]">
              <circle cx="24" cy="24" r="20" className="stroke-slate-100 fill-none" strokeWidth="3" />
              <motion.circle 
                cx="24" cy="24" r="20" 
                className="stroke-teal-500 fill-none" 
                strokeWidth="3" 
                strokeLinecap="round"
                initial={{ strokeDasharray: "125.6", strokeDashoffset: "125.6" }}
                animate={{ strokeDashoffset: 125.6 - (125.6 * 68) / 100 }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-4 w-4 text-teal-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Belonging Signal</div>
          <div className="text-3xl font-black text-slate-900">71%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Feel connected to peers</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Support Uptake</div>
          <div className="text-3xl font-black text-slate-900">4.2%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Opted into human support</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Stress by Faculty</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Aggregate cohort-level only</p>
          </div>
          <div className="space-y-4">
            {renderProgressBar("Engineering", 82, "bg-rose-500", "High Strain")}
            {renderProgressBar("Medicine", 74, "bg-amber-500", "Elevated")}
            {renderProgressBar("Business", 58, "bg-amber-500", "Moderate")}
            {renderProgressBar("Arts & Humanities", 41, "bg-teal-500", "Steady")}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Emotional Pulse over the Term</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Average wellbeing index, weekly</p>
          </div>
          <div className="space-y-4">
            {renderProgressBar("Wk 1 — Orientation", 72, "bg-teal-500", "7.2 / 10")}
            {renderProgressBar("Wk 6 — Mid-term", 58, "bg-amber-500", "5.8 / 10")}
            {renderProgressBar("Wk 10 — Pre-exam", 44, "bg-rose-500", "4.4 / 10")}
            {renderProgressBar("Wk 13 — Post-results", 63, "bg-amber-500", "6.3 / 10")}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLandscapeTab = () => (
    <motion.div
      key="landscape-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Top Emotional Themes</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Extracted from anonymized student reflections</p>
        </div>
        <div className="space-y-4">
          {renderProgressBar("Academic Pressure", 88, "bg-indigo-500")}
          {renderProgressBar("Loneliness & Belonging", 64, "bg-indigo-500")}
          {renderProgressBar("Future Uncertainty", 57, "bg-indigo-500")}
          {renderProgressBar("Sleep Quality & Burnout", 49, "bg-indigo-500")}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Peak Pressure Periods</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Recommended campus intervention calendar</p>
        </div>
        <div className="space-y-4">
          {renderProgressBar("Pre-exam (Week 10)", 91, "bg-rose-500", "Critical Strain")}
          {renderProgressBar("Results Release Week", 76, "bg-amber-500", "Elevated Strain")}
          {renderProgressBar("Mid-term Project Review (Week 6)", 61, "bg-amber-500", "Moderate Strain")}
        </div>
      </div>
    </motion.div>
  );

  const renderEarlyWarningTab = () => (
    <motion.div
      key="warning-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">Early Warning Alerts</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-1">Surfaced cohort-level trends to initiate proactive outreach</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px] font-sans">
              <th className="p-4">Cohort</th>
              <th className="p-4">Signal</th>
              <th className="p-4">Trend</th>
              <th className="p-4">Suggested Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr>
              <td className="p-4 font-bold text-slate-900">3rd-year Engineering</td>
              <td className="p-4">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">
                  Stress Spike
                </span>
              </td>
              <td className="p-4 text-rose-600 font-bold">▲ 24% (2 wks)</td>
              <td className="p-4 text-slate-600">Targeted check-in + mindfulness workshop before finals</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">1st-year Undergraduates</td>
              <td className="p-4">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                  Belonging Dip
                </span>
              </td>
              <td className="p-4 text-amber-600 font-bold">▼ 11%</td>
              <td className="p-4 text-slate-600">Deploy peer-connection campaigns in TalkMindly rooms</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">Postgraduate Researchers</td>
              <td className="p-4">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                  Burnout Risk
                </span>
              </td>
              <td className="p-4 text-amber-600 font-bold">▲ 9%</td>
              <td className="p-4 text-slate-600">Send advisor guides and suggest flexible workload options</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderEngagementTab = () => (
    <motion.div
      key="engagement-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Touchpoints / Term</div>
          <div className="text-3xl font-black text-slate-900">3.4</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Average per active student</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orientation Coverage</div>
          <div className="text-3xl font-black text-slate-900">72%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Active first-week signups</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pre-Exam Coverage</div>
          <div className="text-3xl font-black text-slate-900">58%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Activity during Week 10</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Repeat-Engagement</div>
          <div className="text-3xl font-black text-slate-900">46%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Students returning &gt;3 times</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-900">Weekly Engagement Trajectory</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Anonymized touchpoint totals over the term</p>
        </div>
        <div className="w-full h-72 relative flex items-end justify-between px-6 pb-8 border-b border-l border-slate-200">
          <div className="absolute left-0 top-0 bottom-8 -ml-10 flex flex-col justify-between text-[10px] text-slate-400 font-bold">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
          </div>
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
                  className={`w-full rounded-t-xl transition-all ${isHovered ? "bg-gradient-to-t from-teal-600 to-teal-400 opacity-100" : "bg-gradient-to-t from-teal-500/80 to-teal-400/80"}`}
                />
                <AnimatePresence>
                  {isHovered && (
                    <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[10px] font-black px-2 py-1.5 rounded-lg border border-slate-800 flex flex-col items-center">
                      <span>{height}%</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <div className="absolute left-0 right-0 -bottom-8 flex justify-between px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {chartWeeks.map((week, idx) => (
              <span key={idx} className="w-[10%] text-center">{week}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOutcomesTab = () => (
    <motion.div
      key="outcomes-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Term Student Retention Correlation</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Comparing term retention rate of engaged vs non-engaged student cohorts</p>
        </div>
        <div className="space-y-4">
          {renderProgressBar("Engaged Cohort (checked in ≥1×)", 93, "bg-teal-500", "93% Retained")}
          {renderProgressBar("Non-Engaged Control Cohort", 86, "bg-slate-400", "86% Retained")}
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium font-sans">
          * Cohorts are aggregated and normalized. Provides directional insights to assess platform correlation with overall student retention.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Estimated Tuition Saved</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Financial impact of proactive student support and retention gains</p>
        </div>
        <div className="py-6 flex flex-col justify-center text-center sm:text-left">
          <div className="text-4xl font-black text-teal-600">$1,420,000</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">
            Calculated as: retained at-risk student cohorts × average campus tuition rate.
          </div>
        </div>
        <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100 text-teal-800 text-xs leading-relaxed font-semibold">
          💡 Proactive peer intervention de-escalates stress signals in moderate risk categories, leading to fewer student withdrawals and dropouts.
        </div>
      </div>
    </motion.div>
  );

  const renderReportsTab = () => (
    <motion.div
      key="reports-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">Download Aggregate Term Reports</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">A4-formatted executive PDF reporting package for board presentations</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Gulf International University Wellbeing Report</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 font-sans">Spring Semester Cohort · Anonymized Aggregate Summary</p>
          </div>
          <button
            onClick={handleDownloadSampleReport}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all border-none flex items-center gap-2 cursor-pointer shadow-sm shadow-teal-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF (A4)</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

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
              <p className="text-[10px] font-bold text-slate-400 mt-1">{user?.email || "university@wellmindly.edu"}</p>
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
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl bg-slate-50 cursor-pointer border-none"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[9px] font-black text-teal-700 uppercase tracking-widest bg-teal-50 border border-teal-100 px-3 py-1 rounded-full block text-center truncate">
                {user?.university?.name || "Wellmindly University"}
              </span>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none text-left ${
                      active
                        ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-800 border border-teal-500 shadow-md flex items-center justify-center font-extrabold text-white text-xs">
              {(user?.firstName?.[0] || "U")}{(user?.lastName?.[0] || "A")}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-black text-slate-900 leading-none truncate">{user?.firstName || "University"} {user?.lastName || "Admin"}</p>
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate">{user?.email || "university@wellmindly.edu"}</p>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1400px] mx-auto space-y-6"
          >
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                  Strict student anonymity enforced. Cohorts with fewer than 10 students are hidden to protect privacy.
                </p>
              </div>
              
              {/* Timeframe Switcher */}
              {(activeTab === "overview" || activeTab === "landscape" || activeTab === "engagement") && (
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 rounded-xl p-1 shrink-0 self-start sm:self-auto">
                  <button 
                    onClick={() => setActiveTimeframe("month")}
                    className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all cursor-pointer ${activeTimeframe === "month" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setActiveTimeframe("quarter")}
                    className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all cursor-pointer ${activeTimeframe === "quarter" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Quarter
                  </button>
                  <button 
                    onClick={() => setActiveTimeframe("ytd")}
                    className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all cursor-pointer ${activeTimeframe === "ytd" ? "bg-white text-teal-600 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    YTD
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Tab Swiper Indicator */}
            <div className="flex overflow-x-auto gap-2 py-1 md:hidden no-scrollbar border-b border-slate-100 pb-3">
              {menuItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-black shrink-0 cursor-pointer border-none ${
                      active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents viewport */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'landscape' && renderLandscapeTab()}
                {activeTab === 'warning' && renderEarlyWarningTab()}
                {activeTab === 'engagement' && renderEngagementTab()}
                {activeTab === 'outcomes' && renderOutcomesTab()}
                {activeTab === 'reports' && renderReportsTab()}
              </AnimatePresence>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
