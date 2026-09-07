"use client";

import { useEffect, useState } from "react";

const SPLASH_DURATION = 2500;
const FADE_DURATION = 300;

interface SplashScreenProps {
  children: React.ReactNode;
}

export default function SplashScreen({ children }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(
      () => setFadeOut(true),
      SPLASH_DURATION - FADE_DURATION,
    );
    const hideTimer = setTimeout(() => setShow(false), SPLASH_DURATION);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {children}
      {show && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-navy transition-opacity duration-300 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Replace with an <img> of the real school crest/logo */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 font-display text-2xl font-semibold text-white">
            GS
          </div>
          <span className="font-display text-2xl font-semibold text-white">
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
