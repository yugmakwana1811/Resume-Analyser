"use client";

import { Player } from "@remotion/player";

import { MarkerHighlight } from "@/components/ui/marker-highlight";
import { MaskedSlideReveal } from "@/components/ui/masked-slide-reveal";

function MarkerHighlightScene() {
  return (
    <MarkerHighlight
      before="Built for "
      highlight="momentum"
      after="."
      markerColor="rgba(76,185,214,0.75)"
      baseColor="#161f3a"
      highlightedTextColor="#161f3a"
      backgroundColor="#ffffff"
      fontSize={66}
      fontWeight={650}
      speed={1}
    />
  );
}

function MaskedSlideRevealScene() {
  return (
    <MaskedSlideReveal
      text="Motion that stays tasteful"
      staggerDelay={3}
      fontSize={62}
      color="#161f3a"
      fontWeight={700}
      speed={1}
    />
  );
}

export function RemotionShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="section-shell overflow-hidden rounded-[2.5rem] border border-[rgba(31,44,82,0.08)]">
        <div className="px-7 pt-7">
          <div className="eyebrow">Remotion module</div>
          <div className="mt-3 text-xl font-semibold tracking-tight">
            Marker highlight
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">
            Rendered in-browser via `@remotion/player`, sized as an embedded card.
          </p>
        </div>
        <div className="relative mt-6 h-[320px] w-full overflow-hidden">
          <Player
            component={MarkerHighlightScene}
            durationInFrames={90}
            fps={30}
            compositionWidth={1200}
            compositionHeight={720}
            controls={false}
            autoPlay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div className="section-shell overflow-hidden rounded-[2.5rem] border border-[rgba(31,44,82,0.08)]">
        <div className="px-7 pt-7">
          <div className="eyebrow">Remotion module</div>
          <div className="mt-3 text-xl font-semibold tracking-tight">
            Masked slide reveal
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">
            Word-by-word spring reveal for headings and product moments.
          </p>
        </div>
        <div className="relative mt-6 h-[320px] w-full overflow-hidden">
          <Player
            component={MaskedSlideRevealScene}
            durationInFrames={90}
            fps={30}
            compositionWidth={1200}
            compositionHeight={720}
            controls={false}
            autoPlay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

