"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS, SKILL_CATEGORIES } from "@/lib/constants";
import type { Skill } from "@/lib/constants";
import styles from "@/styles/sections.module.css";

gsap.registerPlugin(ScrollTrigger);

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

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <motion.div
      className={`${styles.skillCard} group rounded-xl border border-grid bg-bg-light/50 p-5 backdrop-blur-sm transition-colors hover:border-primary/30`}
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text">{skill.name}</h3>
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
      </div>

      {/* Category */}
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {SKILL_CATEGORIES[skill.category]}
      </p>

      {/* Level bar */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor:
                i < skill.level
                  ? skill.color
                  : "rgba(255,255,255,0.06)",
              opacity: i < skill.level ? 0.7 : 1,
            }}
          />
        ))}
      </div>

      {/* Description — visible on hover */}
      <p className="mt-3 text-xs leading-relaxed text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
        {skill.description}
      </p>
    </motion.div>
  );
}

export default function SkillsSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll("[data-skill-card]");

    gsap.fromTo(
      cards,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      id="skills"
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
            02
          </span>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-text-muted">
            Skills
          </span>
        </motion.div>

        <motion.h2
          className="mt-8 text-3xl font-bold text-text md:text-4xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={1}
        >
          기술 <span className="text-primary">스택</span>
        </motion.h2>

        <motion.p
          className="mt-4 whitespace-nowrap text-sm text-text-muted md:text-base"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={2}
        >
          프로젝트에 활용하는 핵심 기술들입니다. 각 카드에 마우스를 올려 상세 정보를 확인하세요.
        </motion.p>

        {/* Cards grid — GSAP animated */}
        <div
          ref={cardsRef}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SKILLS.map((skill) => (
            <div key={skill.name} data-skill-card>
              <SkillCard skill={skill} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
