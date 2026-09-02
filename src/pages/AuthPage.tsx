import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import abmLogo from "@/assets/abm-logo.png";

const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#161616", border: "#252525",
  accent: "#5cb85c", accentGlow: "rgba(92,184,92,0.12)", hot: "#e85d4a",
  text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff",
};
const F = { display: "'Satoshi',sans-serif", body: "'Satoshi',sans-serif" };

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (forgotMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setResetSent(true);
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const glassCard: React.CSSProperties = {
    width: 380,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(24px) saturate(1.4)",
    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
    color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      fontFamily: F.body, background: C.bg, color: C.text,
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={glassCard}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={abmLogo} alt="ABM PR" style={{ width: 80, height: 80, margin: "0 auto 12px", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, fontFamily: F.display, fontWeight: 700, color: C.white, margin: 0 }}>ABM PR</h1>
          <p style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", margin: "4px 0 0" }}>New Orleans</p>
        </div>

        {forgotMode && resetSent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.accent, marginBottom: 16, padding: "12px 14px", background: C.accentGlow, borderRadius: 8 }}>
              Password reset link sent to <strong>{email}</strong>. Check your inbox.
            </div>
            <button onClick={() => { setForgotMode(false); setResetSent(false); setError(""); }} style={{
              background: "none", border: "none", color: C.accent, fontSize: 11,
              cursor: "pointer", fontFamily: F.body,
            }}>← Back to sign in</button>
          </div>
        ) : (
          <>
            {forgotMode && (
              <p style={{ fontSize: 12, color: C.textDim, textAlign: "center", marginBottom: 16 }}>
                Enter your email and we'll send a reset link.
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
              </div>

              {!forgotMode && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
                </div>
              )}

              {isLogin && !forgotMode && (
                <div style={{ textAlign: "right", marginBottom: 12 }}>
                  <button type="button" onClick={() => { setForgotMode(true); setError(""); }} style={{
                    background: "none", border: "none", color: C.textDim, fontSize: 11,
                    cursor: "pointer", fontFamily: F.body,
                  }}>Forgot password?</button>
                </div>
              )}

              {!isLogin && !forgotMode && <div style={{ marginBottom: 16 }} />}

              {error && <div style={{ fontSize: 11, color: C.hot, marginBottom: 12, padding: "8px 10px", background: "rgba(232,93,74,0.1)", borderRadius: 6 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "11px 18px", borderRadius: 8, border: "none",
                background: C.accent, color: "#000", fontSize: 13, fontWeight: 700,
                fontFamily: F.body, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              }}>
                {loading ? "..." : forgotMode ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              {forgotMode ? (
                <button onClick={() => { setForgotMode(false); setError(""); }} style={{
                  background: "none", border: "none", color: C.accent, fontSize: 11,
                  cursor: "pointer", fontFamily: F.body,
                }}>← Back to sign in</button>
              ) : (
                <button onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{
                  background: "none", border: "none", color: C.accent, fontSize: 11,
                  cursor: "pointer", fontFamily: F.body,
                }}>
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
