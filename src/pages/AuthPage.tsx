import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import abmLogo from "@/assets/abm-logo.png";

const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#161616", border: "#252525",
  accent: "#5cb85c", accentGlow: "rgba(92,184,92,0.12)", hot: "#e85d4a",
  text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff",
};
const F = { display: "'Outfit',sans-serif", body: "'DM Sans',sans-serif" };

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: F.body, background: C.bg, color: C.text,
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 380, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={abmLogo} alt="ABM PR" style={{ width: 48, height: 48, margin: "0 auto 12px", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, fontFamily: F.display, fontWeight: 700, color: C.white, margin: 0 }}>ABM PR</h1>
          <p style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, textTransform: "uppercase", margin: "4px 0 0" }}>New Orleans</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.surface,
                color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.surface,
                color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && <div style={{ fontSize: 11, color: C.hot, marginBottom: 12, padding: "8px 10px", background: "rgba(232,93,74,0.1)", borderRadius: 6 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px 18px", borderRadius: 8, border: "none",
            background: C.accent, color: "#000", fontSize: 13, fontWeight: 700,
            fontFamily: F.body, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          }}>
            {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{
            background: "none", border: "none", color: C.accent, fontSize: 11,
            cursor: "pointer", fontFamily: F.body,
          }}>
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
