export type ExampleSlide =
  | {
      id: string;
      label: string;
      type: "image";
      src: string;
      alt: string;
    }
  | {
      id: string;
      label: string;
      type: "video";
      src: string;
      poster: string;
      alt: string;
    };

// Keep this list shared by the homepage carousel and the full examples gallery.
export const EXAMPLE_SLIDES = [
  {
    id: "influencer-skincare",
    label: "Influencer skincare photo",
    type: "image",
    src: "/examples/influencer-skincare.jpg",
    alt: "Creator presenting an amber skincare bottle in a sunlit bathroom",
  },
  {
    id: "ugc-talking-head",
    label: "UGC talking-head video",
    type: "video",
    src: "/examples/ugc-talking-head.mp4",
    poster: "/examples/ugc-talking-head-poster.jpg",
    alt: "Creator presenting a skincare tube in a bright living room",
  },
  {
    id: "influencer-tumbler",
    label: "Lifestyle product photo",
    type: "image",
    src: "/examples/influencer-tumbler.jpg",
    alt: "Creator presenting an insulated tumbler beside an apartment window",
  },
  {
    id: "coastal-wellness",
    label: "Coastal wellness photo",
    type: "image",
    src: "/examples/coastal-wellness.jpg",
    alt: "Creator presenting a wellness pouch on a sunny coastal patio",
  },
  {
    id: "product-demo",
    label: "Product demo video",
    type: "video",
    src: "/examples/product-demo.mp4",
    poster: "/examples/product-demo-poster.jpg",
    alt: "Creator unboxing an unbranded ceramic travel mug",
  },
] as const satisfies readonly ExampleSlide[];
