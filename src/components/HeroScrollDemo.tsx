"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--app-text)] md:text-5xl">
              A scroll-driven product reveal <br />
              <span className="mt-2 block bg-[linear-gradient(135deg,var(--app-accent),var(--app-secondary))] bg-clip-text text-4xl font-bold leading-none text-transparent md:text-[5.5rem]">
                With Real Depth
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              This demo is wired into the app as a premium motion module. It runs on `framer-motion` and respects reduced-motion settings.
            </p>
          </>
        }
      >
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80"
          alt="Team collaborating"
          className="mx-auto h-full w-full rounded-2xl object-cover object-center"
          draggable={false}
          loading="lazy"
        />
      </ContainerScroll>
    </div>
  );
}

