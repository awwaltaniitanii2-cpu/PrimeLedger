"use client";

import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#040509]">
      {/* Aurora */}
      <motion.div
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -80, 100, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[-10%] top-[-10%] h-[700px] w-[700px] rounded-full bg-cyan-500/15 blur-[150px]"
      />

      <motion.div
        animate={{
          x: [0, -150, 80, 0],
          y: [0, 120, -100, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-10%] top-[10%] h-[800px] w-[800px] rounded-full bg-violet-500/12 blur-[170px]"
      />

      <motion.div
        animate={{
          y: [0, -80, 60, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-20%] left-[25%] h-[900px] w-[900px] rounded-full bg-[#D8C37A]/10 blur-[180px]"
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,.72)_100%)]" />
    </div>
  );
}