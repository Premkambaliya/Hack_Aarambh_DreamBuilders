import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheckBig } from "lucide-react";

const Login = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onChange = (field) => (event) => {
    const value = field === "remember" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (onLogin) {
        await onLogin({
        email: form.email,
        password: form.password,
        remember: form.remember,
        });
      }

      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to login right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-5 relative bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <section className="w-full max-w-[960px] min-h-[620px] grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] rounded-[20px] overflow-hidden border border-gray-200 shadow-xl bg-white">
        
        {/* Intro Sidebar */}
        <aside className="relative p-8 lg:border-r border-b lg:border-b-0 border-gray-100" style={{ background: "linear-gradient(145deg, rgba(249,115,22,0.08), rgba(251,146,60,0.05)), radial-gradient(circle at 80% 20%, rgba(253,186,116,0.2), transparent 36%), #fff7ed" }}>
          {/* Decorative Blur */}
          <div className="absolute w-[220px] h-[220px] rounded-full bg-orange-300/20 blur-[40px] right-[-35px] bottom-[-45px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <strong className="tracking-[0.06em] text-[0.85rem] text-gray-500 uppercase">SalesIQ</strong>
          </div>
          
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-gray-900 leading-[1.15] mb-3">Welcome back to your call intelligence workspace</h2>
          <p className="text-gray-500 max-w-[40ch] mb-6">Continue tracking deal momentum, rep performance, and customer sentiment in real-time.</p>

          <ul className="grid gap-3 mt-5">
            <li className="flex items-start gap-2.5 text-gray-500 text-[0.9rem]"><CircleCheckBig size={15} className="mt-[3px] text-emerald-500" /> Unified call-level timeline and follow-up actions</li>
            <li className="flex items-start gap-2.5 text-gray-500 text-[0.9rem]"><CircleCheckBig size={15} className="mt-[3px] text-emerald-500" /> High-risk call alerts surfaced instantly</li>
            <li className="flex items-start gap-2.5 text-gray-500 text-[0.9rem]"><CircleCheckBig size={15} className="mt-[3px] text-emerald-500" /> AI summaries for faster manager reviews</li>
          </ul>
        </aside>

        {/* Form Area */}
        <div className="p-8 flex flex-col justify-center bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Login</h1>
          <p className="text-gray-500 mb-5">Sign in to continue your analysis workflow.</p>

          <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50/70 p-3.5">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-orange-700">Demo Credentials</p>
            <div className="mt-2 grid gap-2 text-[0.83rem] text-gray-700">
              <div className="rounded-lg border border-orange-100 bg-white px-3 py-2">
                <p className="font-medium text-gray-800">Admin User</p>
                <p>Email: testcompany@gmail.com</p>
                <p>Password: 12345678</p>
              </div>
              <div className="rounded-lg border border-orange-100 bg-white px-3 py-2">
                <p className="font-medium text-gray-800">Employee User</p>
                <p>Email: testemployee@gmail.com</p>
                <p>Password: 12345678</p>
              </div>
            </div>
          </div>

          <form className="grid gap-3.5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-medium text-gray-700" htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-colors"
                placeholder="you@company.com"
                value={form.email}
                onChange={onChange("email")}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-medium text-gray-700" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-colors"
                placeholder="Enter your password"
                value={form.password}
                onChange={onChange("password")}
                required
                minLength={8}
              />
            </div>

            <div className="flex items-center gap-4 mt-[-0.1rem]">
              <label className="inline-flex items-center gap-2 text-gray-500 text-[0.85rem] cursor-pointer" htmlFor="remember">
                <input
                  id="remember"
                  type="checkbox"
                  className="accent-orange-500 w-4 h-4 cursor-pointer"
                  checked={form.remember}
                  onChange={onChange("remember")}
                />
                Remember me
              </label>
            </div>

            {error ? <p className="text-[0.84rem] text-red-500">{error}</p> : null}

            <button className="mt-1.5 w-full rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm shadow-orange-200" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login to Dashboard"}
            </button>
          </form>

          <p className="mt-4 text-gray-500 text-[0.86rem]">
            New here? <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Create an account</Link>
          </p>
          <Link to="/" className="mt-3 inline-block text-gray-400 text-[0.85rem] hover:text-gray-700 transition-colors">Back to landing page</Link>
        </div>
      </section>
    </div>
  );
};

export default Login;