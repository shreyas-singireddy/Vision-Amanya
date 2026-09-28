"use client";

/**
 * AmenityExperienceSection — The main 3D immersive section on the Amenities page.
 *
 * Desktop (lg+): Shows the full 3D WebGL experience with overlay navigation.
 * Mobile (< lg): Shows the intentional AmenityMobileGrid fallback.
 *
 * This preserves the site-visit quality while keeping mobile performance reasonable.
 */

import { useEffect, useState } from "react";

import { Section, SectionHeader } from "@components/layout/section";
import { AmenityExperience3D, AmenityMobileGrid } from "@components/amnaya/amenity-experience";
import { Reveal } from "@components/motion";
import { Container } from "@components/ui/container";

export function AmenityExperienceSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Section id="amenity-explorer" spacing="lg" tone="dark">
      <SectionHeader
        eyebrow="Explore the Spaces"
        title="Experience the amenities in 3D"
        description="Navigate the Amnaya campus — select any amenity to explore its dedicated space, rendered in real-time."
        align="center"
      />

      <Reveal delay={0.2} className="mt-16">
        {/* Desktop: Full 3D WebGL Canvas */}
        <div className="hidden lg:block">
          <AmenityExperience3D className="w-full" />
          <p className="mt-4 text-center text-xs text-muted-foreground/60 uppercase tracking-[0.18em]">
            Drag to orbit · Scroll to zoom · Click hotspot or select amenity below
          </p>
        </div>

        {/* Mobile: Intentional image-first grid experience */}
        <div className="lg:hidden">
          <AmenityMobileGrid />
        </div>
      </Reveal>
    </Section>
  );
}
