import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  AudioLines,
  ChartSpline,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: AudioLines,
    title: "Upload Any Sales Call",
    desc: "Drop audio files and let AI process every important moment from intro to close.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Deal Signals",
    desc: "Spot objections, buying intent, urgency, and competitor mentions in seconds.",
  },
  {
    icon: ChartSpline,
    title: "Team Performance Dashboard",
    desc: "Track sentiment, conversion probability, and coaching opportunities in one view.",
  },
  {
    icon: Mail,
    title: "Auto Follow-Up Email Drafts",
    desc: "Generate personalized follow-up emails from the conversation context in seconds.",
  },
];

const LandingPage = () => {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-sans text-gray-700"
      style={{ background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 48%, #fffbf5 100%)" }}
    >
      <div className="absolute top-[20%] left-[10%] h-[40vw] w-[40vw] max-h-[600px] max-w-[600px] rounded-full bg-orange-300 opacity-[0.12] blur-[100px] pointer-events-none" />
      <div className="absolute right-[10%] top-[0%] h-[35vw] w-[35vw] max-h-[500px] max-w-[500px] rounded-full bg-amber-300 opacity-[0.12] blur-[100px] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <header className="fixed left-0 right-0 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <h3 className="text-[1.1rem] font-bold text-gray-900">SalesIQ</h3>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#about" className="text-[0.9rem] font-medium text-gray-500 transition-colors hover:text-orange-600">
              About
            </a>
            <a href="#features" className="text-[0.9rem] font-medium text-gray-500 transition-colors hover:text-orange-600">
              Features
            </a>
            <a href="#flow" className="text-[0.9rem] font-medium text-gray-500 transition-colors hover:text-orange-600">
              How It Works
            </a>
            <a href="#security" className="text-[0.9rem] font-medium text-gray-500 transition-colors hover:text-orange-600">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-[0.9rem] font-medium text-gray-600 transition-colors hover:text-orange-600">
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-orange-500 px-4 py-2 text-[0.9rem] font-medium text-white transition-colors hover:bg-orange-600 shadow-sm shadow-orange-200"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-24 lg:px-12">
        <section className="grid grid-cols-1 gap-10 pb-14 pt-16 lg:grid-cols-[1.1fr_0.9fr] md:pt-24">
          <div>
            <p className="mb-3.5 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-orange-500">
              AI Sales Call Intelligence Platform
            </p>

            <h1 className="max-w-[18ch] text-4xl font-extrabold leading-[1.08] text-gray-900 md:text-5xl lg:text-[3.5rem]">
              Turn Raw Sales Calls Into
              <span className="bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#d97706] bg-clip-text text-transparent">
                {" "}
                Revenue Decisions
              </span>
            </h1>

            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-gray-500">
              Analyze every sales conversation with transcription, risk scoring, and coaching insights.
              Your team gets clear next actions, not just call recordings.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-600 shadow-md shadow-orange-200"
              >
                Launch Workspace <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <h4 className="mb-4 text-xl font-semibold text-gray-900">What you get after every call</h4>
            <ul className="space-y-3 text-[0.95rem] text-gray-600">
              <li className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                Structured transcript with key moments highlighted.
              </li>
              <li className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                Clear objection and buying-intent summary for faster follow-up.
              </li>
              <li className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                Practical coaching suggestions reps can use in the next meeting.
              </li>
              <li className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                Team dashboard visibility to improve call quality over time.
              </li>
              <li className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                Auto-generated follow-up email drafts based on discussion context and next steps.
              </li>
            </ul>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              No vanity numbers on landing. Real metrics are shown inside the product dashboard.
            </div>
          </div>
        </section>

        <section id="about" className="pt-20">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">The Problem We Solve</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-orange-500">Problem Statement</p>
                <p className="text-[0.95rem] leading-relaxed text-gray-600">
                  Sales teams spend too much time replaying calls, still miss critical objections, and often lose momentum before follow-up happens.
                </p>
              </article>
              <article className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-emerald-600">What SalesIQ Solves</p>
                <ul className="space-y-2 text-[0.95rem] text-gray-600">
                  <li>Converts raw call recordings into clear insights and next actions.</li>
                  <li>Highlights objections, sentiment shifts, and buying intent for faster decision-making.</li>
                  <li>Creates an auto follow-up email draft from the conversation so reps can respond immediately.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="features" className="pt-20">
          <div className="mb-6">
            <h2 className="max-w-[24ch] text-[1.8rem] font-bold text-gray-900 md:text-3xl">
              Everything your reps need after every call
            </h2>
            <p className="mt-2 max-w-[70ch] text-base text-gray-500">
              Built for sales teams that want faster deal movement and better coaching loops.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-orange-300 hover:shadow-md hover:shadow-orange-50">
                <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-100">
                  {React.createElement(Icon, { size: 18 })}
                </div>
                <h3 className="mb-2 text-[1.1rem] font-bold text-gray-900">{title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-gray-500">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="flow" className="pt-20">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
            <h2 className="text-center text-2xl font-bold text-gray-900 md:text-[1.8rem]">How it works in 3 simple steps</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-orange-50 p-4">
                <span className="mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  01
                </span>
                <h4 className="mb-1.5 text-[1.1rem] font-bold text-gray-900">Upload a Call</h4>
                <p className="text-[0.95rem] text-gray-500">Support common audio formats and start processing instantly.</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-orange-50 p-4">
                <span className="mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  02
                </span>
                <h4 className="mb-1.5 text-[1.1rem] font-bold text-gray-900">AI Analyzes Context</h4>
                <p className="text-[0.95rem] text-gray-500">Extracts sentiment, objections, deal fit, and recommendations.</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-orange-50 p-4">
                <span className="mb-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  03
                </span>
                <h4 className="mb-1.5 text-[1.1rem] font-bold text-gray-900">Act with Confidence</h4>
                <p className="text-[0.95rem] text-gray-500">Use dashboards, risks, and top-deal views for your next action.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="pt-20">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-8 md:flex-row md:items-center shadow-sm">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Built with enterprise-grade security mindset</h2>
              <p className="max-w-[60ch] text-[0.95rem] text-gray-500">
                Encrypted storage, role-based visibility, and controlled data access for your team.
              </p>
            </div>
            <div className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
              <ShieldCheck size={20} />
              <span>Secure by design</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-2 py-24 text-center">
          <h2 className="mb-2 text-[1.8rem] font-bold text-gray-900 md:text-3xl">Ready to analyze your first call?</h2>
          <p className="mb-6 text-[1rem] text-gray-500">Start your workspace in minutes and invite your team later.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-orange-600 shadow-md shadow-orange-200"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
