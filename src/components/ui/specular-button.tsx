import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg" | "icon";
  radius?: number;
  /** highlight tint colour */
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-8 text-sm",
  icon: "h-10 w-10",
};

/**
 * Specular button: a glass slab with a mouse-following specular highlight
 * and an animated rim light. Green tinted to match the portal theme.
 */
export const SpecularButton = React.forwardRef<HTMLButtonElement, SpecularButtonProps>(
  (
    {
      className,
      children,
      size = "md",
      radius = 18,
      tint = "hsl(120 38% 46%)",
      tintOpacity = 0.18,
      blur = 0,
      textColor,
      lineColor = "hsl(120 38% 60%)",
      baseColor = "hsl(150 12% 14%)",
      intensity = 1,
      shineSize = 10,
      shineFade = 40,
      thickness = 1,
      speed = 0.35,
      followMouse = true,
      proximity = 250,
      autoAnimate = false,
      style,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLButtonElement | null>(null);

    const setRefs = (node: HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    React.useEffect(() => {
      if (!followMouse) return;
      const handle = (e: PointerEvent) => {
        const el = innerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const near = dist < proximity ? 1 : 0;
        el.style.setProperty("--spec-x", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--spec-y", `${((e.clientY - r.top) / r.height) * 100}%`);
        el.style.setProperty("--spec-on", String(near * intensity));
      };
      window.addEventListener("pointermove", handle, { passive: true });
      return () => window.removeEventListener("pointermove", handle);
    }, [followMouse, proximity, intensity]);

    return (
      <button
        ref={setRefs}
        className={cn(
          "specular-btn group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium",
          "transition-transform duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          autoAnimate && "specular-btn--auto",
          sizeClasses[size] ?? sizeClasses.md,
          className,
        )}
        style={
          {
            borderRadius: radius,
            color: textColor,
            "--spec-tint": tint,
            "--spec-tint-o": tintOpacity,
            "--spec-blur": `${blur}px`,
            "--spec-line": lineColor,
            "--spec-base": baseColor,
            "--spec-shine": `${shineSize * 10}%`,
            "--spec-fade": `${shineFade}%`,
            "--spec-thickness": `${thickness}px`,
            "--spec-speed": `${Math.max(0.05, speed) * 8}s`,
            ...style,
          } as React.CSSProperties
        }
        onMouseMove={onMouseMove}
        onMouseLeave={(e) => {
          innerRef.current?.style.setProperty("--spec-on", "0");
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    );
  },
);
SpecularButton.displayName = "SpecularButton";

export default SpecularButton;
