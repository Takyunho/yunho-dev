"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "@/styles/sections.module.css";

const FloatingShapes = dynamic(
  () => import("@/components/three/FloatingShapes"),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const stats = [
  { label: "경력", value: "4", unit: "년" },
  { label: "프로젝트", value: "10+", unit: "개" },
  { label: "기술 스택", value: "10+", unit: "개" },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen bg-bg px-6 py-24 md:px-16 lg:px-24"
    >
      {/* Section divider */}
      <div className={styles.sectionDivider} />

      <div className="mx-auto mt-16 max-w-6xl">
        {/* Section label */}
        <motion.div
          className={styles.sectionLabel}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={0}
        >
          <span className="font-mono text-xs tracking-[0.2em] text-primary">
            01
          </span>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-text-muted">
            About
          </span>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text content */}
          <div className="flex flex-col justify-center">
            <motion.h2
              className="text-3xl font-bold text-text md:text-4xl"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
            >
              <span className="text-primary">코드</span>로 경험을 설계합니다
            </motion.h2>

            <motion.p
              className="mt-6 text-sm leading-relaxed text-text-muted md:text-base"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={2}
            >
              사용자가 처음 화면을 마주하는 순간부터 마지막 인터랙션까지,
              매끄럽고 직관적인 경험을 만드는 것을 목표로 합니다.
            </motion.p>

            <motion.p
              className="mt-4 text-sm leading-relaxed text-text-muted md:text-base"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={3}
            >
              React 생태계를 중심으로 컴포넌트 설계, 상태 관리,
              성능 최적화에 집중하며, Three.js와 애니메이션을 활용해
              시각적으로 풍부한 웹을 구현합니다.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-6"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={4}
            >
              {stats.map((stat) => (
                <div key={stat.label} className={`${styles.statBorder} pb-3`}>
                  <p className="text-2xl font-bold text-primary md:text-3xl">
                    {stat.value}
                    <span className="ml-1 text-sm font-normal text-text-muted">
                      {stat.unit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D timeline */}
          <motion.div
            className="flex items-center justify-center lg:col-span-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={2}
          >
            <div className="h-[280px] w-full md:h-[380px]">
              <FloatingShapes />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
