import { useMemo, useState } from "react";
import { AUTH_LABEL, CATEGORIES, TOOLKITS, type Toolkit } from "@/lib/composioCatalog";
import { useMCPConnections } from "@/hooks/useMCPConnections";

const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#161616", cardH: "#1e1e1e",
  border: "#252525", accent: "#5cb85c", accentGlow: "rgba(92,184,92,0.12)",
  hot: "#e85d4a", text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff",
};
const F = "'Satoshi',sans-serif";

const initials = (name: string) =>
  name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const hueOf = (slug: string) => {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360;
  return h;
};

function Logo({ tk, size = 34 }: { tk: Toolkit; size?: number }) {
  const h = hueOf(tk.slug);
  return (
    <div style={{
      width: size, height: size, borderRadius: 9, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${h} 55% 26%), hsl(${(h + 40) % 360} 55% 16%))`,
      border: `1px solid hsl(${h} 40% 32%)`, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, letterSpacing: 0.5,
    }}>{initials(tk.name)}</div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, background: C.bg,
  border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontFamily: F, outline: "none",
};

export default function MCPConnectorsPanel() {
  const { connections, loading, localOnly, connect, disconnect } = useMCPConnections();
  const [browserOpen, setBrowserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Toolkit | null>(null);
  const [secret, setSecret] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const connectedSlugs = useMemo(() => new Set(connections.map((c) => c.toolkit_slug)), [connections]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLKITS.filter((tk) => {
      const matchesQ = !q || tk.name.toLowerCase().includes(q) || tk.slug.includes(q) ||
        tk.desc.toLowerCase().includes(q) || tk.category.toLowerCase().includes(q);
      const matchesC = category === "All" || tk.category === category;
      return matchesQ && matchesC;
    });
  }, [query, category]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const openConnect = (tk: Toolkit) => {
    setSelected(tk);
    setSecret("");
    setLabel(`${tk.name} workspace`);
  };

  const submitConnect = async () => {
    if (!selected) return;
    setBusy(true);
    await connect({
      toolkit_slug: selected.slug,
      toolkit_name: selected.name,
      auth_type: selected.auth,
      label,
      secret: secret || undefined,
    });
    setBusy(false);
    setSelected(null);
    flash(`${selected.name} connected`);
  };

  return (
    <div>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>MCP Connectors</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, maxWidth: 560 }}>
              Connect external tools over the Model Context Protocol. {TOOLKITS.length} toolkits available across {CATEGORIES.length} categories.
            </div>
          </div>
          <button onClick={() => setBrowserOpen(true)} style={{
            padding: "9px 16px", borderRadius: 8, border: "none", background: C.accent,
            color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F, whiteSpace: "nowrap",
          }}>+ Add Connector</button>
        </div>

        {localOnly && (
          <div style={{
            fontSize: 10, color: "#f0a050", background: "rgba(240,160,80,.1)",
            border: "1px solid rgba(240,160,80,.25)", borderRadius: 8, padding: "8px 10px", marginBottom: 12,
          }}>
            Saved in this browser for now — connections move to your account once the backend table is live.
          </div>
        )}

        {loading ? (
          <div style={{ fontSize: 11, color: C.textDim }}>Loading connections…</div>
        ) : connections.length === 0 ? (
          <div style={{
            border: `1px dashed ${C.border}`, borderRadius: 10, padding: "26px 18px",
            textAlign: "center", color: C.textDim, fontSize: 11,
          }}>
            No tools connected yet. Click <strong style={{ color: C.white }}>Add Connector</strong> to browse the catalog.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {connections.map((c) => {
              const tk = TOOLKITS.find((k) => k.slug === c.toolkit_slug);
              return (
                <div key={c.id} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: 12, display: "flex", gap: 10, alignItems: "center",
                }}>
                  {tk && <Logo tk={tk} size={30} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{c.toolkit_name}</div>
                    <div style={{ fontSize: 10, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {AUTH_LABEL[c.auth_type as keyof typeof AUTH_LABEL] ?? c.auth_type}
                      {c.credential_hint ? ` · ${c.credential_hint}` : ""}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: C.accent, background: C.accentGlow,
                    borderRadius: 20, padding: "3px 8px",
                  }}>LIVE</span>
                  <button onClick={() => { void disconnect(c.toolkit_slug); flash(`${c.toolkit_name} disconnected`); }} style={{
                    background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                    color: C.hot, fontSize: 10, padding: "4px 8px", cursor: "pointer", fontFamily: F,
                  }}>Remove</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TOOL BROWSER MODAL ── */}
      {browserOpen && (
        <div onClick={() => setBrowserOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 860, maxHeight: "84vh", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 16, display: "flex", flexDirection: "column",
            overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.6)",
          }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>Connect a tool</div>
                  <div style={{ fontSize: 10, color: C.textDim }}>{results.length} of {TOOLKITS.length} toolkits</div>
                </div>
                <button onClick={() => setBrowserOpen(false)} style={{
                  background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim,
                  width: 30, height: 30, cursor: "pointer", fontSize: 14,
                }}>✕</button>
              </div>
              <input
                autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, categories or actions…" style={inputStyle}
              />
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 10 }}>
                {["All", ...CATEGORIES].map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontFamily: F,
                    fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                    border: `1px solid ${category === cat ? C.accent : C.border}`,
                    background: category === cat ? C.accentGlow : "transparent",
                    color: category === cat ? C.accent : C.textDim,
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ overflowY: "auto", padding: 12, flex: 1 }}>
              {results.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: C.textDim, fontSize: 12 }}>
                  No tools match “{query}”.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 10 }}>
                {results.map((tk) => {
                  const isConnected = connectedSlugs.has(tk.slug);
                  return (
                    <div key={tk.slug} style={{
                      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12,
                      display: "flex", gap: 10,
                    }}>
                      <Logo tk={tk} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{tk.name}</span>
                          <span style={{ fontSize: 9, color: C.textMuted }}>{tk.actions} actions</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.textDim, margin: "2px 0 8px", lineHeight: 1.4 }}>{tk.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 9, color: C.textDim, border: `1px solid ${C.border}`,
                            borderRadius: 20, padding: "2px 7px",
                          }}>{AUTH_LABEL[tk.auth]}</span>
                          {isConnected ? (
                            <button onClick={() => { void disconnect(tk.slug); flash(`${tk.name} disconnected`); }} style={{
                              marginLeft: "auto", fontSize: 10, fontWeight: 700, fontFamily: F,
                              border: `1px solid ${C.accent}`, background: C.accentGlow, color: C.accent,
                              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                            }}>Connected</button>
                          ) : (
                            <button onClick={() => openConnect(tk)} style={{
                              marginLeft: "auto", fontSize: 10, fontWeight: 700, fontFamily: F,
                              border: "none", background: C.accent, color: "#000",
                              borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                            }}>Connect</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECT DIALOG ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)",
          zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 420, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 20, boxShadow: "0 24px 80px rgba(0,0,0,.6)",
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <Logo tk={selected} size={40} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Connect {selected.name}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{AUTH_LABEL[selected.auth]} · {selected.actions} actions</div>
              </div>
            </div>

            <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 5 }}>Connection label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />

            {selected.auth === "no_auth" ? (
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14 }}>
                This toolkit needs no credentials — connect and start using its actions right away.
              </div>
            ) : selected.auth === "oauth2" ? (
              <div style={{
                fontSize: 11, color: C.textDim, background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: 12, marginBottom: 14, lineHeight: 1.5,
              }}>
                You'll authorize {selected.name} with your account. Paste an existing access token below if you already have one, or leave it blank to register the connection now and finish authorization later.
                <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Optional access token"
                  style={{ ...inputStyle, marginTop: 10 }} type="password" />
              </div>
            ) : (
              <>
                <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 5 }}>
                  {selected.auth === "basic" ? "Username:password" : AUTH_LABEL[selected.auth]}
                </label>
                <input value={secret} onChange={(e) => setSecret(e.target.value)} type="password"
                  placeholder={`Enter your ${selected.name} ${selected.auth === "basic" ? "credentials" : "key"}`}
                  style={{ ...inputStyle, marginBottom: 8 }} />
                <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 14 }}>
                  Only a masked reference (last 4 characters) is stored with the connection.
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{
                padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: "transparent", color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: F,
              }}>Cancel</button>
              <button
                disabled={busy || (selected.auth !== "no_auth" && selected.auth !== "oauth2" && !secret.trim())}
                onClick={() => void submitConnect()}
                style={{
                  padding: "9px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#000",
                  fontSize: 12, fontWeight: 700, fontFamily: F,
                  opacity: busy || (selected.auth !== "no_auth" && selected.auth !== "oauth2" && !secret.trim()) ? 0.5 : 1,
                  cursor: busy ? "wait" : "pointer",
                }}>{busy ? "Connecting…" : "Connect"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 2200,
          background: C.card, border: `1px solid ${C.accent}`, color: C.white, fontSize: 12,
          fontFamily: F, borderRadius: 10, padding: "10px 16px", boxShadow: "0 8px 30px rgba(0,0,0,.5)",
        }}>{toast}</div>
      )}
    </div>
  );
}
