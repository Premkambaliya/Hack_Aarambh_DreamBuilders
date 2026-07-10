import React, { createElement, useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { productIntelligenceApi } from "../api/api";
import {
  ArrowLeft,
  AlertOctagon,
  BarChart3,
  Package,
  TrendingDown,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Activity,
  Users,
  Zap,
  Phone,
  Star,
  StarHalf,
} from "lucide-react";

/* ── Custom tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-[#1a1d35] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700">{label || payload[0]?.payload?.text || payload[0]?.payload?._id}</p>
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
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
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

/* ── Progress row ── */
const ProgressRow = ({ name, count, maxCount, gradient, badge }) => (
  <div className="flex items-center gap-3">
    <span className="w-40 shrink-0 truncate text-[0.82rem] text-gray-600">{name}</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`, background: gradient }}
      />
    </div>
    <Badge tone={badge}>{count}×</Badge>
  </div>
);

/* ── Loading skeleton ── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl border border-gray-100 bg-gray-50 ${className}`} />
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

const sentimentIcons = { positive: Smile, negative: Frown, neutral: Meh };
const sentimentGradients = {
  positive: "linear-gradient(135deg,#00D4AA,#06B6D4)",
  negative: "linear-gradient(135deg,#FB923C,#EF4444)",
  neutral: "linear-gradient(135deg,#F59E0B,#FCD34D)",
};

const ProductIntelligence = ({ product, token, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?._id) return;

    setLoading(true);
    setError(null);

    productIntelligenceApi
      .getProductIntelligence(product._id, token)
      .then((res) => {
        if (!res || !res.success) {
          setError("Could not load product intelligence.");
          return;
        }
        setData(res);
      })
      .catch(() => setError("Failed to connect to intelligence API."))
      .finally(() => setLoading(false));
  }, [product, token]);

  if (loading) {
    return (
      <div className="py-2 animate-in fade-in duration-300">
        <div className="mb-6">
          <div className="mb-2 h-9 w-52 rounded-xl bg-gray-50" />
          <div className="h-4 w-80 rounded-lg bg-gray-100" />
        </div>
        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 flex flex-col gap-4">
        <button onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Products
        </button>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
          {error || "No intelligence data available."}
        </div>
      </div>
    );
  }

  /* ── Extract data from backend response ── */
  const { summary, insights, recentCalls } = data;
  const prod = data.product || product;

  const totalCalls = summary.totalCalls;
  const avgDealProb = summary.avgDealProbability;
  const avgRepRating = summary.avgRepRating;
  const productRating = summary.overallProductRating;
  const avgEngagement = summary.avgCustomerEngagement;
  const sent = summary.sentiment || {};
  const domSentiment = sent.dominant || "neutral";
  const DomSentIcon = sentimentIcons[domSentiment] || Meh;
  const domGradient = sentimentGradients[domSentiment] || sentimentGradients.neutral;

  const topObjections = insights.topObjections || [];
  const topPositive = insights.topPositivePoints || [];
  const topBuyingSignals = insights.topBuyingSignals || [];
  const topImprovements = insights.topImprovements || [];
  const topCompetitors = insights.topCompetitors || [];
  const compAdvantages = insights.competitorAdvantages || [];
  const callTypeDist = summary.callTypeDistribution || [];

  // Pie chart: sentiment
  const sentimentPieData = [
    { name: "Positive", value: sent.positive || 0, color: "#00D4AA" },
    { name: "Negative", value: sent.negative || 0, color: "#FF6B6B" },
    { name: "Neutral", value: sent.neutral || 0, color: "#FFB347" },
  ].filter(d => d.value > 0);

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
    <div className="py-2 text-gray-700 animate-in fade-in duration-300 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600">
            <Package size={11} /> Product Intelligence
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">{prod.productName}</h1>
          {prod.category && <span className="mt-1 inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] uppercase font-bold text-orange-600">{prod.category}</span>}
          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Server-aggregated intelligence from <strong className="text-gray-900">{totalCalls}</strong> related conversations.
          </p>
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard icon={Phone}       label="Total Calls"      value={totalCalls}            gradient="linear-gradient(135deg,#6C63FF,#8B5CF6)" />
        <StatCard icon={Activity}    label="Avg Deal Prob."    value={`${avgDealProb}%`}     gradient="linear-gradient(135deg,#8B5CF6,#D946EF)" />
        <StatCard icon={DomSentIcon} label="Overall Sentiment" value={domSentiment.charAt(0).toUpperCase() + domSentiment.slice(1)} gradient={domGradient} />
        <StatCard icon={StarHalf}    label="Product Rating"    value={`${productRating}/10`} gradient="linear-gradient(135deg,#F59E0B,#EF4444)" />
        <StatCard icon={Star}        label="Avg Rep Rating"    value={`${avgRepRating}/10`}     gradient="linear-gradient(135deg,#10B981,#84CC16)" />
        <StatCard icon={Users}       label="Engagement"  value={`${avgEngagement}/10`} gradient="linear-gradient(135deg,#06B6D4,#3B82F6)" />
      </div>

      {/* ── Sentiment Pie + Call Type Distribution ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-bold text-gray-900">Sentiment Distribution</h3>
          {sentimentPieData.length > 0 ? (
            <div className="flex items-center justify-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={sentimentPieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {sentimentPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#f8f9fa", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {sentimentPieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : emptyState("No sentiment data.")}
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-bold text-gray-900">Call Type Breakdown</h3>
          {callTypeDist.length > 0 ? (
            <div className="flex flex-col gap-3">
              {callTypeDist.map((item, i) => (
                <ProgressRow
                  key={i}
                  name={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  count={item.count}
                  maxCount={callTypeDist[0].count}
                  gradient="linear-gradient(90deg,#6C63FF,#8B5CF6)"
                  badge="neutral"
                />
              ))}
            </div>
          ) : emptyState("No call type data.")}
        </Card>
      </div>

      {/* ── Charts: Positives + Objections ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Positive Points */}
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">What Customers Love</h3>
                <p className="text-xs text-gray-400">Top discussed positive points</p>
              </div>
            </div>
            <Badge tone="positive" className="ml-auto">{topPositive.length} themes</Badge>
          </div>
          {topPositive.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topPositive.slice(0, 5).map((item, i) => (
                <InsightRow key={i} text={item.text} count={item.count} maxCount={topPositive[0].count} gradient="linear-gradient(90deg,#00D4AA,#06B6D4)" badge="positive" />
              ))}
            </div>
          ) : emptyState("No positive themes captured yet.")}
        </Card>

        {/* Objections */}
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <TrendingDown size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Main Objections</h3>
                <p className="text-xs text-gray-400">Recurring friction & pushbacks</p>
              </div>
            </div>
            <Badge tone="negative" className="ml-auto">{topObjections.length} risks</Badge>
          </div>
          {topObjections.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topObjections.slice(0, 5).map((item, i) => (
                <InsightRow key={i} text={item.text} count={item.count} maxCount={topObjections[0].count} gradient="linear-gradient(90deg,#FB923C,#EF4444)" badge="negative" />
              ))}
            </div>
          ) : emptyState("No objections on record.")}
        </Card>
      </div>

      {/* ── Buying Signals ── */}
      {topBuyingSignals.length > 0 && (
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400"><Zap size={17} /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Buying Signals Detected</h3>
                <p className="text-xs text-gray-400">Purchase-intent indicators across conversations</p>
              </div>
            </div>
            <Badge tone="positive">{topBuyingSignals.length} signals</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {topBuyingSignals.slice(0, 8).map((item, i) => (
              <InsightRow key={i} text={item.text} count={item.count} maxCount={topBuyingSignals[0].count} gradient="linear-gradient(90deg,#00D4AA,#06B6D4)" badge="positive" />
            ))}
          </div>
        </Card>
      )}

      {/* ── Improvements ── */}
      {topImprovements.length > 0 && (
        <Card>
          <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500"><Package size={17} /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Suggested Product Improvements</h3>
                <p className="text-xs text-gray-400">Most requested changes from customer feedback</p>
              </div>
            </div>
            <Badge tone="neutral">{topImprovements.length} requests</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {topImprovements.slice(0, 8).map((item, i) => (
              <InsightRow key={i} text={item.text} count={item.count} maxCount={topImprovements[0].count} gradient="linear-gradient(90deg,#8B5CF6,#D946EF)" badge="neutral" />
            ))}
          </div>
        </Card>
      )}

      {/* ── Competitors ── */}
      {(topCompetitors.length > 0 || compAdvantages.length > 0) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400"><AlertOctagon size={17} /></div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Competitor Mentions</h3>
                  <p className="text-xs text-gray-400">How often alternatives were discussed</p>
                </div>
              </div>
              {topCompetitors.length > 0 && <Badge tone="neutral">{topCompetitors.length} competitors</Badge>}
            </div>
            {topCompetitors.length > 0 ? (
              <div className="flex flex-col gap-3">
                {topCompetitors.map((c, i) => (
                  <InsightRow key={i} text={c.text} count={c.count} maxCount={topCompetitors[0].count} gradient="linear-gradient(90deg,#FFB347,#FF8C42)" badge="neutral" />
                ))}
              </div>
            ) : emptyState("No competitor mentions.")}
          </Card>
          <Card>
            <div className="mb-5 flex items-start flex-wrap gap-4 justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400"><Users size={17} /></div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Competitor Advantages</h3>
                  <p className="text-xs text-gray-400">Why customers considered alternatives</p>
                </div>
              </div>
              {compAdvantages.length > 0 && <Badge tone="negative">{compAdvantages.length} reasons</Badge>}
            </div>
            {compAdvantages.length > 0 ? (
              <div className="flex flex-col gap-3">
                {compAdvantages.map((a, i) => (
                  <InsightRow key={i} text={a.text} count={a.count} maxCount={compAdvantages[0].count} gradient="linear-gradient(90deg,#FB7185,#EF4444)" badge="negative" />
                ))}
              </div>
            ) : emptyState("No competitor advantage data.")}
          </Card>
        </div>
      )}

      {/* ── Recent Calls for this Product ── */}
      {recentCalls && recentCalls.length > 0 && (
        <Card>
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400"><Phone size={17} /></div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Conversations</h3>
              <p className="text-xs text-gray-400">Latest calls related to this product</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-3 pr-4">Call</th>
                  <th className="py-3 pr-4">Employee</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Sentiment</th>
                  <th className="py-3 pr-4">Deal %</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => {
                  const sKey = (call.sentiment || "neutral").toLowerCase();
                  const sClass = badgeClassMap[sKey] || badgeClassMap.neutral;
                  return (
                    <tr key={call.callId} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-medium text-gray-700">{call.callTitle}</td>
                      <td className="py-3 pr-4 text-gray-500">{call.employeeName}</td>
                      <td className="py-3 pr-4 text-gray-500">{call.customerName}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold capitalize ${sClass}`}>{sKey}</span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-gray-700">{call.dealProbability}%</td>
                      <td className="py-3 text-gray-400">{call.createdAt ? new Date(call.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductIntelligence;
