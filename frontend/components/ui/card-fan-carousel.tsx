"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export interface CardItem {
  imgUrl?: string;
  alt?: string;
  linkUrl?: string;
  serviceId?: string;
  title?: string;
  category?: string;
  timeframe?: string;
  buildPrice?: string;
  carePrice?: string;
  fuelPrice?: string;
  deliverables?: string[];
  glossyGradient?: string;
  accentGlow?: string;
}

interface SocialCardsProps {
  cards: CardItem[];
  onSelectCard?: (card: CardItem) => void;
}

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7,  scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
  { rot: 7,   scale: 0.9346, x: 11,  y: 1.3, zIndex: 3 },
  { rot: 14,  scale: 0.8498, x: 22,  y: 4.0, zIndex: 2 },
  { rot: 21,  scale: 0.7756, x: 30,  y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1.0;
}

function getHeightMultiplier(width: number) {
  let idealPx: number;
  if (width < 480) idealPx = 22 * 16;
  else if (width < 640) idealPx = 26 * 16;
  else if (width < 768) idealPx = 28 * 16;
  else if (width < 1024) idealPx = 34 * 16;
  else idealPx = 38 * 16;

  const available = typeof window !== "undefined" ? window.innerHeight * 0.7 : 600;
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl text-white/70 cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_25px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:border-white/50 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300";

export default function SocialCards({ cards, onSelectCard }: SocialCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevVisible = useRef<Set<number>>(new Set());

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1);

  const getVisibleMap = useCallback((center: number) => {
    const map = new Map<number, number>();
    if (!needsPagination) {
      cards.forEach((_, i) => map.set(i, i));
      return map;
    }
    for (let slot = 0; slot < MAX_VISIBLE; slot++) {
      map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot);
    }
    return map;
  }, [totalCards, needsPagination, cards]);

  const cycle = useCallback((direction: "left" | "right") => {
    if (isAnimating.current || !needsPagination) return;
    isAnimating.current = true;
    directionRef.current = direction;
    setCenterIndex(prev =>
      direction === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    );
  }, [totalCards, needsPagination]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>(".fan-card"));
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot: number) => getSlotConfig(slotCount, slot);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1.05,.78)", delay: 0.2 + slot * 0.06, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === "right" ? -30 : 30, duration: 0.4, ease: "power2.in", zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions
    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: NodeJS.Timeout | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 3.5 * hM;
            targetScale *= 1.12; // Card gets visibly bigger on hover!
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 9 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3.5 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3.5 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
          duration: 0.5, delay, ease: "elastic.out(1,.75)", overwrite: "auto",
        });
        gsap.set(el, { zIndex: hoveredSlot === slot ? 99 : base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot); }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null); }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot); };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination]);

  if (!totalCards) return null;

  const chevron = (direction: "left" | "right") => (
    <svg className="relative z-[2] w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );

  return (
    <section className="flex flex-col items-center w-full py-6 lg:py-12 px-4 md:px-8 relative z-20">
      <div className="flex items-center justify-center w-full max-w-[90rem]">
        <div ref={containerRef} className="fan-layout flex relative justify-center items-center w-full max-w-[80rem] h-[480px] md:h-[540px]">
          {cards.map((card, index) => {
            const isGlossyService = !!card.title;

            const cardBody = isGlossyService ? (
              <div 
                className="group/card relative w-full h-full p-6 sm:p-7 flex flex-col justify-between rounded-3xl overflow-hidden text-white shadow-2xl border border-white/20 backdrop-blur-2xl transition-all duration-300"
                style={{
                  background: card.glossyGradient || "linear-gradient(135deg, #0F172A 0%, #020617 100%)",
                }}
              >
                {/* Glitter Shadow & Border Shimmer Effect */}
                <div 
                  className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "0 0 45px -5px rgba(59, 130, 246, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(59,130,246,0.3), rgba(255,255,255,0.1))",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    padding: "1.5px",
                  }}
                />

                {/* Acrylic Gloss Lens Highlight */}
                <div 
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.02) 100%)",
                  }}
                />

                {/* Micro Sparkle Ambient Dots */}
                <div className="absolute top-4 right-16 opacity-30 group-hover/card:opacity-90 transition-opacity pointer-events-none">
                  <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                </div>

                {/* Card Top: Category & Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-blue-300 drop-shadow">
                    {card.serviceId || `Service 0${index + 1}`}
                  </span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md">
                    {card.timeframe || "Live in 7–10 Days"}
                  </span>
                </div>

                {/* Card Center: Title & Deliverables (Bold & Expandable) */}
                <div className="relative z-10 my-auto py-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-3 leading-snug drop-shadow-md">
                    {card.title}
                  </h3>

                  {card.deliverables && (
                    <ul className="space-y-2 my-2">
                      {card.deliverables.slice(0, 4).map((item, dIdx) => (
                        <li key={dIdx} className="flex items-center text-xs sm:text-sm text-slate-100 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2.5 shrink-0 drop-shadow" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card Bottom: Exact Pricing & Quick Select Button */}
                <div className="relative z-10 pt-3 border-t border-white/20 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">
                      One-Time Build
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                      {card.buildPrice || "$924"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-300 block">
                      {card.carePrice || "$199/mo"}
                    </span>
                    <span className="text-[9.5px] block text-slate-300 font-medium">
                      Token Fuel: {card.fuelPrice || "$0/mo"}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-xl border border-white/10">
                <img
                  src={card.imgUrl}
                  loading="lazy"
                  alt={card.alt || `Card ${index}`}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
              </div>
            );

            return (
              <div
                key={index}
                onClick={() => onSelectCard?.(card)}
                className="fan-card absolute w-[300px] h-[420px] sm:w-[330px] sm:h-[450px] md:w-[360px] md:h-[480px] select-none cursor-pointer transition-all duration-300"
              >
                {card.linkUrl ? (
                  <a
                    href={card.linkUrl}
                    target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {cardBody}
                  </a>
                ) : (
                  cardBody
                )}
              </div>
            );
          })}
        </div>
      </div>

      {needsPagination && (
        <div className="flex items-center justify-center gap-5 mt-8 md:mt-10 z-30">
          <button
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("left")}
            aria-label="Previous"
          >
            {chevron("left")}
          </button>
          <div className="flex items-center gap-2.5">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === centerIndex
                    ? "bg-blue-500 scale-[1.4] shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <button
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("right")}
            aria-label="Next"
          >
            {chevron("right")}
          </button>
        </div>
      )}
    </section>
  );
}
