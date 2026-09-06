import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Activity,
  TrendingUp,
  ShieldAlert,
  LogOut,
  Bell,
  Settings,
  Compass,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import api, { apiErrorMessage } from "../services/api";
import type { UniversityMetrics } from "../types";

/**
 * Tabs whose figures have no source in the database yet. They are laid out but
 * badged as illustrative, because presenting invented percentages as this
 * campus's data would be a misrepresentation — see tasks/BUGS.md B-156.
 * `overview` is the only tab wired to real aggregates.
 */
const ILLUSTRATIVE_TABS = ["landscape", "warning", "engagement", "outcomes"] as const;

/** A dash, not a zero: an empty fetch must not read as a real measurement of nothing. */
const EM_DASH = "—";

export function UniversityDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'landscape' | 'warning' | 'engagement' | 'outcomes' | 'reports'>('overview');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<"month" | "quarter" | "ytd">("month");

  const [metrics, setMetrics] = useState<UniversityMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<UniversityMetrics>("/university/metrics");
        if (!cancelled) setMetrics(data);
      } catch (err) {
        if (!cancelled) {
          setMetricsError(
            apiErrorMessage(err, "Campus metrics are unavailable. Check your connection and try again.")
          );
        }
      } finally {
        if (!cancelled) setMetricsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Illustrative series behind the Engagement bar chart. Kept only on a badged tab.
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

  // Real campus identity: the endpoint's own value first, the token's domain as a fallback.
  const campusName =
    metrics?.university?.name ||
    (user?.universityDomain ? user.universityDomain.split(".")[0].replace(/^./, (c) => c.toUpperCase()) + " University" : "Your campus");

  const num = (v: number | undefined | null) =>
    typeof v === "number" && Number.isFinite(v) ? v.toLocaleString() : EM_DASH;
  const pct = (v: number | undefined | null) =>
    typeof v === "number" && Number.isFinite(v) ? `${v}%` : EM_DASH;

  const hasMetrics = !!metrics && !metricsError;
  const trend = metrics?.submissionTrend ?? [];
  const trendPeak = trend.reduce((m, p) => Math.max(m, p.count), 0);
  const quizzes = [...(metrics?.quizMetrics ?? [])].sort((a, b) => b.totalSubmissions - a.totalSubmissions);

  // PDF Download Handler
  const handleDownloadSampleReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Colors

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
    doc.text(campusName, 15, 30);
    doc.setFontSize(8);
    doc.text(
      "SAMPLE PACK — sections 1-2 use your live aggregates; sections 3-4 are illustrative.",
      15,
      37
    );

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
    doc.text(
      "Generated: " +
        new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }),
      20,
      67
    );
    doc.text("License Type: Campus-Wide Beta", 20, 72);
    doc.text("Enrolled Students: " + num(metrics?.totalStudents), 110, 67);
    doc.text(
      "Cohort Coverage / Active: " +
        pct(metrics?.participationRate) +
        " (" + num(metrics?.participatingStudents) + " active)",
      110,
      72
    );

    // Section 1: Executive Summary
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("1. Executive Summary", 15, 95);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const summaryText = "WellMindly provides a safe, anonymous precursor to clinical support systems. This report compiles macroscopic, aggregate trends for the cohort named above. Campus administration receives aggregates only: no individual names, emails, check-ins, chat logs or quiz answers are exposed by the reporting API.";
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
    doc.text(num(metrics?.totalSubmissions), 25, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Assessments Completed", 21, 152);

    // Draw engagement card
    doc.setFillColor(241, 245, 249);
    doc.rect(77, 131, 55, 30, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text(pct(metrics?.participationRate), 94, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Student Cohort Coverage", 83, 152);

    // Draw referral card
    doc.setFillColor(241, 245, 249);
    doc.rect(140, 131, 55, 30, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text(num(metrics?.clusterAverage), 157, 144);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Mean Assessment Score", 149, 152);

    // Section 3: Severity Segmentation — illustrative. The stored classification
    // labels come from different instruments and cannot be tiered into one
    // mild/moderate/severe scale without a backend mapping (BUGS.md B-157).
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("3. Severity Segmentation (Risk Distribution)", 15, 175);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text("ILLUSTRATIVE — NOT YOUR COHORT'S FIGURES", 150, 175);

    doc.setFont("Helvetica", "normal");
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

    // Section 4: Key Insights & Recommendations — illustrative narrative. The
    // retention and faculty claims have no measurement behind them; they are
    // examples of the analysis this pack will carry, clearly marked as such.
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(77, 41, 91);
    doc.text("4. Academic Insights & Intervention Strategy", 15, 230);
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text("ILLUSTRATIVE EXAMPLES", 150, 230);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("• Example: stress spikes concentrated around the pre-exam period. Action: launch targeted peer support campaigns the week before.", 15, 237);
    doc.text("• Example: a faculty reporting elevated burnout flags. Action: coordinate with department deans to embed relaxation resources.", 15, 243);
    doc.text("• Example: comparing term retention between engaged and non-engaged cohorts. Requires registry data WellMindly does not hold today.", 15, 249);

    // Real per-assessment figures, if the fetch succeeded.
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(77, 41, 91);
    doc.text("5. Assessment Participation (live aggregates)", 15, 261);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    if (quizzes.length > 0) {
      quizzes.slice(0, 3).forEach((q, i) => {
        // Same scale caveat as the on-screen rows: omit the "of maxScore"
        // denominator when the stored mean is not on that scale.
        const comparable = q.maxScore > 0 && q.averageScore <= q.maxScore;
        doc.text(
          `• ${q.title} — ${q.totalSubmissions} submission(s), mean ${q.averageScore}` +
            (comparable ? ` of ${q.maxScore}` : ""),
          15,
          267 + i * 5
        );
      });
    } else {
      doc.text("• No assessments have been completed by this cohort yet.", 15, 267);
    }

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      ("CONFIDENTIAL · PREPARED FOR " + campusName + " · POWERED BY WELLMINDLY").toUpperCase(),
      15,
      288
    );
    doc.text("Page 1 of 1", 185, 288);

    const slug = campusName.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Campus";
    doc.save(`WellMindly_${slug}_Report.pdf`);
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

  /** Badge for tabs whose figures are not measurements of this cohort. */
  const renderIllustrativeBanner = (what: string) => (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
      <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-black text-amber-900">Illustrative layout — not your campus's data</p>
        <p className="text-[11px] font-semibold text-amber-800/80 mt-1 leading-relaxed">
          {what} WellMindly does not collect it yet, so the figures below are examples of the
          report format. Campus Overview is the tab wired to your live aggregates.
        </p>
      </div>
    </div>
  );

  const renderStatCard = (label: string, value: string, caption: string, accent?: string) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-3xl font-black ${accent || "text-slate-900"}`}>
        {metricsLoading ? <span className="text-slate-300">···</span> : value}
      </div>
      <div className="text-[10px] text-slate-400 font-bold mt-1">{caption}</div>
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
      {metricsError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-rose-900">Campus metrics could not be loaded</p>
            <p className="text-[11px] font-semibold text-rose-800/80 mt-1">{metricsError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {renderStatCard("Enrolled Students", num(metrics?.totalStudents), "Affiliated with your domain")}
        {renderStatCard(
          "Cohort Coverage",
          pct(metrics?.participationRate),
          `${num(metrics?.participatingStudents)} completed ≥1 assessment`,
          "text-teal-600"
        )}
        {renderStatCard("Assessments Completed", num(metrics?.totalSubmissions), "Total submissions to date")}
        {renderStatCard(
          "Instruments Used",
          hasMetrics ? num(quizzes.length) : EM_DASH,
          "Distinct assessments taken"
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Assessment Participation</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Mean score per instrument · aggregate cohort-level only
            </p>
          </div>
          <div className="space-y-4">
            {metricsLoading && <p className="text-xs font-bold text-slate-300">Loading…</p>}
            {!metricsLoading && quizzes.length === 0 && (
              <p className="text-xs font-semibold text-slate-400">
                {hasMetrics
                  ? "No assessments have been completed by this cohort yet."
                  : EM_DASH}
              </p>
            )}
            {quizzes.slice(0, 5).map((q) => {
              // Several quizzes store an overallScore on a different scale from
              // quiz.maxScore, so a mean can exceed its own maximum (BUGS.md B-157).
              // Only draw the ratio and the bar when the two agree.
              const comparable = q.maxScore > 0 && q.averageScore <= q.maxScore;
              return renderProgressBar(
                q.title,
                comparable ? Math.round((q.averageScore / q.maxScore) * 100) : 0,
                comparable ? "bg-teal-500" : "bg-slate-200",
                comparable
                  ? `${q.averageScore} / ${q.maxScore} · ${q.totalSubmissions} sub.`
                  : `${q.totalSubmissions} submission${q.totalSubmissions === 1 ? "" : "s"}`
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Submission Volume</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Assessments completed per day · counts, not wellbeing scores
            </p>
          </div>
          <div className="space-y-4">
            {metricsLoading && <p className="text-xs font-bold text-slate-300">Loading…</p>}
            {!metricsLoading && trend.length === 0 && (
              <p className="text-xs font-semibold text-slate-400">
                {hasMetrics ? "No submissions recorded yet." : EM_DASH}
              </p>
            )}
            {trend.slice(-6).map((p) =>
              renderProgressBar(
                new Date(p.date + "T00:00:00").toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                }),
                trendPeak > 0 ? Math.round((p.count / trendPeak) * 100) : 0,
                "bg-indigo-500",
                `${p.count}`
              )
            )}
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
      className="space-y-6"
    >
      {renderIllustrativeBanner(
        "Theme extraction requires natural-language analysis of student reflections, and a term calendar to align weeks against."
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Top Emotional Themes</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Example theme breakdown</p>
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
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Example intervention calendar</p>
        </div>
        <div className="space-y-4">
          {renderProgressBar("Pre-exam (Week 10)", 91, "bg-rose-500", "Critical Strain")}
          {renderProgressBar("Results Release Week", 76, "bg-amber-500", "Elevated Strain")}
          {renderProgressBar("Mid-term Project Review (Week 6)", 61, "bg-amber-500", "Moderate Strain")}
        </div>
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
      className="space-y-6"
    >
      {renderIllustrativeBanner(
        "Cohort alerting needs year-of-study and faculty on the student record, plus a week-over-week baseline to compare against."
      )}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">Early Warning Alerts</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-1">Example of the cohort-level trends this view will surface</p>
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
      {renderIllustrativeBanner(
        "Coverage windows and repeat-engagement need a term calendar and per-student session history."
      )}
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
      className="space-y-6"
    >
      {renderIllustrativeBanner(
        "Retention and tuition impact require enrolment and withdrawal records from your student registry, which WellMindly is not connected to."
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Term Student Retention Correlation</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Worked example: retention of engaged vs non-engaged cohorts</p>
        </div>
        <div className="space-y-4">
          {renderProgressBar("Engaged Cohort (checked in ≥1×)", 93, "bg-teal-500", "93% Retained")}
          {renderProgressBar("Non-Engaged Control Cohort", 86, "bg-slate-400", "86% Retained")}
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium font-sans">
          * Example figures. Producing this comparison for your campus requires enrolment and
          withdrawal records to be shared with WellMindly; the platform cannot observe retention
          on its own.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Estimated Tuition Saved</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Worked example of the financial model, not a measured result</p>
        </div>
        <div className="py-6 flex flex-col justify-center text-center sm:text-left">
          <div className="text-4xl font-black text-teal-600">$1,420,000</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">
            Example inputs: 71 retained at-risk students × $20,000 average annual tuition.
            Substituting your own retention and tuition figures changes this number.
          </div>
        </div>
        <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100 text-teal-800 text-xs leading-relaxed font-semibold">
          💡 The hypothesis this model tests: proactive peer intervention de-escalates stress
          signals in moderate-risk categories, leading to fewer withdrawals.
        </div>
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
            <h4 className="font-bold text-slate-800 text-xs">{campusName} Wellbeing Report</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 font-sans">
              Anonymized aggregate summary · live figures where available
            </p>
          </div>
          <button
            onClick={handleDownloadSampleReport}
            disabled={metricsLoading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all border-none flex items-center gap-2 cursor-pointer shadow-sm shadow-teal-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{metricsLoading ? "Preparing…" : "Download PDF (A4)"}</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          Sections 1–2 and 5 of the pack carry your live aggregates. Sections 3–4 are marked
          illustrative inside the document, because the underlying data is not collected yet.
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-teal-100">
      
      {/* Top Navigation / App Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/10 cursor-pointer shrink-0"
          >
            <Building2 className="h-5 w-5" />
          </motion.div>
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base truncate">WellMindly University Portal</span>
            <span className="hidden lg:inline-flex shrink-0 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-extrabold border border-teal-100 uppercase tracking-wider">
              Campus Administration
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
            {/* No unread indicator: nothing in this portal produces notifications, so a
                coloured dot would be asserting unread items that do not exist. */}
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
              <p className="text-xs font-black text-slate-900 leading-none">{user?.firstName || "University"} {user?.lastName || "Admin"}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{user?.email || "university@wellmindly.com"}</p>
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
                {campusName}
              </span>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                const illustrative = (ILLUSTRATIVE_TABS as readonly string[]).includes(item.id);
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
                    <span className="flex-1">{item.label}</span>
                    {illustrative && (
                      <span
                        className="text-[8px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0"
                        title="Layout preview — this tab is not wired to live data yet"
                      >
                        Sample
                      </span>
                    )}
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
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate">{user?.email || "university@wellmindly.com"}</p>
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
                  Aggregates only. This portal never receives student names, emails, check-ins,
                  chat logs or individual answers.
                </p>
              </div>

              {/* Timeframe Switcher — only drives the illustrative Engagement chart. */}
              {activeTab === "engagement" && (
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
