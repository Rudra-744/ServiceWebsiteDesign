// Section layout patterns shared by every page (reference .head / .head.split / .band).
export const HEAD = "mb-[clamp(40px,6vw,88px)] grid gap-[22px]";
export const HEAD_SPLIT = `${HEAD} min-[960px]:grid-cols-[1.25fr_1fr] min-[960px]:items-end min-[960px]:gap-[6vw]`;
/** cornflower CTA band */
export const BAND = "grid gap-7 rounded-stage bg-blue p-[clamp(36px,6vw,96px)] text-ink min-[960px]:grid-cols-[1.4fr_auto] min-[960px]:items-end";
export const BAND_P = "mt-[14px] max-w-[30em] text-[rgba(5,5,5,.75)]";
