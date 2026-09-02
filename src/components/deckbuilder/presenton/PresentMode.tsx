import { useEffect, useState } from "react";
import type { Slide } from "@/hooks/useDecks";
import SlideCanvas from "./SlideCanvas";

export default function PresentMode({ slides, templateId, start = 0, onExit }: { slides: Slide[]; templateId?: string | null; start?: number; onExit: () => void }) {
  const [i, setI] = useState(start);
  const [w, setW] = useState(() => Math.min(window.innerWidth * 0.92, (window.innerHeight * 0.92) * (1280 / 720)));

  useEffect(() => {
    const resize = () => setW(Math.min(window.innerWidth * 0.92, (window.innerHeight * 0.92) * (1280 / 720)));
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setI((p) => Math.min(slides.length - 1, p + 1));
      if (e.key === "ArrowLeft") setI((p) => Math.max(0, p - 1));
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("keydown", key); };
  }, [slides.length, onExit]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SlideCanvas slide={slides[i]} templateId={templateId} width={w} index={i} total={slides.length} />
      <button onClick={onExit} style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12 }}>Exit (Esc)</button>
      <div style={{ position: "absolute", bottom: 18, display: "flex", gap: 10 }}>
        <button onClick={() => setI((p) => Math.max(0, p - 1))} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>←</button>
        <button onClick={() => setI((p) => Math.min(slides.length - 1, p + 1))} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>→</button>
      </div>
    </div>
  );
}
