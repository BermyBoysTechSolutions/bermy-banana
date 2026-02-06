"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder content - easy to replace with actual images/GIFs
// Videos in positions #2 and #5 (indices 1 and 4)
const SLIDES = [
  { id: 1, label: "Example 1", type: "image" },
  { id: 2, label: "Example 2", type: "video" },
  { id: 3, label: "Example 3", type: "image" },
  { id: 4, label: "Example 4", type: "image" },
  { id: 5, label: "Example 5", type: "video" },
  { id: 6, label: "Example 6", type: "image" },
];

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
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex gap-6">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_280px] min-w-0 sm:flex-[0_0_320px] lg:flex-[0_0_280px] mr-4"
            >
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-800 shadow-lg border border-zinc-700/50 group">
                {/* Placeholder Content - Replace with actual images/GIFs */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <div className="w-16 h-16 rounded-full bg-zinc-700/50 flex items-center justify-center mb-4">
                    {slide.type === "video" ? (
                      <svg
                        className="w-8 h-8 text-zinc-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-zinc-400 font-medium">{slide.label}</span>
                  <span className="text-zinc-500 text-sm mt-1">
                    {slide.type === "video" ? "Video/GIF" : "Image"}
                  </span>
                </div>

                {/* Hover overlay with replace hint */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white/80 text-sm font-medium px-4 text-center">
                    Replace with your {slide.type === "video" ? "video/GIF" : "image"}
                  </span>
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="text-xs text-white/90 font-medium">
                    {slide.type === "video" ? "Video" : "Image"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center shadow-lg transition-all hover:bg-zinc-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
          !canScrollPrev && "opacity-50 cursor-not-allowed"
        )}
        disabled={!canScrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-300" />
      </button>
      
      <button
        onClick={scrollNext}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center shadow-lg transition-all hover:bg-zinc-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
          !canScrollNext && "opacity-50 cursor-not-allowed"
        )}
        disabled={!canScrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-zinc-300" />
      </button>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50",
              selectedIndex === index
                ? "bg-yellow-500 w-8"
                : "bg-zinc-600 hover:bg-zinc-500"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
