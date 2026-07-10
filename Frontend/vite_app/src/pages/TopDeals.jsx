import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api/api";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const sentimentClass = (sentiment) => {
  const normalized = (sentiment || "").toLowerCase();
  if (normalized === "positive") {
    return "border-emerald-500/35 bg-emerald-500/15 text-emerald-300";
  }
  if (normalized === "negative") {
    return "border-rose-500/35 bg-rose-500/15 text-rose-300";
  }
  return "border-amber-400/35 bg-amber-400/12 text-amber-300";
};

const TopDeals = ({ token }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getCalls(token)
      .then((r) => {
        const sorted = [...(r.calls || [])]
          .sort((a, b) => (b.dealProbability || 0) - (a.dealProbability || 0))
          .slice(0, 10);
        setDeals(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="py-8 text-gray-700">
      <div className="mb-4">
        <div>
        <h1 className="text-[1.9rem] font-extrabold text-gray-900">Top Opportunities</h1>
        <p className="mt-1.5 text-[0.95rem] text-gray-500">Prioritized calls ranked by close probability and buying momentum.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-35 animate-pulse rounded-xl border border-gray-100 bg-[linear-gradient(110deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))] bg-size-[200%_100%]"
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center text-gray-500">
          <TrendingUp size={48} className="mb-2 text-gray-400" />
          <p>
            No analyzed calls yet. {" "}
            <Link to="/dashboard/analyze" className="font-medium text-orange-600 hover:text-orange-700">
              Analyze your first call →
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {deals.map((deal, i) => {
            const prob = deal.dealProbability ?? 0;
            const probColor =
              prob >= 70 ? "#34d399"
              : prob >= 40 ? "#fbbf24"
              : "#fb7185";

            return (
              <div key={deal.callId} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-4">
                <div className="absolute right-4 top-4 text-[1.4rem] opacity-15">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/dashboard/calls/${deal.callId}`}
                      className="inline-flex items-center gap-1.5 text-base font-bold text-gray-900 transition hover:text-orange-600"
                    >
                      {deal.callTitle || deal.productName || deal.product_name || "Sales Call"} <ArrowUpRight size={14} />
                    </Link>
                    <p className="mt-1 text-[0.8rem] text-gray-400">
                      {deal.summary?.substring(0, 60)}{deal.summary?.length > 60 ? "..." : ""}
                    </p>

                    <span
                      className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold capitalize ${sentimentClass(deal.sentiment)}`}
                    >
                      {deal.sentiment || "—"}
                    </span>

                    <p className="mt-1.5 text-[0.72rem] capitalize text-sky-400">
                      Type: {deal.callType || "other"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[2rem] font-black leading-none" style={{ color: probColor }}>
                      {prob}%
                    </div>
                    <div className="text-[0.72rem] text-gray-400">Deal Probability</div>
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/12">
                  <div className="h-full rounded-full" style={{ width: `${prob}%`, background: probColor }} />
                </div>

                {deal.aiInsights?.buyingSignals?.length > 0 && (
                  <div className="mt-3">
                    {deal.aiInsights.buyingSignals.slice(0, 2).map((s, j) => (
                      <span
                        key={j}
                        className="mr-1.5 mt-1.5 inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-[0.73rem] font-semibold text-emerald-300"
                      >
                        ✅ {s.substring(0, 40)}{s.length > 40 ? "..." : ""}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-[0.78rem] text-gray-400">
                  {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopDeals;
