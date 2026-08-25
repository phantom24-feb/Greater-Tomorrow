"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-[#123b70]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <Image
              src="/IMG-20260825-WA0006.jpg"
              alt="GREATER TOMORROW SCHOOLS logo"
              width={150}
              height={150}
              priority
              className="mx-auto mb-7 h-24 w-24 rounded-full object-cover"
            />
            <p className="mb-3 text-xs uppercase tracking-[.35em] text-[#d94848]">
              Est. 2001
            </p>
            <h1 className="max-w-[min(90vw,680px)] font-serif text-3xl font-semibold tracking-tight sm:text-6xl">
              GREATER TOMORROW SCHOOLS
            </h1>
            <p className="mt-4 max-w-md px-4 text-sm leading-6 tracking-[.08em] text-[#123b70]/70">
              Train up a child in the way he should grow
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
