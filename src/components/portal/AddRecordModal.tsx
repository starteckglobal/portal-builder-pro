import * as React from "react";
import { useEffect, useState } from "react";
import { SpecularButton } from "@/components/ui/specular-button";

const C = {
  card: "#161616", border: "#252525", accent: "#5cb85c",
  text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff",
};
const F = { display: "'Satoshi',sans-serif", body: "'Satoshi',sans-serif" };

const cardSx: React.CSSProperties = {
  background: "linear-gradient(135deg,#010101 0%,#090909 55%,#010101 100%)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 18px 40px rgba(0,0,0,.55)",
  backdropFilter: "blur(18px)",
};

export type FieldType = "text" | "number" | "date" | "email" | "url" | "textarea" | "select";

export type FieldOption = string | { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type?: FieldType;
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
};

type Props = {
  open: boolean;
  title: string;
  fields: FieldDef[];
  submitLabel?: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
};

const optionValue = (option: FieldOption) => typeof option === "string" ? option : option.value;

const initial = (fields: FieldDef[]) =>
  fields.reduce<Record<string, string>>((acc, f) => {
    acc[f.name] = f.defaultValue ?? (f.type === "select" ? (f.options?.[0] ? optionValue(f.options[0]) : "") : "");
    return acc;
  }, {});

export default function AddRecordModal({ open, title, fields, submitLabel = "Save", saving, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => initial(fields));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setValues(initial(fields)); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title]);

  if (!open) return null;

  const set = (name: string, v: string) => setValues((p) => ({ ...p, [name]: v }));

  const validate = () => {
    for (const f of fields) {
      const raw = (values[f.name] ?? "").trim();
      if (f.required && !raw) return `${f.label} is required`;
      if (raw && f.maxLength && raw.length > f.maxLength) return `${f.label} must be under ${f.maxLength} characters`;
      if (raw && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `${f.label} must be a valid email`;
      if (raw && f.type === "number" && Number.isNaN(Number(raw))) return `${f.label} must be a number`;
    }
    return null;
  };

  const submit = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }
    const out: Record<string, any> = {};
    fields.forEach((f) => {
      const raw = (values[f.name] ?? "").trim();
      if (!raw) return;
      out[f.name] = f.type === "number" ? Number(raw) : raw;
    });
    await onSubmit(out);
  };

  const inputSx: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text,
    fontSize: 12, fontFamily: F.body, outline: "none",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...cardSx, borderRadius: 14, padding: 24, width: 460, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto" }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily: F.display, marginBottom: 16 }}>{title}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {fields.map((f) => (
            <div key={f.name}>
              <label style={{ display: "block", fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                {f.label}{f.required && <span style={{ color: C.accent }}> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={f.rows ?? 3}
                  style={{ ...inputSx, resize: "vertical", lineHeight: 1.6 }}
                />
              ) : f.type === "select" ? (
                <select value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} style={inputSx}>
                  {!f.required && <option value="">Select…</option>}
                  {(f.options || []).map((o) => {
                    const value = optionValue(o);
                    return <option key={value} value={value}>{typeof o === "string" ? o : o.label}</option>;
                  })}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  maxLength={f.maxLength}
                  style={inputSx}
                />
              )}
            </div>
          ))}
        </div>
        {error && <div style={{ fontSize: 11, color: "#e85d4a", marginTop: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <SpecularButton size="sm" radius={8} tintOpacity={0.18} autoAnimate={false} onClick={onClose}
            style={{ height: "auto", padding: "6px 14px", fontSize: 11, fontFamily: F.body, color: C.text }}>
            Cancel
          </SpecularButton>
          <SpecularButton size="sm" radius={8} tintOpacity={0.45} autoAnimate={false} onClick={submit} disabled={saving}
            style={{ height: "auto", padding: "6px 14px", fontSize: 11, fontWeight: 700, fontFamily: F.body, color: "#eafff0", background: `linear-gradient(180deg,${C.accent},hsl(120 38% 30%))`, border: `1px solid ${C.accent}` }}>
            {saving ? "Saving…" : submitLabel}
          </SpecularButton>
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, onAdd, addLabel = "Add", children }: {
  title: string; subtitle?: string; onAdd?: () => void; addLabel?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div>
        <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>{title}</h1>
        {subtitle && <p style={{ color: C.textDim, margin: "4px 0 0", fontSize: 11 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {children}
        {onAdd && (
          <SpecularButton size="sm" radius={8} tintOpacity={0.45} autoAnimate={false} onClick={onAdd}
            style={{ height: "auto", padding: "6px 14px", fontSize: 11, fontWeight: 700, fontFamily: F.body, color: "#eafff0", background: `linear-gradient(180deg,${C.accent},hsl(120 38% 30%))`, border: `1px solid ${C.accent}`, whiteSpace: "nowrap" }}>
            + {addLabel}
          </SpecularButton>
        )}
      </div>
    </div>
  );
}
