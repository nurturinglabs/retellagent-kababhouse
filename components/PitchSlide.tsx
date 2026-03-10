"use client";

import { useEffect, useRef } from "react";

interface PitchSlideProps {
  active: boolean;
  children: React.ReactNode;
}

export default function PitchSlide({ active, children }: PitchSlideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [active]);

  return (
    <div
      ref={ref}
      className="h-screen w-full flex items-center justify-center snap-start snap-always"
    >
      <div
        className={`w-full max-w-4xl mx-auto px-6 md:px-12 transition-all duration-700 ${
          active
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
