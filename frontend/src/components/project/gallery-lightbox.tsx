"use client";

/**
 * GalleryLightbox — Full-screen render viewer modal with keyboard navigation.
 *
 * Supports left/right arrow keys, ESC key to close, high-resolution rendering,
 * and caption metadata.
 */

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

export interface GalleryItem {
  src: string;
  alt: string;
  category?: string;
  caption?: string;
}

export interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function GalleryLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const reduced = useReducedMotionPreference();
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % items.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] flex flex-col justify-between bg-black/95 p-4 sm:p-8 backdrop-blur-lg select-none"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between text-neutral-300">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-eyebrow text-accent-400">
                {currentItem.category ?? "Amnaya Render"}
              </span>
              <span className="text-xs text-neutral-500">•</span>
              <span className="text-xs font-mono text-neutral-400">
                {currentIndex + 1} / {items.length}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close fullscreen lightbox"
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-600 hover:text-white transition-colors"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Image Frame & Controls */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Prev Arrow */}
            <button
              onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
              aria-label="Previous render"
              className="absolute left-2 sm:left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-200 hover:border-accent-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Active Render Image */}
            <motion.div
              key={currentItem.src}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-full max-w-full w-full h-[75vh]"
            >
              <Image
                src={currentItem.src}
                alt={currentItem.alt}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </motion.div>

            {/* Next Arrow */}
            <button
              onClick={() => onNavigate((currentIndex + 1) % items.length)}
              aria-label="Next render"
              className="absolute right-2 sm:right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-200 hover:border-accent-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Footer Caption */}
          <div className="text-center">
            <p className="font-serif text-lg text-neutral-200">{currentItem.alt}</p>
            {currentItem.caption && (
              <p className="mt-1 text-xs text-neutral-400 max-w-xl mx-auto">
                {currentItem.caption}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
