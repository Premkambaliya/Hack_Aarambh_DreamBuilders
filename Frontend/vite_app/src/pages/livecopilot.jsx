import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Mic, MicOff, Radio, Zap, Activity, Clock, Wifi, WifiOff, ChevronDown, Volume2,
  Loader2, MessageSquare, AlertTriangle, HelpCircle, TrendingUp, Lightbulb,
  X, Sparkles, Copy, Check, Mail, Target, Shield, ChevronRight, BarChart3,
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

/* ═══ Hint Config ═══ */
const HINT_CONFIG = {
  OBJECTION: { icon: AlertTriangle, label: "Objection Detected", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", borderColor: "rgba(239,68,68,0.4)", bgColor: "rgba(239,68,68,0.08)", textColor: "#fca5a5", accentColor: "#ef4444", glowColor: "rgba(239,68,68,0.25)" },
  QUESTION: { icon: HelpCircle, label: "Customer Question", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", borderColor: "rgba(59,130,246,0.4)", bgColor: "rgba(59,130,246,0.08)", textColor: "#93c5fd", accentColor: "#3b82f6", glowColor: "rgba(59,130,246,0.25)" },
  BUYING_SIGNAL: { icon: TrendingUp, label: "Buying Signal!", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "rgba(16,185,129,0.4)", bgColor: "rgba(16,185,129,0.08)", textColor: "#6ee7b7", accentColor: "#10b981", glowColor: "rgba(16,185,129,0.25)" },
  COACHING: { icon: Lightbulb, label: "Coaching Tip", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderColor: "rgba(245,158,11,0.4)", bgColor: "rgba(245,158,11,0.08)", textColor: "#fcd34d", accentColor: "#f59e0b", glowColor: "rgba(245,158,11,0.25)" },
};
const HINT_DISMISS_MS = 12000;

/* ═══ Keyframes ═══ */
const injectKeyframes = () => {
  if (document.getElementById("copilot-kf")) return;
  const s = document.createElement("style");
  s.id = "copilot-kf";
  s.textContent = `
    @keyframes cp-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.6}}
    @keyframes cp-bar{0%,100%{height:8px}50%{height:var(--bh,30px)}}
    @keyframes cp-spin{to{transform:rotate(360deg)}}
    @keyframes cp-dot{0%,80%,100%{opacity:.3}40%{opacity:1}}
    @keyframes cp-hint-in{0%{opacity:0;transform:translateY(-12px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes cp-hint-bar{0%{width:100%}100%{width:0%}}
    @keyframes cp-fade-in{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
    @keyframes cp-count{0%{transform:scale(1.3);color:#6C63FF}100%{transform:scale(1)}}
    .cp-input:focus{border-color:rgba(108,99,255,.5)!important}
    .cp-scroll::-webkit-scrollbar{width:5px}
    .cp-scroll::-webkit-scrollbar-track{background:transparent}
    .cp-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:10px}
    .cp-hint-x:hover{background:rgba(255,255,255,.12)!important;color:#fff!important}
    .cp-copy-btn:hover{background:rgba(108,99,255,.15)!important;border-color:rgba(108,99,255,.4)!important}
    @media(max-width:940px){.cp-grid{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(s);
};

/* ═══ Sub-Components ═══ */
const Viz = ({ active }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 30, marginTop: 8 }}>
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} style={{ width: 3, borderRadius: 3, background: active ? "linear-gradient(to top,#6C63FF,#00D4AA)" : "rgba(15,23,42,.08)", height: active ? undefined : 5, animation: active ? `cp-bar ${.4 + Math.random() * .6}s ease-in-out infinite alternate ${i * .04}s` : "none", "--bh": `${10 + Math.random() * 22}px`, transition: "background .3s" }} />
    ))}
  </div>
);

const Dots = () => <span>{[0, 1, 2].map((i) => <span key={i} style={{ display: "inline-block", animation: `cp-dot 1.4s ease-in-out ${i * .2}s infinite` }}>•</span>)}</span>;

/* ═══ Hint Card v2 (with Talk Tracks + KB Products) ═══ */
const HintCard = ({ hint, onDismiss }) => {
  const c = HINT_CONFIG[hint.type] || HINT_CONFIG.COACHING;
  const Icon = c.icon;
  const [ttCopied, setTtCopied] = useState(false);
  const dismissTime = hint.talkTrack ? 20000 : HINT_DISMISS_MS; // Longer for talk tracks
  useEffect(() => { const t = setTimeout(onDismiss, dismissTime); return () => clearTimeout(t); }, [onDismiss, dismissTime]);

  const copyTalkTrack = () => {
    navigator.clipboard.writeText(hint.talkTrack);
    setTtCopied(true);
    setTimeout(() => setTtCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", background: c.bgColor, border: `1px solid ${c.borderColor}`, borderRadius: 16, padding: "14px 16px", boxShadow: `0 4px 24px ${c.glowColor}`, animation: "cp-hint-in .4s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
      <button className="cp-hint-x" style={{ position: "absolute", top: 8, right: 8, background: "rgba(15,23,42,.08)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "all .2s" }} onClick={onDismiss}><X size={11} /></button>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: c.gradient, fontSize: ".65rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: ".05em" }}><Icon size={10} />{c.label}</span>
      </div>
      {hint.trigger && <div style={{ fontSize: ".7rem", color: "#64748b", fontStyle: "italic", marginBottom: 5 }}>"{hint.trigger}"</div>}
      <div style={{ fontSize: ".88rem", fontWeight: 600, color: c.textColor, lineHeight: 1.4, marginBottom: 4 }}>{hint.hint}</div>
      {hint.detail && <div style={{ fontSize: ".75rem", color: "#475569", lineHeight: 1.5, marginBottom: 6 }}>{hint.detail}</div>}

      {/* Talk Track — the exact script to say */}
      {hint.talkTrack && (
        <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,.2)", border: `1px solid ${c.borderColor}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: ".68rem", fontWeight: 700, color: c.accentColor, textTransform: "uppercase", letterSpacing: ".06em" }}>💬 Say This:</span>
            <button className="cp-copy-btn" onClick={copyTalkTrack} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", background: "rgba(15,23,42,.04)", color: ttCopied ? "#10b981" : "#475569", fontSize: ".65rem", cursor: "pointer", transition: "all .2s" }}>
              {ttCopied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>
          <div style={{ fontSize: ".82rem", color: "#1f2937", lineHeight: 1.6, fontStyle: "italic" }}>"{hint.talkTrack}"</div>
        </div>
      )}

      {/* KB Products — detailed cards for instant in-call response */}
      {hint.kbProducts && hint.kbProducts.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {hint.kbProducts.map((p, i) => (
            <div key={i} style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(108,99,255,.08)", border: "1px solid rgba(108,99,255,.2)" }}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#c4b5fd", marginBottom: 2 }}>
                {p.name} {p.variant ? `(${p.variant})` : ""}
              </div>
              {p.shortLine && (
                <div style={{ fontSize: ".68rem", color: "#334155", marginBottom: 3, lineHeight: 1.5 }}>
                  {p.shortLine}
                </div>
              )}
              {p.featureLine && (
                <div style={{ fontSize: ".66rem", color: "#475569", lineHeight: 1.5 }}>
                  Key highlights: {p.featureLine}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: c.gradient, borderRadius: "0 0 16px 16px", animation: `cp-hint-bar ${dismissTime}ms linear forwards` }} />
    </div>
  );
};

/* ═══ Post-Session Analytics Dashboard ═══ */
const AnalyticsDashboard = ({ summary, fullTranscript, hints, elapsed, fmtTime }) => {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyTranscript = () => {
    navigator.clipboard.writeText(fullTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmail = () => {
    const email = `Subject: ${summary.followUpEmail?.subject || "Follow-up"}\n\n${summary.followUpEmail?.body || ""}`;
    navigator.clipboard.writeText(email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Hint type counts
  const hintCounts = { OBJECTION: 0, QUESTION: 0, BUYING_SIGNAL: 0, COACHING: 0 };
  hints.forEach((h) => { if (hintCounts[h.type] !== undefined) hintCounts[h.type]++; });
  const totalHints = hints.length || 1;

  const sentimentColors = { positive: "#10b981", neutral: "#f59e0b", negative: "#ef4444" };
  const sentimentColor = sentimentColors[summary.sentiment] || sentimentColors.neutral;

  const cardStyle = {
    background: "rgba(15,23,42,.03)",
    border: "1px solid rgba(15,23,42,.08)",
    borderRadius: 16,
    padding: "18px 20px",
    animation: "cp-fade-in .5s ease",
  };

  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#6C63FF,#00D4AA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(108,99,255,.3)" }}><BarChart3 size={18} color="#fff" /></div>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Session Analytics</div>
            <div style={{ fontSize: ".72rem", color: "#64748b" }}>AI-powered post-call intelligence</div>
          </div>
        </div>
        <button className="cp-copy-btn" onClick={copyTranscript} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(15,23,42,.04)", color: copied ? "#10b981" : "#475569", fontSize: ".78rem", fontWeight: 500, cursor: "pointer", transition: "all .2s" }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Transcript</>}
        </button>
      </div>

      {/* ── Top Metrics Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {/* Sentiment */}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${sentimentColor}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", boxShadow: `0 0 20px ${sentimentColor}33` }}>
            <span style={{ fontSize: "1.1rem" }}>{summary.sentiment === "positive" ? "😊" : summary.sentiment === "negative" ? "😟" : "😐"}</span>
          </div>
          <div style={{ fontSize: ".88rem", fontWeight: 600, color: sentimentColor, textTransform: "capitalize" }}>{summary.sentiment || "Neutral"}</div>
          <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 2 }}>Sentiment</div>
        </div>

        {/* Deal Probability */}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: (summary.dealProbability || 0) >= 60 ? "#10b981" : (summary.dealProbability || 0) >= 30 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>{summary.dealProbability || 0}%</div>
          <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 4 }}>Deal Probability</div>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(15,23,42,.08)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${summary.dealProbability || 0}%`, borderRadius: 2, background: (summary.dealProbability || 0) >= 60 ? "#10b981" : (summary.dealProbability || 0) >= 30 ? "#f59e0b" : "#ef4444", transition: "width 1s ease" }} />
          </div>
        </div>

        {/* Rep Score */}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa", lineHeight: 1 }}>{summary.repPerformance?.score || 0}<span style={{ fontSize: ".9rem", color: "#64748b" }}>/10</span></div>
          <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 4 }}>Rep Performance</div>
          <div style={{ fontSize: ".72rem", color: "#475569", marginTop: 4 }}>{summary.repPerformance?.verdict || ""}</div>
        </div>

        {/* Duration */}
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{fmtTime(elapsed)}</div>
          <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 4 }}>Duration</div>
        </div>
      </div>

      {/* ── Executive Summary ── */}
      <div style={cardStyle}>
        <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#334155", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={14} color="#6C63FF" /> Executive Summary</div>
        <div style={{ fontSize: ".84rem", color: "#475569", lineHeight: 1.7 }}>{summary.executiveSummary || "No summary available."}</div>
      </div>

      {/* ── Two Column: Actions + Hints Breakdown ── */}
      <div className="cp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Action Items */}
        <div style={cardStyle}>
          <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#334155", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Target size={14} color="#10b981" /> Action Items</div>
          {(summary.actionItems || []).length === 0 ? (
            <div style={{ fontSize: ".78rem", color: "#475569" }}>No action items identified.</div>
          ) : (
            (summary.actionItems || []).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 10, background: a.priority === "high" ? "rgba(239,68,68,.06)" : "rgba(15,23,42,.03)", border: `1px solid ${a.priority === "high" ? "rgba(239,68,68,.15)" : "rgba(15,23,42,.06)"}`, marginBottom: 6 }}>
                <span style={{ padding: "1px 6px", borderRadius: 6, fontSize: ".6rem", fontWeight: 700, textTransform: "uppercase", background: a.priority === "high" ? "rgba(239,68,68,.15)" : a.priority === "medium" ? "rgba(245,158,11,.15)" : "rgba(15,23,42,.08)", color: a.priority === "high" ? "#fca5a5" : a.priority === "medium" ? "#fcd34d" : "#475569", whiteSpace: "nowrap", marginTop: 2 }}>{a.priority}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".78rem", color: "#1f2937" }}>{a.action}</div>
                  {a.deadline && <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 2 }}>⏰ {a.deadline}</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Hint Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#334155", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={14} color="#f59e0b" /> AI Hints Breakdown</div>
          {Object.entries(hintCounts).map(([type, count]) => {
            const cfg = HINT_CONFIG[type];
            const pct = Math.round((count / totalHints) * 100);
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bgColor, border: `1px solid ${cfg.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{<cfg.icon size={13} color={cfg.accentColor} />}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: ".72rem", color: "#475569" }}>{cfg.label}</span>
                    <span style={{ fontSize: ".72rem", fontWeight: 700, color: cfg.textColor }}>{count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(15,23,42,.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: cfg.gradient, transition: "width .8s ease" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Next Best Action ── */}
      {summary.nextBestAction && (
        <div style={{ ...cardStyle, background: "rgba(108,99,255,.04)", border: "1px solid rgba(108,99,255,.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <ChevronRight size={16} color="#6C63FF" />
            <span style={{ fontSize: ".84rem", fontWeight: 600, color: "#a78bfa" }}>Next Best Action</span>
          </div>
          <div style={{ fontSize: ".84rem", color: "#1f2937", lineHeight: 1.5 }}>{summary.nextBestAction}</div>
        </div>
      )}

      {/* ── Rep Coaching ── */}
      {summary.repPerformance && (
        <div className="cp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ ...cardStyle, background: "rgba(16,185,129,.03)", border: "1px solid rgba(16,185,129,.1)" }}>
            <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#6ee7b7", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Shield size={13} /> Top Strength</div>
            <div style={{ fontSize: ".82rem", color: "#475569", lineHeight: 1.5 }}>{summary.repPerformance.topStrength || "—"}</div>
          </div>
          <div style={{ ...cardStyle, background: "rgba(239,68,68,.03)", border: "1px solid rgba(239,68,68,.1)" }}>
            <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#fca5a5", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={13} /> Top Improvement</div>
            <div style={{ fontSize: ".82rem", color: "#475569", lineHeight: 1.5 }}>{summary.repPerformance.topImprovement || "—"}</div>
          </div>
        </div>
      )}

      {/* ── Follow-Up Email ── */}
      {summary.followUpEmail && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: ".84rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} color="#3b82f6" /> Follow-Up Email Draft</div>
            <button className="cp-copy-btn" onClick={copyEmail} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "rgba(15,23,42,.04)", color: emailCopied ? "#10b981" : "#475569", fontSize: ".72rem", cursor: "pointer", transition: "all .2s" }}>
              {emailCopied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <div style={{ fontSize: ".75rem", color: "#6C63FF", fontWeight: 600, marginBottom: 6 }}>Subject: {summary.followUpEmail.subject}</div>
          <div style={{ fontSize: ".8rem", color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap", padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,.15)", border: "1px solid rgba(15,23,42,.06)" }}>{summary.followUpEmail.body}</div>
        </div>
      )}

      {/* ── Full Transcript (collapsible) ── */}
      <details style={cardStyle}>
        <summary style={{ fontSize: ".84rem", fontWeight: 600, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Radio size={14} color="#6C63FF" /> Full Transcript</summary>
        <div style={{ fontSize: ".8rem", color: "#475569", lineHeight: 1.8, marginTop: 12, whiteSpace: "pre-wrap" }}>{fullTranscript}</div>
      </details>
    </div>
  );
};

/* ═══ MAIN COMPONENT ═══ */
const LiveCopilot = ({ token }) => {
  const [connected, setConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [chunksCount, setChunksCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [liveStatus, setLiveStatus] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [callType, setCallType] = useState("sales");
  const [transcripts, setTranscripts] = useState([]);
  const [activeHints, setActiveHints] = useState([]);
  const [hintHistory, setHintHistory] = useState([]);
  const [sessionEnded, setSessionEnded] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const monitorIntervalRef = useRef(null);
  const speechStateRef = useRef({ hasSpeech: false, chunkStartedAt: 0, lastSpeechAt: 0 });
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const hintIdRef = useRef(0);

  useEffect(() => { injectKeyframes(); }, []);
  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcripts, liveStatus]);
  useEffect(() => {
    if (sessionActive) { timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [sessionActive]);

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const dismissHint = useCallback((id) => { setActiveHints((p) => p.filter((h) => h.id !== id)); }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;
    const socket = io(`${SOCKET_URL}/copilot`, { auth: { token }, transports: ["websocket"], reconnection: true, reconnectionAttempts: 5 });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("transcript:final", (d) => {
      setTranscripts((p) => [...p, { text: d.text, time: new Date().toLocaleTimeString(), type: "final" }]);
      setLiveStatus("listening");
    });
    socket.on("transcript:status", (d) => setLiveStatus(d.status));
    socket.on("session:ready", () => setLiveStatus("listening"));

    socket.on("copilot:hint", (hint) => {
      const h = { ...hint, id: ++hintIdRef.current };
      setActiveHints((p) => [h, ...p].slice(0, 4));
      setHintHistory((p) => [...p, h]);
    });

    socket.on("session:ended", (d) => {
      setLiveStatus(null);
      setSessionEnded(d);
      setSummaryLoading(true);
    });

    socket.on("session:summary", (d) => {
      setAiSummary(d);
      setSummaryLoading(false);
    });

    socket.on("summary:status", (d) => {
      if (d.status === "failed") setSummaryLoading(false);
    });

    socket.on("error:copilot", (d) => console.error("[Copilot]", d.message));
    socketRef.current = socket;
    return socket;
  }, [token]);

  const stopAudioMonitoring = useCallback(() => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    analyserRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    speechStateRef.current = { hasSpeech: false, chunkStartedAt: 0, lastSpeechAt: 0 };
  }, []);

  // Record continuously and emit a chunk when speech pause is detected.
  const startSilenceAwareRecording = useCallback((socket, stream, mimeType) => {
    if (!stream?.active || !socket?.connected) return;

    const SILENCE_HOLD_MS = 1200;
    const ANALYZE_EVERY_MS = 100;
    const MIN_SPOKEN_CHUNK_MS = 900;
    const MAX_CHUNK_MS = 14000;
    const VOICE_RMS_THRESHOLD = 8;

    const rec = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
    const chunks = [];

    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    rec.onstop = async () => {
      const hadSpeech = speechStateRef.current.hasSpeech;
      stopAudioMonitoring();

      if (hadSpeech && chunks.length > 0 && socket.connected) {
        // Combine into a single complete WebM Blob
        const blob = new Blob(chunks, { type: mimeType });

        // Convert Blob → base64 string (avoids Socket.IO stripping 0x1A bytes)
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        console.log(`[Copilot UI] Sending audio: ${arrayBuffer.byteLength} bytes (base64: ${base64.length} chars)`);
        socket.emit("audio:chunk", base64);
        setChunksCount((c) => c + 1);
      }

      // Start next listening cycle if stream is still active
      if (stream.active && socketRef.current?.connected) {
        setLiveStatus("listening");
        startSilenceAwareRecording(socket, stream, mimeType);
      }
    };

    rec.start(250);
    mediaRecorderRef.current = rec;

    const state = {
      hasSpeech: false,
      chunkStartedAt: Date.now(),
      lastSpeechAt: Date.now(),
    };
    speechStateRef.current = state;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    // Fallback for browsers without WebAudio analyzer support.
    if (!AudioContextClass) {
      setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, 4000);
      return;
    }

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const timeDomainData = new Uint8Array(analyser.fftSize);

    monitorIntervalRef.current = setInterval(() => {
      if (rec.state !== "recording" || !analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(timeDomainData);

      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        const normalized = timeDomainData[i] - 128;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / timeDomainData.length);
      const now = Date.now();
      const elapsed = now - state.chunkStartedAt;
      const isSpeaking = rms >= VOICE_RMS_THRESHOLD;

      if (isSpeaking) {
        state.hasSpeech = true;
        state.lastSpeechAt = now;
        setLiveStatus((prev) => (prev === "processing" ? prev : "speaking"));
      }

      const silenceAfterSpeech =
        state.hasSpeech &&
        now - state.lastSpeechAt >= SILENCE_HOLD_MS &&
        elapsed >= MIN_SPOKEN_CHUNK_MS;

      if (silenceAfterSpeech || elapsed >= MAX_CHUNK_MS) {
        setLiveStatus("processing");
        rec.stop();
      }
    }, ANALYZE_EVERY_MS);
  }, [stopAudioMonitoring]);

  const startSession = useCallback(async () => {
    try {
      const socket = connectSocket();

      // Get mic — NO sampleRate constraint (many devices don't support 16kHz)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Debug: log actual mic settings
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack?.getSettings();
      console.log("[Copilot UI] Mic track:", audioTrack?.label);
      console.log("[Copilot UI] Mic settings:", JSON.stringify(settings));
      console.log("[Copilot UI] Mic enabled:", audioTrack?.enabled, "muted:", audioTrack?.muted);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      console.log("[Copilot UI] Using mimeType:", mimeType);

      socket.emit("session:start", {
        callContext: {
          customerName: customerName || "Unknown",
          productName: productName || "General",
          callType,
        },
      });

      setSessionActive(true); setElapsed(0); setTranscripts([]); setChunksCount(0);
      setActiveHints([]); setHintHistory([]); setSessionEnded(null); setAiSummary(null);
      setSummaryLoading(false); setLiveStatus("listening");

      // Start silence-aware recording cycle (emit on pause)
      startSilenceAwareRecording(socket, stream, mimeType);
    } catch {
      alert("Could not access your microphone. Please allow microphone permissions.");
    }
  }, [connectSocket, customerName, productName, callType, startSilenceAwareRecording]);

  const stopSession = useCallback(() => {
    stopAudioMonitoring();
    // Stop the current recorder (won't trigger a new cycle because stream will be stopped)
    streamRef.current?.getTracks().forEach((t) => t.stop()); // This makes stream.active = false
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop(); // Will send remaining audio
    }
    socketRef.current?.emit("session:stop");
    setSessionActive(false); setLiveStatus(null);
  }, [stopAudioMonitoring]);

  useEffect(() => { return () => { stopSession(); socketRef.current?.disconnect(); }; }, [stopSession]);

  const showAnalytics = !sessionActive && (aiSummary || summaryLoading);

  /* ═══ RENDER ═══ */
  return (
    <div
      style={{
        minHeight: "100%",
        padding: "24px 28px",
        color: "#1f2937",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        background:
          "radial-gradient(circle at 10% 15%, rgba(249,115,22,.08), transparent 30%), radial-gradient(circle at 88% 8%, rgba(251,191,36,.09), transparent 26%), linear-gradient(180deg, #FDFAF1 0%, #FCF7EA 58%, #FAF2E2 100%)",
        borderRadius: 18,
        border: "1px solid rgba(217,194,153,.45)",
        boxShadow: "0 10px 26px rgba(120,94,56,.08)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg,#6C63FF,#00D4AA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 26px rgba(108,99,255,.35)" }}><Zap size={20} color="#fff" /></div>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-.02em" }}>Live Sales Copilot</div>
            <div style={{ fontSize: ".76rem", color: "#475569", marginTop: 1 }}>Real-time AI assistant for your sales calls</div>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: ".76rem", fontWeight: 600, border: `1px solid ${connected ? "rgba(52,211,153,.3)" : "rgba(248,113,113,.3)"}`, background: connected ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.1)", color: connected ? "#34d399" : "#f87171" }}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}{connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Call Context */}
      {!sessionActive && !showAnalytics && (
        <div style={{ background: "rgba(253,250,241,.92)", border: "1px solid rgba(217,194,153,.4)", borderRadius: 16, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: ".86rem", fontWeight: 600, color: "#334155", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><ChevronDown size={15} /> Call Context (optional)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <div><label style={{ fontSize: ".7rem", color: "#6b7280", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>Customer Name</label><input className="cp-input" style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(201,175,132,.45)", background: "#fffdf7", color: "#1f2937", fontSize: ".82rem", outline: "none", boxSizing: "border-box" }} placeholder="e.g. John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
            <div><label style={{ fontSize: ".7rem", color: "#6b7280", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>Product</label><input className="cp-input" style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(201,175,132,.45)", background: "#fffdf7", color: "#1f2937", fontSize: ".82rem", outline: "none", boxSizing: "border-box" }} placeholder="e.g. Enterprise Plan" value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
            <div><label style={{ fontSize: ".7rem", color: "#6b7280", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>Call Type</label><select className="cp-input" style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(201,175,132,.45)", background: "#fffdf7", color: "#1f2937", fontSize: ".82rem", outline: "none", boxSizing: "border-box", appearance: "none" }} value={callType} onChange={(e) => setCallType(e.target.value)}><option value="sales">Sales Call</option><option value="demo">Product Demo</option><option value="followup">Follow-up</option><option value="support">Support Call</option></select></div>
          </div>
        </div>
      )}

      {/* Mic Orb */}
      {!showAnalytics && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 12px" }}>
          <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${sessionActive ? "rgba(108,99,255,.4)" : "rgba(15,23,42,.08)"}`, animation: sessionActive ? "cp-pulse 2s ease-in-out infinite" : "none" }} />
            <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: `1.5px solid ${sessionActive ? "rgba(0,212,170,.25)" : "transparent"}`, animation: sessionActive ? "cp-pulse 2s ease-in-out infinite .5s" : "none" }} />
            <button onClick={sessionActive ? stopSession : startSession} style={{ width: 96, height: 96, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: sessionActive ? "linear-gradient(135deg,#6C63FF,#00D4AA)" : "linear-gradient(135deg,#1e2035,#262a45)", boxShadow: sessionActive ? "0 0 50px rgba(108,99,255,.45)" : "0 8px 30px rgba(0,0,0,.3)", transition: "all .4s cubic-bezier(.4,0,.2,1)", position: "relative", zIndex: 2 }}>
              {sessionActive ? <MicOff size={34} color="#fff" /> : <Mic size={34} color={connected ? "#6C63FF" : "#64748b"} />}
            </button>
          </div>
          <div style={{ marginTop: 14, fontSize: ".82rem", color: "#475569", fontWeight: 500 }}>{sessionActive ? "Listening… click to stop" : "Click the mic to start"}</div>
          <Viz active={sessionActive} />
        </div>
      )}

      {/* Stats */}
      {!showAnalytics && (
        <div style={{ display: "flex", justifyContent: "center", gap: 18, padding: "10px 0", flexWrap: "wrap" }}>
          {[
            { val: fmtTime(elapsed), lbl: "Duration", icon: Clock },
            { val: transcripts.length, lbl: "Transcripts", icon: MessageSquare },
            { val: hintHistory.length, lbl: "AI Hints", icon: Sparkles },
          ].map(({ val, lbl, icon: I }) => (
            <div key={lbl} style={{ background: "rgba(255,253,247,.92)", border: "1px solid rgba(217,194,153,.4)", borderRadius: 12, padding: "11px 20px", textAlign: "center", minWidth: 95 }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{val}</div>
              <div style={{ fontSize: ".66rem", color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 3 }}><I size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />{lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Active Session: Transcript + Hints ═══ */}
      {sessionActive && (
        <div className="cp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 8 }}>
          {/* Transcript */}
          <div className="cp-scroll" style={{ background: "rgba(255,253,247,.9)", border: "1px solid rgba(217,194,153,.4)", borderRadius: 16, padding: "14px 18px", maxHeight: 380, overflowY: "auto" }}>
            <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#334155", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}><Radio size={13} color="#6C63FF" /> Live Transcript</div>
            {transcripts.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(0,212,170,.05)", border: "1px dashed rgba(0,212,170,.2)", fontSize: ".76rem", color: "#00D4AA", fontStyle: "italic" }}>
                <Volume2 size={13} style={{ animation: "cp-pulse 1.5s ease-in-out infinite" }} /> Waiting for speech <Dots />
              </div>
            )}
            {transcripts.map((t, i) => (
              <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(249,115,22,.05)", border: "1px solid rgba(249,115,22,.12)", marginBottom: 5, fontSize: ".8rem", color: "#1f2937", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
                <span style={{ fontSize: ".64rem", color: "#6C63FF", whiteSpace: "nowrap", marginTop: 3, fontWeight: 600, fontFamily: "monospace" }}>{t.time}</span>
                <span style={{ flex: 1 }}>{t.text}</span>
              </div>
            ))}
            {transcripts.length > 0 && liveStatus === "listening" && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, background: "rgba(0,212,170,.04)", border: "1px dashed rgba(0,212,170,.15)", fontSize: ".74rem", color: "#00D4AA", fontStyle: "italic" }}>
                <Volume2 size={12} style={{ animation: "cp-pulse 1.5s ease-in-out infinite" }} /> Listening <Dots />
              </div>
            )}
            {liveStatus === "processing" && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, background: "rgba(108,99,255,.04)", border: "1px dashed rgba(108,99,255,.15)", fontSize: ".74rem", color: "#a78bfa", fontStyle: "italic" }}>
                <Loader2 size={12} style={{ animation: "cp-spin 1s linear infinite" }} /> Processing…
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Hints Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}><Sparkles size={13} color="#f59e0b" /> AI Copilot Hints</div>
            {activeHints.length === 0 ? (
              <div style={{ textAlign: "center", color: "#475569", fontSize: ".78rem", padding: "36px 14px", background: "rgba(255,253,247,.9)", border: "1px dashed rgba(217,194,153,.55)", borderRadius: 16 }}>
                <Sparkles size={18} color="#475569" style={{ marginBottom: 6, display: "block", margin: "0 auto 6px" }} />
                AI hints will appear here when objections, questions, or buying signals are detected.
              </div>
            ) : activeHints.map((h) => <HintCard key={h.id} hint={h} onDismiss={() => dismissHint(h.id)} />)}
          </div>
        </div>
      )}

      {/* ═══ Post-Session Analytics ═══ */}
      {showAnalytics && (
        <>
          {summaryLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 14 }}>
              <Loader2 size={32} color="#6C63FF" style={{ animation: "cp-spin 1s linear infinite" }} />
              <div style={{ fontSize: ".88rem", color: "#475569" }}>Generating AI-powered session analytics...</div>
              <div style={{ fontSize: ".72rem", color: "#475569" }}>This may take a few seconds</div>
            </div>
          )}
          {aiSummary && (
            <AnalyticsDashboard
              summary={aiSummary}
              fullTranscript={sessionEnded?.fullTranscript || ""}
              hints={hintHistory}
              elapsed={elapsed}
              fmtTime={fmtTime}
            />
          )}

          {/* New Session Button */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button onClick={() => { setSessionEnded(null); setAiSummary(null); setSummaryLoading(false); }} style={{ padding: "12px 32px", borderRadius: 12, border: "1px solid rgba(108,99,255,.3)", background: "rgba(108,99,255,.1)", color: "#a78bfa", fontSize: ".88rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
              <Mic size={18} /> Start New Session
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveCopilot;

