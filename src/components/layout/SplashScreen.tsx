"use client";

import { useEffect, useState } from "react";

const SPLASH_DURATION = 2500;
const FADE_DURATION = 300;

interface SplashScreenProps {
  children: React.ReactNode;
}

export default function SplashScreen({ children }: SplashScreenProps) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const hasShown = sessionStorage.getItem("greater-tomorrow-splash") === "1";

    if (navigation?.type === "back_forward" || hasShown) {
      return;
    }

    sessionStorage.setItem("greater-tomorrow-splash", "1");
    const showTimer = setTimeout(() => setShow(true), 0);

    const fadeTimer = setTimeout(
      () => setFadeOut(true),
      SPLASH_DURATION - FADE_DURATION,
    );
    const hideTimer = setTimeout(() => setShow(false), SPLASH_DURATION);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {children}
      {show && (
        <div
          className={`fixed inset-0 z-50 flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-navy px-6 text-center transition-opacity duration-300 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Replace the placeholder with the real school crest/logo when available. */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 font-display text-2xl font-semibold text-white">
            GS
          </div>
          <span className="max-w-[min(100%,28rem)] font-display text-[clamp(1.25rem,5vw,1.5rem)] font-semibold leading-tight text-white">
            Greater Tomorrow Secondary School
          </span>
          <span className="text-sm italic text-white/70">
            Knowledge, Character, Excellence
          </span>
        </div>
      )}
    </>
  );
}
