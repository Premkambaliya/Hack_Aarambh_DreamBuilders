import React, { createElement, useEffect, useState } from "react";
import { dashboardApi } from "../api/api";
import {
  AlertOctagon,
  BarChart3,
  Package,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/* ── Custom tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-[#1a1d35] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700">{label || payload[0]?.payload?._id}</p>
      <p className="mt-0.5 text-orange-600">{payload[0]?.value} occurrence{payload[0]?.value !== 1 ? "s" : ""}</p>
    </div>
  );
};

/* ── Badge ── */
const badgeClassMap = {
  positive: "border-emerald-500/35 bg-emerald-500/12 text-emerald-300",
  negative: "border-rose-500/35 bg-rose-500/12 text-rose-300",
  neutral: "border-amber-400/35 bg-amber-400/12 text-amber-300",
};
const Badge = ({ tone = "neutral", className = "", children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold ${badgeClassMap[tone] || badgeClassMap.neutral} ${className}`}>
    {children}
  </span>
);

/* ── Section card ── */
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-gray-300 ${className}`}>
    {children}
  </div>
);

/* ── Stat card ── */
const StatCard = ({ icon: StatIcon, label, value, gradient }) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
  >
    <div
      className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-gray-900 shadow-lg"
      style={{ background: gradient }}
    >
      {createElement(StatIcon, { size: 20 })}
    </div>
    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{value}</h3>
    <div
      className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-15 blur-2xl"
      style={{ background: gradient }}
    />
  </div>
);

/* ── Detailed Insight Row (Prevents Truncation of AI text) ── */
const InsightRow = ({ text, count, maxCount, gradient, badge }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] hover:border-gray-200">
    <div className="flex items-start justify-between gap-4">
      <p className="text-[0.85rem] font-medium leading-relaxed text-gray-700">{text}</p>
      <Badge tone={badge} className="shrink-0">{count}×</Badge>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ffffff]">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`, background: gradient }}
      />
    </div>
  </div>
);

/* ── Loading skeleton ── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl border border-gray-100 bg-gray-50 ${className}`} />
);

const Insights = ({ token }) => {
  const [competitors, setCompetitors] = useState(null);
  const [calls, setCalls]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.getCompetitors(token), dashboardApi.getCalls(token)])
      .then(([compRes, callsRes]) => {
        setCompetitors(compRes.competitorInsights);
        setCalls(callsRes.calls || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-8 animate-in fade-in duration-300">
        <div className="mb-6">
          <div className="mb-2 h-9 w-52 rounded-xl bg-gray-50" />
          <div className="h-4 w-80 rounded-lg bg-gray-100" />
        </div>
        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    );
  }

  /* ── Aggregation ── */
  const objectionMap = {};
  const signalMap = {};
  const improvementMap = {};

  calls.forEach((call) => {
    const ins = call.aiInsights || {};
    (ins.objections || []).forEach((o) => { objectionMap[o] = (objectionMap[o] || 0) + 1; });
    (ins.buyingSignals || []).forEach((s) => { signalMap[s] = (signalMap[s] || 0) + 1; });
    (ins.improvementsNeeded || []).forEach((im) => { improvementMap[im] = (improvementMap[im] || 0) + 1; });
  });

  const objectionData   = Object.entries(objectionMap).sort((a, b) => b[1] - a[1]).map(([_id, count]) => ({ _id, count }));
  const signalData      = Object.entries(signalMap).sort((a, b) => b[1] - a[1]).map(([_id, count]) => ({ _id, count }));
  const improvementData = Object.entries(improvementMap).sort((a, b) => b[1] - a[1]).map(([_id, count]) => ({ _id, count }));

  const comps      = competitors?.competitorsFrequency || [];
  const advantages = competitors?.topAdvantages || [];

  const totalCalls      = calls.length;
  const avgDealProb     = totalCalls
    ? Math.round(calls.reduce((s, c) => s + (c.aiInsights?.dealProbability || 0), 0) / totalCalls)
    : 0;
  const totalSignals    = signalData.reduce((s, d) => s + d.count, 0);
  const totalObjections = objectionData.reduce((s, d) => s + d.count, 0);

  const emptyState = (msg) => (
    <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
      {msg}
    </div>
  );

  const chartTooltipStyle = {
    contentStyle: { background: "#f8f9fa", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 },
    cursor: { fill: "rgba(255,255,255,0.03)" },
  };

  return (
    <div className="py-8 text-gray-700 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="mb-7">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600">
          <Sparkles size={11} />
          Live conversation intelligence
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Signal Insights</h1>
        <p className="mt-2 text-sm text-gray-500 md:text-base">
          Strategic trends across {totalCalls} analyzed conversations, including objections, buying signals, and competitor pressure.
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BarChart3}   label="Calls Analyzed"    value={totalCalls}      gradient="linear-gradient(135deg,#6C63FF,#8B5CF6)" />
        <StatCard icon={TrendingUp}  label="Avg Deal Prob."    value={`${avgDealProb}%`} gradient="linear-gradient(135deg,#00D4AA,#06B6D4)" />
        <StatCard icon={Zap}         label="Buying Signals"    value={totalSignals}    gradient="linear-gradient(135deg,#10B981,#84CC16)" />
        <StatCard icon={AlertOctagon} label="Total Objections" value={totalObjections} gradient="linear-gradient(135deg,#FB923C,#EF4444)" />
      </div>

      {/* ── Charts: signals + objections ── */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Buying Signals */}
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Top Buying Signals</h3>
                <p className="text-xs text-gray-400">Positive purchase intent indicators</p>
              </div>
            </div>
            <Badge tone="positive" className="ml-auto">{signalData.length} types</Badge>
          </div>
          {signalData.length > 0 ? (
            <div className="flex flex-col gap-3">
              {signalData.slice(0, 5).map((item, i) => (
                <InsightRow key={i} text={item._id} count={item.count} maxCount={signalData[0].count} gradient="linear-gradient(90deg,#00D4AA,#06B6D4)" badge="positive" />
              ))}
            </div>
          ) : emptyState("No buying signals detected yet.")}
        </Card>

        {/* Objections */}
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <TrendingDown size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Customer Objections</h3>
                <p className="text-xs text-gray-400">Pricing, timing & feature concerns</p>
              </div>
            </div>
            <Badge tone="negative" className="ml-auto">{objectionData.length} types</Badge>
          </div>
          {objectionData.length > 0 ? (
            <div className="flex flex-col gap-3">
              {objectionData.slice(0, 5).map((item, i) => (
                <InsightRow key={i} text={item._id} count={item.count} maxCount={objectionData[0].count} gradient="linear-gradient(90deg,#FB923C,#EF4444)" badge="negative" />
              ))}
            </div>
          ) : emptyState("No objections detected yet.")}
        </Card>
      </div>

      {/* ── Improvements ── */}
      {improvementData.length > 0 && (
        <Card className="mb-5">
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                <Package size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Product Improvements Needed</h3>
                <p className="text-xs text-gray-400">Most-requested gaps from customer feedback</p>
              </div>
            </div>
            <Badge tone="neutral">{improvementData.length} requests</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {improvementData.map((item, i) => (
              <InsightRow
                key={i}
                text={item._id}
                count={item.count}
                maxCount={improvementData[0].count}
                gradient="linear-gradient(90deg,#8B5CF6,#D946EF)"
                badge="neutral"
              />
            ))}
          </div>
        </Card>
      )}

      {/* ── Competitors + Advantages ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Competitor mentions */}
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <AlertOctagon size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Competitor Mentions</h3>
                <p className="text-xs text-gray-400">How often alternatives were discussed</p>
              </div>
            </div>
            {comps.length > 0 && <Badge tone="neutral">{comps.length} competitors</Badge>}
          </div>
          {comps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {comps.map((c, i) => (
                <InsightRow
                  key={i}
                  text={c.name}
                  count={c.count}
                  maxCount={comps[0].count}
                  gradient="linear-gradient(90deg,#FFB347,#FF8C42)"
                  badge="neutral"
                />
              ))}
            </div>
          ) : emptyState("No competitor mentions detected yet.")}
        </Card>

        {/* Why customers prefer competitors */}
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <Users size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Why Customers Prefer Competitors</h3>
                <p className="text-xs text-gray-400">Top perceived advantages of competitors</p>
              </div>
            </div>
            {advantages.length > 0 && <Badge tone="negative">{advantages.length} reasons</Badge>}
          </div>
          {advantages.length > 0 ? (
            <div className="flex flex-col gap-3">
              {advantages.map((a, i) => (
                <InsightRow
                  key={i}
                  text={a.advantage}
                  count={a.count}
                  maxCount={advantages[0].count}
                  gradient="linear-gradient(90deg,#FB7185,#EF4444)"
                  badge="negative"
                />
              ))}
            </div>
          ) : emptyState("No competitor advantage data yet.")}
        </Card>
      </div>
    </div>
  );
};

export default Insights;
