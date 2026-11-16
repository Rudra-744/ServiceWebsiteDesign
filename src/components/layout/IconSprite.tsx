// SVG icon sprite from the reference index.html. Use with <svg><use href="#i-name" /></svg>.
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const S2 = { ...S, strokeWidth: 2 } as const;

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-expo" viewBox="0 0 24 24"><g {...S}><rect x="3" y="4" width="18" height="11" rx="1.5" /><path d="M8 21h8M12 15v6M7 8h6M7 11h3" /></g></symbol>
        <symbol id="i-school" viewBox="0 0 24 24"><g {...S}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v5" /></g></symbol>
        <symbol id="i-lamp" viewBox="0 0 24 24"><g {...S}><path d="M3 13h18c0 4-4 6.5-9 6.5S3 17 3 13z" /><path d="M12 13c-2.2-2-1.4-5 0-8.5 1.4 3.5 2.2 6.5 0 8.5z" /></g></symbol>
        <symbol id="i-house" viewBox="0 0 24 24"><g {...S}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10M10 20v-5h4v5" /></g></symbol>
        <symbol id="i-brief" viewBox="0 0 24 24"><g {...S}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></g></symbol>
        <symbol id="i-rings" viewBox="0 0 24 24"><g {...S}><circle cx="9" cy="14.5" r="5" /><circle cx="15" cy="14.5" r="5" /><path d="M10 7l2-3 2 3" /></g></symbol>
        <symbol id="i-cake" viewBox="0 0 24 24"><g {...S}><path d="M4 20h16M5 20v-7h14v7M5 15.5c2.3 1.4 4.7 1.4 7 0s4.7-1.4 7 0M12 13V9.5M12 7c.9-.9.9-1.8 0-3-.9 1.2-.9 2.1 0 3z" /></g></symbol>
        <symbol id="i-party" viewBox="0 0 24 24"><g {...S}><path d="M12 3c3.3 0 6 2.6 6 6 0 3.6-3 6.5-6 6.5S6 12.6 6 9c0-3.4 2.7-6 6-6z" /><path d="M11 17.5h2M12 17.5c0 2-2 2-2 4" /></g></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z" /></symbol>
        <symbol id="i-factory" viewBox="0 0 24 24"><g {...S}><path d="M3 21V10l6 4v-4l6 4V5h5v16z" /><path d="M7 17.5h2M11.5 17.5h2M16 17.5h2" /></g></symbol>
        <symbol id="i-campus" viewBox="0 0 24 24"><g {...S}><path d="M3 9l9-5 9 5zM5.5 9v9M9.8 9v9M14.2 9v9M18.5 9v9M3 20h18" /></g></symbol>
        <symbol id="i-mountain" viewBox="0 0 24 24"><g {...S}><path d="M2 20l7-11 4 6 2.5-3.5L22 20z" /><circle cx="17" cy="6" r="2" /></g></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><g {...S}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" /></g></symbol>
        <symbol id="i-hospital" viewBox="0 0 24 24"><g {...S}><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M12 8v6M9 11h6" /></g></symbol>
        <symbol id="i-cam" viewBox="0 0 24 24"><g {...S}><path d="M3 8h4l2-3h6l2 3h4v12H3z" /><circle cx="12" cy="13.5" r="3.5" /></g></symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" /></g></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g></symbol>
        <symbol id="i-cal" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></g></symbol>
        <symbol id="i-layers" viewBox="0 0 24 24"><g {...S}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5" /></g></symbol>
        <symbol id="i-text" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" d="M5 6h14M12 6v13" /></symbol>
        <symbol id="i-yesno" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6}><rect x="3" y="7.5" width="18" height="9" rx="4.5" /><circle cx="16.5" cy="12" r="2.5" /></g></symbol>
        <symbol id="i-radio" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" /></g></symbol>
        <symbol id="i-checklist" viewBox="0 0 24 24"><g {...S}><path d="M4 7l2 2 3-3M4 15l2 2 3-3M12 8h8M12 16h8" /></g></symbol>
        <symbol id="i-hash" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" /></symbol>
        <symbol id="i-batt" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><rect x="3" y="8" width="16" height="8" rx="2" /><path d="M21.5 11v2M6 11v2" /></g></symbol>
        <symbol id="i-sync" viewBox="0 0 24 24"><g {...S}><path d="M20 8A8 8 0 0 0 6 6M4 3v4h4M4 16a8 8 0 0 0 14 2M20 21v-4h-4" /></g></symbol>
        <symbol id="i-offline" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M3 3l18 18M8.5 16a5 5 0 0 1 7 0M5 12.3a10 10 0 0 1 5-2.5M19 12.3a10 10 0 0 0-3-1.9M12 19.5h.01" /></g></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24"><g {...S}><path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></g></symbol>
        <symbol id="i-vr" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"><path d="M5 7h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3.6l-1.9-2.1a2 2 0 0 0-3 0L8.6 17H5a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" /></g></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><g {...S}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></g></symbol>
        <symbol id="i-tool" viewBox="0 0 24 24"><g {...S}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" /></g></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path {...S2} d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5l13 7.5-13 7.5z" /></symbol>
        <symbol id="i-pause" viewBox="0 0 24 24"><g fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></g></symbol>
        <symbol id="i-up" viewBox="0 0 24 24"><path {...S2} d="M12 19V5M6 11l6-6 6 6" /></symbol>
        <symbol id="i-turnl" viewBox="0 0 24 24"><path {...S2} d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2" /></symbol>
        <symbol id="i-turnr" viewBox="0 0 24 24"><path {...S2} d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h2" /></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></g></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path {...S2} d="M7 17L17 7M9 7h8v8" /></symbol>
        <symbol id="i-rotate" viewBox="0 0 24 24"><g {...S2}><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9" /><path d="M18.5 3.5v4h-4M5.5 20.5v-4h4" /></g></symbol>
        <symbol id="i-reset" viewBox="0 0 24 24"><g {...S2}><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></g></symbol>
      </defs>
    </svg>
  );
}

/** Cyphon logo mark (cornflower circle + ink "C" arc) */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="16" fill="#548CFF" />
      <path d="M21.2 11.6a6.6 6.6 0 1 0 0 8.8" fill="none" stroke="#050505" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
