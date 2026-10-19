import ecoplugLogo from "../assets/ecopluglogo.svg";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { apiRequest, setAccessToken, clearAccessToken } from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setAccessToken(data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/");
    } catch (error) {
      clearAccessToken();
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#F5F7FA] px-4">

      {/* BACKGROUND — PRESERVED */}
      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute -top-52 -left-48 w-[650px] h-[650px] rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="absolute -bottom-60 -right-48 w-[700px] h-[700px] rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-lime-400/10 blur-3xl" />

        <div className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full border border-emerald-400/25" />

        <div className="absolute -top-36 -left-36 w-[470px] h-[470px] rounded-full border border-lime-300/15" />

        <div className="absolute -bottom-72 -right-64 w-[760px] h-[760px] rounded-full border border-emerald-400/20" />

        <div className="absolute -bottom-60 -right-52 w-[620px] h-[620px] rounded-full border border-cyan-400/15" />

        <div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(16,185,129,0.75) 1.2px, transparent 1.2px),
              radial-gradient(circle, rgba(34,211,238,0.45) 1px, transparent 1px)
            `,
            backgroundSize: "18px 18px, 25px 25px",
            backgroundPosition: "0 0, 9px 9px",
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-500/10 to-transparent" />

      </div>

      {/* TOP RIGHT BRANDING — PRESERVED */}
      <div className="absolute top-7 right-7 sm:top-9 sm:right-10 hidden sm:flex items-center gap-4 text-slate-500">
        <div className="text-emerald-600 text-3xl">
          ♧
        </div>

        <div className="h-9 w-px bg-emerald-500/40" />

        <div className="text-sm leading-5">
          <div>Greener Tomorrow</div>
          <div>Together</div>
        </div>
      </div>

      {/* LOGIN CARD — REDESIGNED */}
      <div className="relative z-10 w-full max-w-[400px]">

        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg px-6 py-8 sm:px-9 sm:py-9">

          {/* BRAND */}
          <div className="text-center mb-8">

            <img
              src={ecoplugLogo}
              alt="Ecoplug Logo"
              className="w-36 h-36 object-contain mx-auto"
            />

            <p className="mt-3 text-xs font-medium tracking-[0.22em] text-slate-500">
              CONNECT. CHARGE. GROW.
            </p>

          </div>

          {/* HEADING */}
          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Log in to Ecoplug
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* FORM — EXISTING BACKEND LOGIC PRESERVED */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-11 pr-12 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Log In
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

          </form>

          {/* FOOTER */}
          <p className="text-center text-xs text-slate-400 mt-7">
            Ecoplug Energy Solutions
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
