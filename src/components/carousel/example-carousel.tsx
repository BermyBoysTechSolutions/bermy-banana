"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EXAMPLE_SLIDES } from "@/lib/examples";
import { cn } from "@/lib/utils";

export function ExampleCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
      containScroll: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    const frame = requestAnimationFrame(onSelect);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">
          {EXAMPLE_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_280px] sm:flex-[0_0_320px] lg:flex-[0_0_280px]"
            >
              <div className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800 shadow-lg">
                {slide.type === "video" ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={slide.src}
                    poster={slide.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={slide.alt}
                  />
                ) : (
                  <Image
                    className="object-cover"
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 320px, 280px"
                  />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                  <span className="text-sm font-semibold text-white drop-shadow">
                    {slide.label}
                  </span>
                </div>

                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
                  <span className="text-xs font-medium text-white/90">
                    {slide.type === "video" ? "Video" : "Image"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className={cn(
          "absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 shadow-lg transition-all hover:scale-105 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
          !canScrollPrev && "cursor-not-allowed opacity-50"
        )}
        disabled={!canScrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-zinc-300" />
      </button>

      <button
        onClick={scrollNext}
        className={cn(
          "absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 shadow-lg transition-all hover:scale-105 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
          !canScrollNext && "cursor-not-allowed opacity-50"
        )}
        disabled={!canScrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-zinc-300" />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {EXAMPLE_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
              selectedIndex === index
                ? "w-8 bg-yellow-500"
                : "bg-zinc-600 hover:bg-zinc-500"
            )}
            aria-label={`Go to slide ${index + 1}: ${slide.label}`}
          />
        ))}
      </div>
    </div>
  );
}
