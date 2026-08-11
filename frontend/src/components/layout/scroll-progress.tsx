"use client";

/**
 * ScrollProgress — Thin architectural scroll indicator & section index rail.
 *
 * Rendered on the right margin of desktop screens. Tracks section visibility
 * to indicate progress through the Amnaya story sequence.
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

const sections = [
  { id: "introduction", label: "01 Architecture" },
  { id: "residences", label: "02 Residences" },
  { id: "amenities", label: "03 Amenities" },
  { id: "masterplan", label: "04 Masterplan" },
  { id: "gallery", label: "05 Gallery" },
  { id: "location", label: "06 Location" },
];

export function ScrollProgress() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }

      // Check active section
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (reduced) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[80] hidden 2xl:flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Progress Track */}
      <div className="relative h-32 w-px bg-border/60">
        <motion.div
          className="absolute top-0 w-full bg-accent-500"
          style={{ height: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      {/* Section labels */}
      <div className="flex flex-col items-end gap-2 text-[10px] font-medium tracking-eyebrow uppercase text-muted-foreground/60">
        {sections.map((sec) => (
          <span
            key={sec.id}
            className={`transition-colors duration-300 ${
              activeSection === sec.id ? "text-accent-500 font-semibold" : ""
            }`}
          >
            {sec.label}
          </span>
        ))}
      </div>
    </div>
  );
}
