"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { EXAMPLE_SLIDES, type ExampleSlide } from "@/lib/examples";
import { cn } from "@/lib/utils";

function GalleryCard({
  slide,
  onOpen,
}: {
  slide: ExampleSlide;
  onOpen: (slide: ExampleSlide) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(slide)}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800 text-left shadow-lg transition-all hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Open ${slide.label}`}
    >
      {slide.type === "image" ? (
        <Image
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
      ) : (
        <div className="absolute inset-0">
          <Image
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            src={slide.poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="ml-1 h-10 w-10 fill-current" aria-hidden="true" />
            <span className="sr-only">Play video</span>
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center">
        <span className="mb-2 text-lg font-semibold text-white">{slide.label}</span>
        <span className="text-sm text-white/80">
          {slide.type === "video" ? "Video" : "Image"}
        </span>
        <span className="mt-3 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
          Click to view
        </span>
      </div>

      <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
        {slide.type === "video" ? "Video" : "Image"}
      </span>
    </button>
  );
}

export function ExampleGallery() {
  const [selectedSlide, setSelectedSlide] = useState<ExampleSlide | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {EXAMPLE_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "lg:col-span-2",
              index === 3 && "lg:col-start-2",
              index === 4 &&
                "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-2 lg:col-start-4 lg:mx-0 lg:w-full"
            )}
          >
            <GalleryCard slide={slide} onOpen={setSelectedSlide} />
          </div>
        ))}
      </div>

      <Dialog
        open={selectedSlide !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSlide(null);
        }}
      >
        {selectedSlide && (
          <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-zinc-700 bg-zinc-950 p-4 sm:p-6">
            <DialogTitle>{selectedSlide.label}</DialogTitle>
            <DialogDescription className="sr-only">
              Enlarged {selectedSlide.type} preview for {selectedSlide.label}.
              Press Escape or use Close to return to the examples gallery.
            </DialogDescription>

            <div className="flex min-h-0 items-center justify-center rounded-lg bg-black/40 p-2 sm:p-4">
              {selectedSlide.type === "image" ? (
                <Image
                  className="max-h-[calc(92vh-11rem)] h-auto w-auto object-contain"
                  src={selectedSlide.src}
                  alt={selectedSlide.alt}
                  width={941}
                  height={1672}
                  sizes="(min-width: 1024px) 70vw, 92vw"
                />
              ) : (
                <video
                  className="max-h-[calc(92vh-11rem)] h-auto w-auto max-w-full object-contain"
                  src={selectedSlide.src}
                  poster={selectedSlide.poster}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  aria-label={selectedSlide.alt}
                />
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
