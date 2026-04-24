"use client";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SparklesCore } from "@/components/ui/sparkles";

export function SparklesDemo() {
  return (
    <div className="section-shell relative overflow-hidden rounded-[2.75rem] px-7 py-10 md:px-12 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={90}
          speed={0.6}
          className="h-full w-full opacity-80"
          particleColor="rgba(47,103,255,0.55)"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(47,103,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_35%,transparent_12%,black_75%)] bg-[rgba(247,248,252,0.92)]" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="eyebrow mb-4">Ambient micro-interactions</div>
        <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
          A premium surface with subtle motion, not visual noise.
        </h2>
        <p className="mt-5 text-base leading-8 text-[var(--app-text-muted)] md:text-lg">
          Sparkles are used as a restrained background accent, tuned for light interfaces and kept out of the way of content.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="gap-3">
            <Link to="/auth">
              Continue to workspace <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
