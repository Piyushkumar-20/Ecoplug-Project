import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { apiRequest } from "../services/api";

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

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#020b09] px-4">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Main green glow */}
        <div className="absolute -top-52 -left-48 w-[650px] h-[650px] rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Cyan glow */}
        <div className="absolute -bottom-60 -right-48 w-[700px] h-[700px] rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Center soft glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-lime-400/10 blur-3xl" />

        {/* Decorative circular rings */}
        <div className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full border border-emerald-400/25" />

        <div className="absolute -top-36 -left-36 w-[470px] h-[470px] rounded-full border border-lime-300/15" />

        <div className="absolute -bottom-72 -right-64 w-[760px] h-[760px] rounded-full border border-emerald-400/20" />

        <div className="absolute -bottom-60 -right-52 w-[620px] h-[620px] rounded-full border border-cyan-400/15" />

        {/* Bottom dotted / glitter wave */}
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
            WebkitMaskImage:
              "linear-gradient(to top, black, transparent)",
          }}
        />

        {/* Bottom green atmosphere */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-500/10 to-transparent" />

      </div>

      {/* ================= TOP RIGHT BRANDING ================= */}

      <div className="absolute top-7 right-7 sm:top-9 sm:right-10 hidden sm:flex items-center gap-4 text-white/70">

        <div className="text-emerald-400 text-3xl">
          ♧
        </div>

        <div className="h-9 w-px bg-emerald-400/40" />

        <div className="text-sm leading-5">
          <div className="text-white/80">
            Greener Tomorrow
          </div>

          <div className="text-white/80">
            Together
          </div>
        </div>

      </div>

      {/* ================= LOGIN CARD ================= */}

      <div className="relative z-10 w-full max-w-[500px]">

        <div className="relative rounded-[28px] border border-emerald-300/20 bg-white/[0.055] backdrop-blur-2xl shadow-[0_0_70px_rgba(16,185,129,0.10)] px-7 py-8 sm:px-9 sm:py-9">
          {/* Card inner glow */}
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-400/[0.06] via-transparent to-cyan-400/[0.06] pointer-events-none" />

          <div className="relative">

            {/* ================= LOGO ================= */}

            <div className="text-center mb-9">

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">

                <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-cyan-400 bg-clip-text text-transparent">
                  ECOPLUG
                </span>

              </h1>

              <p className="mt-3 text-xs sm:text-sm tracking-[0.30em] text-white/60">
                CONNECT. CHARGE. GROW.
              </p>

            </div>

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div className="relative">

                <Mail
                  size={21}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  required
                  autoComplete="email"
                  className="w-full h-16 pl-16 pr-5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/20 text-white placeholder:text-white/45 outline-none focus:border-emerald-400/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />

              </div>

              {/* PASSWORD */}

              <div className="relative">

                <Lock
                  size={21}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                  className="w-full h-14 pl-16 pr-16 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/20 text-white placeholder:text-white/45 outline-none focus:border-emerald-400/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-emerald-300 transition-colors"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>

              </div>

              {/* ERROR MESSAGE */}

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/25 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-16 rounded-full bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-400 text-white text-lg font-bold shadow-[0_10px_35px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_45px_rgba(16,185,129,0.40)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >

                <span className="flex items-center justify-center gap-3">

                  {loading ? (
                    "Logging in..."
                  ) : (
                    <>
                      Login

                      <ArrowRight
                        size={22}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}

                </span>

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;