"use client";

import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import HeroModel from "@/components/three/HeroModel";
import ParticleField from "@/components/three/ParticleField";
import styles from "@/styles/hero.module.css";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.6 + i * 0.25,
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 1.8, duration: 0.8, ease: "easeOut" as const },
  },
};

export default function HeroSection() {
  const mouse = useMousePosition();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const particleCount = isMobile ? 300 : 800;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-bg">
      {/* Blueprint grid background */}
      <div className={styles.blueprintGrid} />

      {/* Center glow */}
      <div className={styles.glow} />

      {/* 3D Canvas */}
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#60a5fa" />
        <HeroModel mouse={mouse} isMobile={isMobile} />
        <ParticleField count={particleCount} />
      </Canvas>

      {/* Text Overlay — centered, clean typography */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
        <motion.p
          className={`font-mono text-xs tracking-[0.3em] uppercase md:text-sm ${styles.gradientText}`}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Frontend Developer
        </motion.p>

        <motion.h1
          className="mt-5 text-4xl font-bold tracking-tight text-white md:text-7xl"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          탁윤호
        </motion.h1>

        {/* Gradient line */}
        <motion.div
          className={styles.gradientLine + " mt-5"}
          variants={lineVariants}
          initial="hidden"
          animate="visible"
        />

        <motion.p
          className="mt-5 max-w-lg text-center text-sm leading-relaxed text-text-muted md:text-base"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <span className="text-accent">디자인</span>을 코드로,{" "}
          <span className="text-primary">아이디어</span>를 인터페이스로
          <span className={styles.cursor} />
        </motion.p>
      </div>

      {/* Scroll Down Indicator */}
      <div className={styles.scrollIndicator}>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">
          Scroll
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
}
