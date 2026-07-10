import { createElement, useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  DollarSign,
  Download,
  Frown,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Mail,
  Meh,
  MessageSquare,
  Mic2,
  Package,
  Shield,
  Smile,
  Star,
  Swords,
  Target,
  ThumbsUp,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { aiApi, dashboardApi } from '../api/api';

const cardClassName = 'rounded-2xl border border-gray-200 bg-[#ffffff]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md';
const inputClassName = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500/50 focus:bg-gray-100';

const sentimentMap = {
  positive: { label: 'Positive', icon: Smile, className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' },
  neutral: { label: 'Neutral', icon: Meh, className: 'border-amber-500/20 bg-amber-500/10 text-amber-300' },
  negative: { label: 'Negative', icon: Frown, className: 'border-rose-500/20 bg-rose-500/10 text-rose-300' },
};

const getBadgeClassName = (variant) => {
  if (variant === 'positive') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  if (variant === 'negative') return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
  if (variant === 'info') return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';
  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
};

const getBarColor = (score) => {
  if (score >= 7) return '#00D4AA';
  if (score >= 5) return '#FFB347';
  return '#FF6B6B';
};

function Section({ title, icon: Icon, iconColor = '#6C63FF', defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`${cardClassName} overflow-hidden p-0`}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-white/[0.02]"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-center gap-2.5">
          {createElement(Icon, { size: 18, style: { color: iconColor } })}
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>
      {open ? <div className="px-6 pb-6">{children}</div> : null}
    </section>
  );
}

function ListItems({ items, variant = 'info' }) {
  if (!items?.length) {
    return <p className="text-sm text-gray-500">None detected.</p>;
  }

  const rowClassName = getBadgeClassName(variant);

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${rowClassName}`}>
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MeterRing({ value, color, label }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-4xl font-black" style={{ color }}>{value}%</div>
            <div className="mt-1 text-xs text-gray-500">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingRing({ score }) {
  const ringColor = getBarColor(score);
  const angle = Math.max(0, Math.min(100, score * 10));

  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(${ringColor} ${angle}%, rgba(255,255,255,0.06) ${angle}% 100%)` }}
    >
      <div className="absolute inset-2 rounded-full bg-[#ffffff]" />
      <div className="relative z-10 text-center">
        <span className="text-4xl font-black" style={{ color: ringColor }}>{score}</span>
        <span className="text-base text-gray-600">/10</span>
      </div>
    </div>
  );
}

function CallDetail({ token }) {
  const location = useLocation();
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('actions');
  const [metaForm, setMetaForm] = useState({
    callTitle: '',
    callType: 'other',
    productName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const callId = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'call-101';
  }, [location.pathname]);

  // Fetch call details from backend
  useEffect(() => {
    const fetchCallDetails = async () => {
      setLoading(true);
      try {
        const result = await dashboardApi.getCallDetails(callId, token);
        if (result.call) {
          setCall(result.call);
        } else {
          setFeedback({ type: 'error', message: 'Failed to load call details' });
        }
      } catch (error) {
        setFeedback({ type: 'error', message: 'Error loading call details' });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId, token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-8 text-gray-700">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-orange-500" />
          <p>Loading call details...</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-8 text-gray-700">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">Call not found</p>
          <Link to="/dashboard/calls" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10">
            <ArrowLeft size={16} /> Back to Calls
          </Link>
        </div>
      </div>
    );
  }

  const insights = call.aiInsights || {};
  const {
    summary,
    objections = [],
    buyingSignals = [],
    positivePoints = [],
    competitors = [],
    competitorAdvantages = [],
    improvementsNeeded = [],
    productName,
    callTitle,
    callType,
    sentiment = 'neutral',
    dealProbability = 0,
    followUpRecommendation,
    customer = {},
    emailDraft = {},
    salespersonTone = {},
    salespersonPerformance = {},
    conversationAnalysis = {},
    keyMoments = [],
    actionCenter = [],
    objectionPlaybook = [],
    riskLevel = 'medium',
    riskSummary = '',
    dealRecoveryPlan = {},
    competitiveBattleCard = {},
    coachingActions = {},
  } = insights;

  const sentimentConfig = sentimentMap[sentiment] || sentimentMap.neutral;
  const SentimentIcon = sentimentConfig.icon;
  const rating = salespersonPerformance.rating || 5;
  const probabilityColor = getBarColor(Math.round(dealProbability / 10));
  const resolvedMeta = {
    callTitle: call.call_title || callTitle || productName || call.product_name || '',
    callType: call.call_type || callType || 'other',
    productName: call.product_name || productName || '',
    customerName: call.customer_name || customer.name || '',
    customerEmail: call.customer_email || customer.email || '',
    customerPhone: call.customer_phone || customer.phone || '',
  };

  const copyText = async (value, setFlag) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlag(true);
      setFeedback({ type: 'success', message: 'Copied to clipboard.' });
      setTimeout(() => setFlag(false), 1800);
    } catch {
      setFeedback({ type: 'error', message: 'Copy failed in this browser context.' });
    }
  };

  const sendFollowUpEmail = async (forceResend = false) => {
    const emailToUse = (resolvedMeta.customerEmail || '').trim();
    const emailBody = (emailDraft.body || '').trim();

    if (!emailToUse) {
      setFeedback({ type: 'error', message: 'Customer email is missing. Update metadata first.' });
      return;
    }

    if (!emailBody) {
      setFeedback({ type: 'error', message: 'Email draft is empty. Analyze call again to generate template.' });
      return;
    }

    setSendingEmail(true);
    setFeedback(null);

    try {
      const response = await aiApi.sendAnalysisEmail(
        callId,
        {
          to: emailToUse,
          subject: emailDraft.subject || 'Follow-up on our call',
          body: emailBody,
          forceResend,
        },
        token
      );

      setCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customer_email: emailToUse,
          email_subject: emailDraft.subject || prev.email_subject,
          email_delivery: response.delivery || prev.email_delivery,
        };
      });

      setFeedback({ type: 'success', message: forceResend ? 'Email resent successfully.' : 'Email sent successfully.' });
    } catch (error) {
      if (error.status === 409 && !forceResend) {
        const shouldResend = window.confirm('Email already sent for this call. Do you want to resend it?');
        if (shouldResend) {
          await sendFollowUpEmail(true);
        }
      } else {
        setFeedback({ type: 'error', message: error.message || 'Failed to send email.' });
      }
    } finally {
      setSendingEmail(false);
    }
  };
  const emailDelivery = call.email_delivery || {};
  const emailAlreadySent = emailDelivery.status === 'sent';

  const downloadReport = async () => {
    setDownloading(true);
    setFeedback(null);

    try {
      const { blob, fileName } = await dashboardApi.downloadCallReport(callId, token);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setFeedback({ type: 'success', message: 'Report downloaded successfully.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to download report. Please try again.' });
    } finally {
      setDownloading(false);
    }
  };

  const saveMetadata = async () => {
    setSavingMeta(true);
    setTimeout(() => {
      setCall((prev) => prev ? ({
        ...prev,
        call_title: metaForm.callTitle,
        call_type: metaForm.callType,
        product_name: metaForm.productName,
        customer_name: metaForm.customerName,
        customer_email: metaForm.customerEmail,
        customer_phone: metaForm.customerPhone,
      }) : prev);
      setSavingMeta(false);
      setEditMode(false);
      setFeedback({ type: 'success', message: 'Metadata updated locally.' });
    }, 250);
  };

  return (
    <div className="flex flex-col gap-6 py-8 text-gray-700">
      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <Link to="/dashboard/calls" className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Calls
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-gray-900">
              {call.call_title || callTitle || productName || call.product_name || 'Sales Call Analysis'}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5"><Package size={13} /> {productName || 'Product'}</span>
              <span className="inline-flex items-center gap-1.5"><User size={13} /> {call.employeeName || 'Unknown'}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : '—'}</span>
              <span className="inline-flex items-center gap-1.5"><Mic2 size={13} /> {call.fileName || 'audio file'}</span>
              <span className="inline-flex items-center gap-1.5 capitalize">📌 {call.call_type || callType || 'other'} call</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${sentimentConfig.className}`}>
              <SentimentIcon size={14} />
              {sentimentConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
              <CheckCircle2 size={13} /> Analyzed
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={downloadReport}
              disabled={downloading}
            >
              <Download size={14} />
              {downloading ? 'Preparing...' : 'Download Report'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="mb-2 mt-4 flex overflow-x-auto rounded-xl border border-gray-200 bg-[#f8f9fa] p-1.5 md:w-fit">
        {[
          { id: 'actions', label: 'Overview & Actions', icon: Target },
          { id: 'analysis', label: 'Deep Analysis', icon: BarChart3 },
          { id: 'details', label: 'Transcript & Details', icon: Mic2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-orange-500/20 text-orange-600 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analysis' && (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid gap-6 xl:grid-cols-3">
        <section className={cardClassName}>
          <h3 className="mb-2 text-center text-sm font-bold text-gray-900">Deal Probability</h3>
          <MeterRing value={dealProbability} color={probabilityColor} label="Deal Probability" />
          <p className="mt-1 text-center text-xs text-gray-500">
            {dealProbability >= 70 ? 'Prioritize this deal.' : dealProbability >= 40 ? 'Follow up soon.' : 'High risk and needs attention.'}
          </p>
        </section>

        <section className={`${cardClassName} grid grid-cols-2 gap-5`}>
          {[
            { label: 'Buying Signals', value: buyingSignals.length, color: '#00D4AA' },
            { label: 'Objections', value: objections.length, color: '#FF6B6B' },
            { label: 'Competitors', value: competitors.length, color: '#FFB347' },
            { label: 'Liked Points', value: positivePoints.length, color: '#00D4AA' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black" style={{ color: item.color }}>{item.value}</span>
              <span className="mt-1 text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </section>

        <section className={`${cardClassName} flex flex-col items-center justify-center gap-3`}>
          <h3 className="text-center text-sm font-bold text-gray-900">Salesperson Rating</h3>
          <RatingRing score={rating} />
          <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${getBadgeClassName(rating >= 7 ? 'positive' : rating >= 5 ? 'neutral' : 'negative')}`}>
            {rating >= 8 ? 'Excellent' : rating >= 6 ? 'Good' : rating >= 4 ? 'Average' : 'Needs Work'}
          </span>
        </section>
      </div>

      <section className={`${cardClassName} flex flex-col items-center justify-center gap-3 py-7`}>
        <h3 className="text-sm font-bold text-gray-900">Customer Sentiment</h3>
        <div className="text-6xl">{sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐'}</div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${sentimentConfig.className}`}>
          <SentimentIcon size={14} />
          {sentimentConfig.label}
        </span>
      </section>
      </div>)}

      {activeTab === 'actions' && (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── 🎯 ACTION CENTER ── */}
      {actionCenter?.length ? (
        <section className={cardClassName}>
          <div className="mb-4 flex items-center gap-2.5">
            <Target size={18} style={{ color: '#FF6B6B' }} />
            <h3 className="text-lg font-bold text-gray-900">🎯 Action Center</h3>
            <span className="ml-auto inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">{actionCenter.length} actions</span>
          </div>
          <div className="flex flex-col gap-3">
            {actionCenter.map((action, i) => {
              const pColors = {
                critical: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-300', dot: 'bg-rose-400', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]' },
                high: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400', glow: '' },
                medium: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-300', dot: 'bg-cyan-400', glow: '' },
                low: { border: 'border-slate-500/30', bg: 'bg-slate-500/10', text: 'text-gray-600', dot: 'bg-slate-400', glow: '' },
              };
              const c = pColors[action.priority] || pColors.medium;
              return (
                <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-4 ${c.glow}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${c.text}`}>{action.priority}</span>
                    {action.owner === 'manager' ? <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600">MANAGER</span> : null}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{action.action}</p>
                  {action.reason ? <p className="mt-1 text-sm text-gray-600">{action.reason}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {action.template ? (
                      <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-white/20" onClick={() => copyText(action.template, setCopied)}>
                        <Copy size={12} /> Copy Template
                      </button>
                    ) : null}
                    {action.deadline ? <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Clock size={12} /> {action.deadline}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── ⚠️ RISK BANNER ── */}
      {(riskLevel === 'critical' || riskLevel === 'high' || dealProbability < 40) ? (
        <section className={`rounded-2xl border ${riskLevel === 'critical' ? 'border-rose-500/30 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.15)]' : 'border-amber-500/30 bg-amber-500/10'} p-5`}>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className={riskLevel === 'critical' ? 'text-rose-400' : 'text-amber-400'} />
            <h3 className="text-lg font-bold text-gray-900">⚠️ Deal Risk: <span className={`uppercase ${riskLevel === 'critical' ? 'text-rose-300' : 'text-amber-300'}`}>{riskLevel}</span></h3>
          </div>
          {riskSummary ? <p className="mb-3 text-sm text-gray-600">{riskSummary}</p> : null}
          {dealRecoveryPlan?.requiredActions?.length ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Recovery Actions ({dealRecoveryPlan.currentProbability}% → {dealRecoveryPlan.targetProbability}%)</p>
              <ul className="flex flex-col gap-1.5">
                {dealRecoveryPlan.requiredActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {action}
                  </li>
                ))}
              </ul>
              {dealRecoveryPlan.timeline ? <p className="mt-2 text-xs text-gray-500">⏰ {dealRecoveryPlan.timeline}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ── 🛡️ OBJECTION PLAYBOOK ── */}
      {objectionPlaybook?.length ? (
        <Section title="Objection Playbook" icon={Shield} iconColor="#FF6B6B">
          <div className="flex flex-col gap-4">
            {objectionPlaybook.map((obj, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-300" />
                  <span className="text-sm font-bold text-gray-900">"{obj.objection}"</span>
                  <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${obj.severity === 'high' ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : obj.severity === 'low' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}>{obj.severity}</span>
                </div>
                {obj.suggestedResponse ? (
                  <div className="mb-3 rounded-lg border-l-3 border-orange-500 bg-orange-500/5 px-4 py-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">💬 What To Say</p>
                    <p className="text-sm text-gray-700 italic">"{obj.suggestedResponse}"</p>
                  </div>
                ) : null}
                {obj.actionItems?.length ? (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Follow-Up Steps</p>
                    <ul className="flex flex-col gap-1">
                      {obj.actionItems.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {obj.responseTemplate ? (
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-white/20" onClick={() => copyText(obj.responseTemplate, setCopied)}>
                    <Mail size={12} /> Copy Email Template
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── ⚔️ COMPETITIVE BATTLE CARD ── */}
      {competitiveBattleCard?.competitor ? (
        <Section title={`Battle Card: vs ${competitiveBattleCard.competitor}`} icon={Swords} iconColor="#FFB347">
          <div className="flex flex-col gap-4">
            {competitiveBattleCard.winStrategy ? (
              <div className="rounded-lg border-l-3 border-amber-400 bg-amber-500/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">🏆 Win Strategy</p>
                <p className="text-sm text-gray-700">{competitiveBattleCard.winStrategy}</p>
              </div>
            ) : null}
            {competitiveBattleCard.counterPoints?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold text-emerald-300">✅ Your Counter-Arguments</p>
                <ListItems items={competitiveBattleCard.counterPoints} variant="positive" />
              </div>
            ) : null}
            {competitiveBattleCard.talkingPoints?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold text-cyan-300">💬 Talking Points for Customer</p>
                <ListItems items={competitiveBattleCard.talkingPoints} variant="info" />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* ── 🎓 COACHING CORNER ── */}
      {coachingActions?.topSkillGap ? (
        <Section title="Coaching Corner" icon={GraduationCap} iconColor="#A78BFA">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">Skill Gap: {coachingActions.topSkillGap}</span>
            </div>
            {coachingActions.specificIssue ? (
              <div className="rounded-lg border-l-3 border-rose-400 bg-rose-500/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rose-300">❌ What Went Wrong</p>
                <p className="text-sm text-gray-700">{coachingActions.specificIssue}</p>
              </div>
            ) : null}
            {coachingActions.coachingTip ? (
              <div className="rounded-lg border-l-3 border-emerald-400 bg-emerald-500/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">💡 How To Improve</p>
                <p className="text-sm text-gray-700">{coachingActions.coachingTip}</p>
              </div>
            ) : null}
            {coachingActions.practiceExercise ? (
              <div className="rounded-lg border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">🏋️ Practice Exercise</p>
                <p className="text-sm text-gray-700">{coachingActions.practiceExercise}</p>
              </div>
            ) : null}
            {coachingActions.managerSummary ? (
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">👔 Manager Summary</p>
                <p className="text-sm text-gray-700">{coachingActions.managerSummary}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}
      
      {followUpRecommendation ? (
        <Section title="AI Follow-Up Recommendation" icon={Lightbulb} iconColor="#4CC9F0">
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-gray-600">{followUpRecommendation}</div>
        </Section>
      ) : null}

      <Section title="Generated Follow-Up Email" icon={Mail} iconColor="#6C63FF">
        <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm text-gray-600">
          <p><strong>To:</strong> {resolvedMeta.customerEmail || 'No customer email available'}</p>
          <p><strong>Subject:</strong> {emailDraft.subject || 'Follow-up on our call'}</p>
          <pre className="mt-3 max-h-[220px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {emailDraft.body || 'No email draft generated.'}
          </pre>
          {emailAlreadySent ? (
            <p className="mt-3 text-xs text-emerald-300">
              Last sent: {emailDelivery.sentAt ? new Date(emailDelivery.sentAt).toLocaleString() : 'Previously sent'}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10" onClick={() => copyText(`Subject: ${emailDraft.subject || 'Follow-up on our call'}\n\n${emailDraft.body || 'No email draft generated.'}`, setEmailCopied)}>
              {emailCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {emailCopied ? 'Copied' : 'Copy Email'}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => sendFollowUpEmail(false)}
              disabled={sendingEmail || !resolvedMeta.customerEmail || !emailDraft.body}
            >
              <Mail size={14} />
              {sendingEmail ? 'Sending...' : emailAlreadySent ? 'Resend Email' : 'Send Email'}
            </button>
            {(emailDraft.cta || emailDraft.tone) ? (
              <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>
                {emailDraft.tone || 'professional'} | {emailDraft.cta || 'Follow up requested'}
              </span>
            ) : null}
          </div>
        </div>
      </Section>
      </div>)}

      {activeTab === 'analysis' && (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Section title="Conversation Analysis" icon={Activity} iconColor="#4CC9F0">
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="mb-2 text-sm text-gray-500">Talk Ratio</h4>
            <div className="flex h-8 overflow-hidden rounded-xl text-xs font-semibold text-gray-900">
              <div className="flex min-w-[60px] items-center justify-center bg-[#6C63FF] transition-[width] duration-500" style={{ width: `${conversationAnalysis.talkRatioSalesperson || 50}%` }}>
                Rep {conversationAnalysis.talkRatioSalesperson || 50}%
              </div>
              <div className="flex min-w-[60px] items-center justify-center bg-slate-500/70 transition-[width] duration-500" style={{ width: `${conversationAnalysis.talkRatioCustomer || 50}%` }}>
                Customer {conversationAnalysis.talkRatioCustomer || 50}%
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: HelpCircle, value: conversationAnalysis.questionsAskedBySalesperson ?? 0, label: 'Questions by Rep', color: '#6C63FF' },
              { icon: HelpCircle, value: conversationAnalysis.questionsAskedByCustomer ?? 0, label: 'Questions by Customer', color: '#4CC9F0' },
              { icon: Zap, value: conversationAnalysis.urgencyLevel || 'Medium', label: 'Urgency Level', color: conversationAnalysis.urgencyLevel === 'high' ? '#FF6B6B' : conversationAnalysis.urgencyLevel === 'low' ? '#00D4AA' : '#FFB347' },
              { icon: Activity, value: `${conversationAnalysis.customerEngagementScore ?? 5}/10`, label: 'Customer Engagement', color: getBarColor(conversationAnalysis.customerEngagementScore ?? 5) },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/[0.03] px-4 py-3">
                  {createElement(Icon, { size: 18, style: { color: item.color } })}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {conversationAnalysis.keyTopics?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">🏷️ Key Topics</h4>
              <div className="flex flex-wrap gap-2">
                {conversationAnalysis.keyTopics.map((topic) => (
                  <span key={topic} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>{topic}</span>
                ))}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.painPoints?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">🔥 Customer Pain Points</h4>
              <ListItems items={conversationAnalysis.painPoints} variant="negative" />
            </div>
          ) : null}

          {conversationAnalysis.pricingDiscussed && conversationAnalysis.pricingDetails ? (
            <div>
              <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><DollarSign size={16} /> Pricing Discussion</h4>
              <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-gray-600">
                {conversationAnalysis.pricingDetails}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.decisionMakers?.length ? (
            <div>
              <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><Users size={16} /> Decision Makers</h4>
              <div className="flex flex-wrap gap-2">
                {conversationAnalysis.decisionMakers.map((person) => (
                  <span key={person} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('positive')}`}>👤 {person}</span>
                ))}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.actionItems?.length || conversationAnalysis.nextSteps?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {conversationAnalysis.actionItems?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-emerald-300">✅ Action Items</h4>
                  <ListItems items={conversationAnalysis.actionItems} variant="positive" />
                </div>
              ) : null}
              {conversationAnalysis.nextSteps?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-orange-600">➡️ Next Steps</h4>
                  <ListItems items={conversationAnalysis.nextSteps} variant="info" />
                </div>
              ) : null}
            </div>
          ) : null}

          {conversationAnalysis.objectionResponses?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">🛡️ Objection Handling Breakdown</h4>
              <div className="flex flex-col gap-3">
                {conversationAnalysis.objectionResponses.map((item) => (
                  <div key={`${item.objection}-${item.response}`} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-start gap-2 text-sm font-semibold text-gray-900">
                      <AlertTriangle size={14} className="mt-0.5 text-rose-300" />
                      <span>"{item.objection}"</span>
                    </div>
                    <div className="pl-6 text-sm text-gray-600">→ {item.response}</div>
                    <span className={`ml-6 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClassName(item.effectiveness === 'strong' ? 'positive' : item.effectiveness === 'weak' ? 'negative' : 'neutral')}`}>
                      {item.effectiveness === 'strong' ? 'Strong' : item.effectiveness === 'weak' ? 'Weak' : 'Average'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {keyMoments?.length ? (
        <Section title="Key Moments" icon={Zap} iconColor="#F59E0B">
          <div className="flex flex-col gap-3">
            {keyMoments.map((item) => (
              <div key={item.moment} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/[0.03] px-4 py-4">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.impact === 'positive' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : item.impact === 'negative' ? 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'}`} />
                <div className="flex-1">
                  <strong className="block text-sm text-gray-900">{item.moment}</strong>
                  {item.description ? <p className="mt-1 text-sm text-gray-600">{item.description}</p> : null}
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClassName(item.impact === 'positive' ? 'positive' : item.impact === 'negative' ? 'negative' : 'neutral')}`}>
                  {item.impact === 'positive' ? 'Positive' : item.impact === 'negative' ? 'Negative' : 'Neutral'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Buying Signals" icon={TrendingUp} iconColor="#00D4AA">
          <ListItems items={buyingSignals} variant="positive" />
        </Section>
        <Section title="Customer Objections" icon={AlertTriangle} iconColor="#FF6B6B">
          <ListItems items={objections} variant="negative" />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="What Customer Liked" icon={ThumbsUp} iconColor="#00D4AA">
          <ListItems items={positivePoints} variant="positive" />
        </Section>
        <Section title="Improvements Needed" icon={Star} iconColor="#FFB347">
          <ListItems items={improvementsNeeded} variant="neutral" />
        </Section>
      </div>

      {(competitors.length || competitorAdvantages.length) ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Competitor Mentions" icon={Package} iconColor="#FFB347">
            {competitors.length ? (
              <div className="flex flex-wrap gap-2">
                {competitors.map((name) => (
                  <span key={name} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>🏢 {name}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No competitors mentioned.</p>
            )}
          </Section>
          <Section title="Competitor Advantages" icon={Shield} iconColor="#FF6B6B">
            <ListItems items={competitorAdvantages} variant="negative" />
          </Section>
        </div>
      ) : null}

      <div>
        <h2 className="mb-6 flex items-center gap-2 border-t border-gray-200 pt-6 text-2xl font-bold text-orange-600">
          <User size={24} /> Salesperson Analysis Deep Dive
        </h2>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Salesperson Tone Analysis" icon={User} iconColor="#4CC9F0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold capitalize ${getBadgeClassName(salespersonTone.overall === 'aggressive' ? 'negative' : salespersonTone.overall === 'nervous' || salespersonTone.overall === 'passive' ? 'neutral' : salespersonTone.overall === 'friendly' || salespersonTone.overall === 'empathetic' ? 'info' : 'positive')}`}>
                  {salespersonTone.overall || 'neutral'}
                </span>
                {salespersonTone.emotionalIntelligence ? (
                  <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getBadgeClassName(salespersonTone.emotionalIntelligence >= 7 ? 'positive' : salespersonTone.emotionalIntelligence >= 5 ? 'neutral' : 'negative')}`}>
                    EQ Score: {salespersonTone.emotionalIntelligence}/10
                  </span>
                ) : null}
              </div>

              {salespersonTone.breakdown?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-gray-500">Tone Breakdown</h4>
                  <ListItems items={salespersonTone.breakdown} variant="info" />
                </div>
              ) : null}

              {salespersonTone.toneShifts?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-gray-500">🔄 Tone Shifts</h4>
                  <ListItems items={salespersonTone.toneShifts} variant="neutral" />
                </div>
              ) : null}

              {salespersonTone.examples?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-gray-500">Examples from Call</h4>
                  <div className="flex flex-col gap-2">
                    {salespersonTone.examples.map((example) => (
                      <blockquote key={example} className="rounded-r-xl border-l-3 border-orange-500 bg-orange-500/5 px-4 py-3 text-sm italic text-gray-600">
                        "{example}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>

          <Section title="Salesperson Performance Scorecard" icon={BarChart3} iconColor="#6C63FF">
            <div className="flex flex-col gap-4">
              {salespersonPerformance.verdict ? (
                <div className="rounded-r-xl border-l-3 border-orange-500 bg-orange-500/5 px-4 py-4 text-sm leading-7 text-gray-600">
                  {salespersonPerformance.verdict}
                </div>
              ) : null}

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Skill Scores</h4>
                <div className="flex flex-col gap-3">
                  {Object.entries(salespersonPerformance.skills || {}).map(([skill, score]) => {
                    const value = score || 5;
                    const label = skill.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
                    const color = getBarColor(value);
                    return (
                      <div key={skill} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]">
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(value / 10) * 100}%`, background: color }} />
                        </div>
                        <span className="text-right text-xs font-bold" style={{ color }}>{value}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-emerald-300">💪 Strengths</h4>
                  <ListItems items={salespersonPerformance.strengths} variant="positive" />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-rose-300">⚠️ Weaknesses</h4>
                  <ListItems items={salespersonPerformance.weaknesses} variant="negative" />
                </div>
              </div>

              {salespersonPerformance.tips?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-orange-600">💡 Coaching Tips</h4>
                  <ListItems items={salespersonPerformance.tips} variant="info" />
                </div>
              ) : null}

              {salespersonPerformance.missedOpportunities?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-rose-300">🎯 Missed Opportunities</h4>
                  <ListItems items={salespersonPerformance.missedOpportunities} variant="negative" />
                </div>
              ) : null}

              {salespersonPerformance.callPhases && Object.keys(salespersonPerformance.callPhases).length ? (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">📊 Call Phase Scores</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(salespersonPerformance.callPhases).map(([phase, score]) => {
                      const value = score || 5;
                      const label = phase.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
                      const color = getBarColor(value);
                      return (
                        <div key={phase} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]">
                          <span className="text-xs font-medium text-gray-600">{label}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(value / 10) * 100}%`, background: color }} />
                          </div>
                          <span className="text-right text-xs font-bold" style={{ color }}>{value}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>
        </div>
      </div>
      
      </div>)}

      {activeTab === 'details' && (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {summary ? (
        <Section title="AI Conversation Summary" icon={MessageSquare} iconColor="#4CC9F0">
          <p className="rounded-r-xl border-l-3 border-orange-500 bg-orange-500/5 px-4 py-4 text-sm leading-8 text-gray-600">{summary}</p>
        </Section>
      ) : null}

      <Section title="Review Extracted Metadata" icon={Target} iconColor="#6C63FF">
        {!editMode ? (
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-gray-600">
            <p><strong>Call Title:</strong> {resolvedMeta.callTitle || 'Untitled Call'}</p>
            <p className="capitalize"><strong>Call Type:</strong> {resolvedMeta.callType || 'other'}</p>
            <p><strong>Product:</strong> {resolvedMeta.productName || 'Unknown'}</p>
            <p><strong>Customer Name:</strong> {resolvedMeta.customerName || 'Unknown'}</p>
            <p><strong>Customer Email:</strong> {resolvedMeta.customerEmail || 'Not available'}</p>
            <p><strong>Customer Phone:</strong> {resolvedMeta.customerPhone || 'Not available'}</p>
            <div className="mt-3">
              <button
                type="button"
                className="rounded-lg bg-[#6C63FF] px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#5d54f4]"
                onClick={() => {
                  setMetaForm({
                    callTitle: resolvedMeta.callTitle,
                    callType: resolvedMeta.callType,
                    productName: resolvedMeta.productName,
                    customerName: resolvedMeta.customerName,
                    customerEmail: resolvedMeta.customerEmail,
                    customerPhone: resolvedMeta.customerPhone,
                  });
                  setEditMode(true);
                }}
              >
                Edit Metadata
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4">
            <div className="grid gap-3">
              <input className={inputClassName} placeholder="Call title" value={metaForm.callTitle} onChange={(event) => setMetaForm((current) => ({ ...current, callTitle: event.target.value }))} />
              <select className={inputClassName} value={metaForm.callType} onChange={(event) => setMetaForm((current) => ({ ...current, callType: event.target.value }))}>
                <option value="sales">Sales</option>
                <option value="service">Service</option>
                <option value="enquiry">Enquiry</option>
                <option value="complaint">Complaint</option>
                <option value="support">Support</option>
                <option value="renewal">Renewal</option>
                <option value="upsell">Upsell</option>
                <option value="other">Other</option>
              </select>
              <input className={inputClassName} placeholder="Product name" value={metaForm.productName} onChange={(event) => setMetaForm((current) => ({ ...current, productName: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer name" value={metaForm.customerName} onChange={(event) => setMetaForm((current) => ({ ...current, customerName: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer email" value={metaForm.customerEmail} onChange={(event) => setMetaForm((current) => ({ ...current, customerEmail: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer phone" value={metaForm.customerPhone} onChange={(event) => setMetaForm((current) => ({ ...current, customerPhone: event.target.value }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-lg bg-[#6C63FF] px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#5d54f4] disabled:opacity-50" onClick={saveMetadata} disabled={savingMeta}>
                {savingMeta ? 'Saving...' : 'Save Metadata'}
              </button>
              <button type="button" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10" onClick={() => setEditMode(false)} disabled={savingMeta}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Section>

      {call.transcript ? (
        <Section title="Full Transcript" icon={Mic2} defaultOpen={false}>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/10" onClick={() => copyText(call.transcript || '', setCopied)}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Transcript'}
            </button>
            <span className={`ml-auto inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>
              🎙 Groq Whisper large-v3-turbo
            </span>
          </div>
          <pre className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-5 whitespace-pre-wrap text-sm leading-7 text-gray-600">{call.transcript}</pre>
        </Section>
      ) : null}
      </div>)}
    </div>
  );
}

export default CallDetail;