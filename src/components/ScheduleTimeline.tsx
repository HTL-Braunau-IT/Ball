"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface ScheduleItem {
  time: string;
  label: string;
}

// The section stays pinned while the visitor scrolls through it and the
// points of the evening appear one by one. With reduced motion it is a plain list.
export default function ScheduleTimeline({ items }: { items: ScheduleItem[] }) {
  const pinRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(1);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsStatic(true);
      setShown(items.length);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = pinRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 1;
      setShown(Math.min(items.length, 1 + Math.floor(progress * items.length)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  // Each point sits at the start of its column, so the line ends at the active
  // point and only runs out to the edge once the whole evening is revealed.
  const progress = shown >= items.length ? 1 : (shown - 1) / items.length;

  return (
    <section
      id="zeitplan"
      ref={pinRef}
      aria-labelledby="zeitplan-title"
      className={isStatic ? "timeline-static" : "timeline-pin"}
    >
      <div className="timeline-stage">
        <div className="timeline-glow" aria-hidden="true" />
        <div className="timeline-inner">
          <div className="timeline-head">
            <div>
              <span className="n-eyebrow">01 · Zeitplan</span>
              <h2 id="zeitplan-title" className="n-title">Ablauf des Abends</h2>
            </div>
            {!isStatic && (
              <span className="timeline-counter" aria-hidden="true">
                {String(shown).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            )}
          </div>
          <div className="timeline-track" style={{ "--p": isStatic ? 1 : progress } as CSSProperties}>
            <div className="timeline-rail" aria-hidden="true" />
            <div className="timeline-fill" aria-hidden="true" />
            <ol className="timeline-list">
              {items.map((item, i) => {
                const state = i === shown - 1 && !isStatic ? "is-active" : i < shown ? "is-on" : "";
                return (
                  <li key={item.time} className={`timeline-item ${state}`}>
                    <span className="timeline-dot" aria-hidden="true" />
                    <div className="timeline-time">{item.time}</div>
                    <div className="timeline-label">{item.label}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
