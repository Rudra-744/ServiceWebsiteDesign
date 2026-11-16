"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// register once, client side only
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
