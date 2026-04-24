"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-[rgba(47,103,255,0.12)]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96] as const,
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border border-[rgba(31,44,82,0.1)]",
            "shadow-[0_18px_52px_rgba(47,103,255,0.12)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.7),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometric({
  badge = "Design Collective",
  title1 = "Elevate Your Digital Vision",
  title2 = "Crafting Exceptional Websites",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            duration: 1,
            delay: 0.5 + i * 0.2,
            ease: [0.25, 0.4, 0.25, 1] as const,
          },
        }),
      };

  return (
    <div className="relative flex min-h-[42rem] w-full items-center justify-center overflow-hidden rounded-[2.75rem] border border-[rgba(47,103,255,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,248,255,0.96))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(76,185,214,0.16),transparent_48%),radial-gradient(circle_at_84%_18%,rgba(47,103,255,0.16),transparent_42%)] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={620}
          height={140}
          rotate={12}
          gradient="from-[rgba(47,103,255,0.18)]"
          className="left-[-16%] top-[12%] md:left-[-8%] md:top-[18%]"
        />

        <ElegantShape
          delay={0.5}
          width={520}
          height={120}
          rotate={-15}
          gradient="from-[rgba(76,185,214,0.18)]"
          className="right-[-12%] top-[68%] md:right-[-6%] md:top-[74%]"
        />

        <ElegantShape
          delay={0.4}
          width={320}
          height={86}
          rotate={-8}
          gradient="from-[rgba(116,118,255,0.16)]"
          className="bottom-[6%] left-[6%] md:bottom-[10%] md:left-[12%]"
        />

        <ElegantShape
          delay={0.6}
          width={230}
          height={66}
          rotate={20}
          gradient="from-[rgba(255,189,107,0.16)]"
          className="right-[14%] top-[10%] md:right-[18%] md:top-[14%]"
        />

        <ElegantShape
          delay={0.7}
          width={170}
          height={46}
          rotate={-25}
          gradient="from-[rgba(47,103,255,0.13)]"
          className="left-[20%] top-[6%] md:left-[26%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-[rgba(31,44,82,0.1)] bg-white/70 px-4 py-2 shadow-[0_10px_24px_rgba(77,92,137,0.12)]"
          >
            <Circle className="h-2 w-2 fill-[var(--app-accent)] text-[var(--app-accent)]" />
            <span className="text-xs font-semibold tracking-[0.22em] text-[var(--app-text-soft)]">
              {badge}
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--app-text)] sm:text-6xl md:text-7xl">
              <span className="bg-clip-text text-transparent bg-[linear-gradient(180deg,var(--app-text),rgba(22,31,58,0.72))]">
                {title1}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,rgba(47,103,255,0.92),rgba(76,185,214,0.88))]">
                {title2}
              </span>
            </h2>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="mx-auto mt-6 max-w-xl px-4 text-base leading-8 text-[var(--app-text-muted)] sm:text-lg">
              Crafting exceptional digital experiences through innovative design and disciplined, production-grade execution.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(247,248,252,0.96)] via-transparent to-[rgba(247,248,252,0.6)]" />
    </div>
  );
}

export { HeroGeometric };
