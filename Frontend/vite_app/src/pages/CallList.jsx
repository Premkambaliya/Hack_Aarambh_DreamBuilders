import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Phone, Search, RefreshCw, Calendar, User,
  Smile, Meh, Frown
} from "lucide-react";
import { dashboardApi } from "../api/api";

const SentimentBadge = ({ s }) => {
  const map = {
    positive: {
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: <Smile size={12} />,
      label: "Positive",
    },
    negative: {
      cls: "border-rose-200 bg-rose-50 text-rose-600",
      icon: <Frown size={12} />,
      label: "Negative",
    },
    neutral: {
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      icon: <Meh size={12} />,
      label: "Neutral",
    },
  };
  const m = map[s?.toLowerCase()] || map.neutral;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
      {m.icon} {m.label}
    </span>
  );
};

const UrgencyBadge = ({ urgency }) => {
  if (!urgency) {
    return <span className="text-[0.8rem] text-gray-400">-</span>;
  }

  const normalized = urgency.toLowerCase();
  const className =
    normalized === "high"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : normalized === "low"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold capitalize ${className}`}>
      {normalized}
    </span>
  );
};

const CallList = ({ token }) => {
	const location = useLocation();
	const initialQuery = useMemo(() => new URLSearchParams(location.search).get("q") || "", [location.search]);
  const [calls, setCalls]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(initialQuery);
  const [sentimentFilter, setSentiment] = useState("");
  const [callTypeFilter, setCallType] = useState("");

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getCalls(token);
      setCalls(res.calls || []);
      setFiltered(res.calls || []);
    } catch {
      setCalls([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
	fetchCalls();
  }, [fetchCalls]);

  useEffect(() => {
	setSearch(initialQuery);
  }, [initialQuery]);

  // Client-side filter
  useEffect(() => {
    let data = [...calls];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        (c.callTitle || c.productName || c.product_name || "").toLowerCase().includes(q) ||
        (c.summary || "").toLowerCase().includes(q)
      );
    }
    if (sentimentFilter) {
      data = data.filter(
        (c) => c.sentiment?.toLowerCase() === sentimentFilter.toLowerCase()
      );
    }
    if (callTypeFilter) {
      data = data.filter(
        (c) => (c.callType || "other").toLowerCase() === callTypeFilter.toLowerCase()
      );
    }
    setFiltered(data);
  }, [search, sentimentFilter, callTypeFilter, calls]);

  return (
    <div className="py-8 text-gray-800">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Conversation Library</h1>
          <p className="mt-2 text-sm text-gray-500 md:text-base">Review every analyzed customer conversation with sentiment, risk, and rep performance context.</p>
        </div>
        <Link
          to="/dashboard/analyze"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
        >
          <Phone size={16} /> Analyze New Call
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <div className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3 text-gray-400 shadow-sm">
          <Search size={15} className="shrink-0" />
          <input
            type="text"
            placeholder="Search by account, product, summary, or call title..."
            className="h-10 w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-400 shadow-sm"
          value={sentimentFilter}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select
          className="rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-400 shadow-sm"
          value={callTypeFilter}
          onChange={(e) => setCallType(e.target.value)}
        >
          <option value="">All Call Types</option>
          <option value="sales">Sales</option>
          <option value="service">Service</option>
          <option value="enquiry">Enquiry</option>
          <option value="complaint">Complaint</option>
          <option value="support">Support</option>
          <option value="renewal">Renewal</option>
          <option value="upsell">Upsell</option>
          <option value="other">Other</option>
        </select>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 shadow-sm"
          onClick={fetchCalls}
          type="button"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="grid gap-2.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-gray-200 px-4 py-12 text-center text-gray-400 bg-white">
          <Phone size={48} className="text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">No calls found</h3>
          <p>Adjust your filters or upload a new call.</p>
          <Link
            to="/dashboard/analyze"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
          >
            Analyze Your First Call
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr] items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[0.68rem] uppercase tracking-[0.08em] text-gray-400">
              <span>Product / Summary</span>
              <span>Owner</span>
              <span>Sentiment</span>
              <span>Deal Prob.</span>
              <span>Rep Rating</span>
              <span>Engagement</span>
              <span>Urgency</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            {filtered.map((call, index) => {
              const prob = call.dealProbability || 0;
              const probColor =
                prob >= 70 ? "#10b981"
                : prob >= 40 ? "#f59e0b"
                : "#f43f5e";

              const spRating = call.salespersonRating || call.aiInsights?.salespersonPerformance?.rating || null;
              const spColor = spRating >= 7 ? "#10b981" : spRating >= 5 ? "#f59e0b" : "#f43f5e";

              const engagement = call.customerEngagement || call.aiInsights?.conversationAnalysis?.customerEngagementScore || null;
              const engColor = engagement >= 7 ? "#10b981" : engagement >= 5 ? "#f59e0b" : "#f43f5e";

              const urgency = call.urgencyLevel || call.aiInsights?.conversationAnalysis?.urgencyLevel || null;

              return (
                <div
                  key={call.callId}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr] items-center gap-3 px-4 py-3 text-sm text-gray-600 transition hover:bg-orange-50/50 ${index < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div>
                    <Link
                      to={`/dashboard/calls/${call.callId}`}
                      className="text-[0.875rem] font-bold text-gray-900 transition hover:text-orange-600"
                    >
                      {call.callTitle || call.productName || call.product_name || "Sales Call"}
                    </Link>
                    <p className="mt-0.5 text-[0.78rem] text-gray-400">
                      {call.summary?.substring(0, 70)}{call.summary?.length > 70 ? "..." : ""}
                    </p>
                    <p className="mt-1 text-[0.72rem] capitalize text-orange-500">
                      Type: {call.callType || "other"}
                    </p>
                  </div>

                  <div>
                     <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                       <User size={13} className="text-gray-400"/>
                       {call.employeeName || "Unknown"}
                     </span>
                  </div>

                  <div>
                    <SentimentBadge s={call.sentiment} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.9rem] font-bold" style={{ color: probColor }}>
                        {prob}%
                      </span>
                      <div className="h-1.5 w-17.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${prob}%`, background: probColor }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    {spRating ? (
                      <span className="text-[0.9rem] font-bold" style={{ color: spColor }}>
                        {spRating}/10
                      </span>
                    ) : (
                      <span className="text-[0.8rem] text-gray-400">-</span>
                    )}
                  </div>

                  <div>
                    {engagement ? (
                      <span className="text-[0.9rem] font-bold" style={{ color: engColor }}>
                        {engagement}/10
                      </span>
                    ) : (
                      <span className="text-[0.8rem] text-gray-400">-</span>
                    )}
                  </div>

                  <div>
                    <UrgencyBadge urgency={urgency} />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      ✅ Analyzed
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[0.78rem] text-gray-400">
                    <Calendar size={12} />
                    {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-right text-[0.8rem] text-gray-400">
        Showing {filtered.length} of {calls.length} analyzed calls
      </p>
    </div>
  );
};

export default CallList;
