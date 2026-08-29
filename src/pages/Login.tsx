import React, { useState, type FormEvent, type CSSProperties } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, AlertCircle, CheckCircle2, Loader2, X, Building2 } from "lucide-react";
import api, { apiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Role = "admin" | "university";

const ACCENT: Record<Role, string> = {
  admin: "var(--accent-admin)",
  university: "var(--accent-university)",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const [role, setRole] = useState<Role>("admin");
  const [mode, setMode] = useState<'login' | 'forgot-password'>('login');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const clearGlobal = () => globalError && setGlobalError(null);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendResetOtp = async () => {
    setGlobalError(null);
    const next: { email?: string } = {};
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setResetOtpSent(true);
    } catch (err: any) {
      setGlobalError(apiErrorMessage(err, "Failed to send reset code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setGlobalError(null);
    const next: { email?: string; password?: string; otp?: string } = {};
    const e = email.trim();
    if (!e) next.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) next.email = "Enter a valid email address.";
    
    if (!password) next.password = "New password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    
    if (!otp.trim()) next.otp = "Verification code is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword: password, 
        role: role === 'admin' ? 'ADMIN' : 'UNIVERSITY' 
      });
      setGlobalError(null);
      setGlobalSuccess("Password has been reset successfully! Please sign in with your new password.");
      setMode('login');
      setResetOtpSent(false);
      setOtp("");
      setPassword("");
    } catch (err: any) {
      setGlobalError(apiErrorMessage(err, "Failed to reset password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setGlobalError(null);
    
    if (mode === 'forgot-password') {
      if (!resetOtpSent) {
        await handleSendResetOtp();
      } else {
        await handleResetPassword();
      }
      return;
    }

    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role: role === 'admin' ? 'ADMIN' : 'UNIVERSITY'
      });
      
      const { token, user } = response.data;
      loginSuccess(token, user);
      navigate('/dashboard'); // redirect on success
    } catch (err: any) {
      setGlobalError(apiErrorMessage(err, "Incorrect or invalid credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = ACCENT[role];
  const accentStyle = { "--accent": accentColor } as CSSProperties;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden font-sans">
      
      {/* Premium Floating Ambient Light Circles */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 30, 0], 
          y: [0, -40, 0] 
        }} 
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-100 blur-3xl opacity-60"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1], 
          x: [0, -30, 0], 
          y: [0, 40, 0] 
        }} 
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-100 blur-3xl opacity-60"
      />

      {/* Decorative center light path */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,0.04),transparent_50%)]"
      />

      <div className="relative w-full max-w-md">
        
        {/* Global Error Banner */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              role="alert"
              className="absolute -top-16 left-0 right-0 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-lg shadow-red-100 backdrop-blur-md z-20"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{globalError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGlobalError(null)}
                aria-label="Dismiss error"
                className="rounded-full p-1 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Success Banner */}
        <AnimatePresence>
          {globalSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              role="alert"
              className="absolute -top-16 left-0 right-0 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-100 backdrop-blur-md z-20"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{globalSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setGlobalSuccess(null)}
                aria-label="Dismiss message"
                className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={accentStyle}
          className="relative rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-slate-200/80 backdrop-blur-md overflow-hidden"
        >
          {/* Subtle gradient glowing corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-teal-500/5 blur-xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <motion.div
              animate={{ rotate: role === "admin" ? 0 : 360 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 shadow-inner"
              style={{ 
                borderColor: `color-mix(in oklch, ${accentColor} 30%, rgb(226, 232, 240))`,
                boxShadow: `0 8px 20px -8px color-mix(in oklch, ${accentColor} 40%, transparent)`
              }}
            >
              {role === "admin" ? (
                <ShieldCheck className="h-6 w-6 text-slate-800" style={{ color: accentColor }} />
              ) : (
                <Building2 className="h-6 w-6 text-slate-800" style={{ color: accentColor }} />
              )}
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Enterprise Access
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Secure portal authentication</p>
            </div>
          </div>

          {/* Role switcher */}
          <div
            role="tablist"
            aria-label="Access type"
            className="relative mb-8 grid grid-cols-2 gap-1 rounded-2xl border border-slate-100 bg-slate-100/60 p-1.5"
          >
            {/* Animated background bubble */}
            <motion.div
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-white border border-slate-200/40 shadow-sm"
              layout
              transition={{ type: "spring", stiffness: 220, damping: 25 }}
              style={{
                left: role === "admin" ? "0.375rem" : "calc(50% + 0.125rem)",
                boxShadow: `0 4px 14px -4px color-mix(in oklch, ${accentColor} 25%, transparent)`,
                borderColor: `color-mix(in oklch, ${accentColor} 20%, transparent)`
              }}
            />
            
            {[
              { id: "admin" as Role, label: "Administrator", Icon: ShieldCheck },
              { id: "university" as Role, label: "University Portal", Icon: GraduationCap },
            ].map(({ id, label, Icon }) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setRole(id);
                    clearGlobal();
                  }}
                  className="relative z-10 flex items-center justify-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none cursor-pointer"
                  style={{ color: active ? accentColor : "var(--color-slate-500)" }}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            
            {/* Email Field */}
            <Field
              id="email"
              label="Enterprise Email Address"
              icon={<Mail className="h-4.5 w-4.5" />}
              error={errors.email}
              accentColor={accentColor}
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@enterprise.com"
                value={email}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  clearGlobal();
                }}
                className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </Field>

            {/* OTP Field (Shown during forgot-password reset stage) */}
            {mode === 'forgot-password' && resetOtpSent && (
              <Field
                id="otp"
                label="Verification Code (6-digit OTP)"
                icon={<Building2 className="h-4.5 w-4.5" />}
                error={errors.otp}
                accentColor={accentColor}
              >
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? "otp-error" : undefined}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors((p) => ({ ...p, otp: undefined }));
                    clearGlobal();
                  }}
                  className="w-full bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </Field>
            )}

            {/* Password Field */}
            {(mode !== 'forgot-password' || resetOtpSent) && (
              <Field
                id="password"
                label={mode === 'forgot-password' ? "New Password" : "Password"}
                icon={<Lock className="h-4.5 w-4.5" />}
                error={errors.password}
                accentColor={accentColor}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                }
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === 'forgot-password' ? "new-password" : "current-password"}
                  required
                  placeholder={mode === 'forgot-password' ? "Enter new password" : "Enter your password"}
                  value={password}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    clearGlobal();
                  }}
                  className="w-full bg-transparent py-3 pl-11 pr-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </Field>
            )}

            {/* Submit Button with Hover scale and pulse shadow */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-extrabold text-white transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 25px -8px ${accentColor}`,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Processing…
                </>
              ) : (
                mode === 'login' 
                  ? "Sign In to Wellmindly" 
                  : (resetOtpSent ? "Reset Password" : "Request Reset Code")
              )}
            </motion.button>

            {/* Bottom Links */}
            <div className="flex items-center justify-between pt-4 text-xs font-semibold text-slate-400">
              {mode === 'forgot-password' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetOtpSent(false);
                    setOtp("");
                    setErrors({});
                    setGlobalError(null);
                  }}
                  className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setResetOtpSent(false);
                      setOtp("");
                      setPassword("");
                      setErrors({});
                      setGlobalError(null);
                    }}
                    className="transition-colors hover:text-slate-600 cursor-pointer border-none bg-transparent"
                  >
                    Forgot password?
                  </button>
                  <a href="#" className="transition-colors hover:text-slate-600">
                    Request access
                  </a>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  accentColor: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

function Field({
  id,
  label,
  icon,
  error,
  accentColor,
  trailing,
  children,
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error 
    ? "rgb(239 68 68)" 
    : isFocused 
      ? accentColor 
      : "rgb(226, 232, 240)";

  const ringColor = error
    ? "rgb(239 68 68 / 0.15)"
    : `color-mix(in oklch, ${accentColor} 12%, transparent)`;

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-xs font-bold text-slate-500 tracking-wide uppercase">
        {label}
      </label>
      <div
        className="group relative rounded-2xl border transition-all duration-200"
        style={{ 
          borderColor, 
          boxShadow: isFocused || error ? `0 0 0 4px ${ringColor}` : "none",
          backgroundColor: isFocused ? "white" : "rgb(248, 250, 252)"
        }}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-slate-600 transition-colors">
          {icon}
        </div>
        {children}
        {trailing}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
