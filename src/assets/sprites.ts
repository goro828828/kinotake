// SVG symbols copied verbatim from prototype/index.html (original artwork — no Meiji logos/packages).
const SYMBOLS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="kino" viewBox="0 0 100 120">
      <rect x="33" y="50" width="34" height="62" rx="12" fill="#ebcd94" stroke="#c99b5e" stroke-width="2"/>
      <path d="M8 60 C8 14 92 14 92 60 Q50 72 8 60 Z" fill="#6b3f26"/>
      <path d="M22 34 Q34 22 50 21" fill="none" stroke="#9a6a48" stroke-width="5" stroke-linecap="round"/>
      <path d="M11 50 Q50 62 89 50 L90 58 Q50 70 10 58 Z" fill="#c8502a"/>
      <circle cx="43" cy="82" r="3.2" fill="#4a2c1d"/><circle cx="57" cy="82" r="3.2" fill="#4a2c1d"/>
      <path d="M44 91 Q50 96 56 91" fill="none" stroke="#4a2c1d" stroke-width="2.4" stroke-linecap="round"/>
    </symbol>
    <symbol id="take" viewBox="0 0 100 120">
      <path d="M50 6 C66 30 80 62 78 92 Q50 106 22 92 C20 62 34 30 50 6 Z" fill="#8a5634"/>
      <path d="M50 6 C60 22 68 40 72 58 Q50 66 28 58 C32 40 40 22 50 6 Z" fill="#5e3620"/>
      <path d="M22 88 Q50 102 78 88 L78 98 Q50 114 22 98 Z" fill="#ebcd94" stroke="#c99b5e" stroke-width="2"/>
      <path d="M27 66 Q50 76 73 66 L74 73 Q50 84 26 73 Z" fill="#3f8a3a"/>
      <circle cx="42" cy="49" r="3.6" fill="#fff"/><circle cx="58" cy="49" r="3.6" fill="#fff"/>
      <circle cx="42.6" cy="49.6" r="1.9" fill="#2b1d14"/><circle cx="58.6" cy="49.6" r="1.9" fill="#2b1d14"/>
    </symbol>
    <symbol id="pk" viewBox="0 0 80 60"><rect x="28" y="24" width="24" height="34" rx="8" fill="#ebcd94" stroke="#c99b5e" stroke-width="2"/><path d="M3 30 C3 2 77 2 77 30 Q40 38 3 30 Z" fill="#6b3f26"/><path d="M16 15 Q26 8 38 7" fill="none" stroke="#9a6a48" stroke-width="4" stroke-linecap="round"/></symbol>
    <symbol id="pt" viewBox="0 0 60 70"><path d="M30 2 C42 18 50 38 49 56 Q30 64 11 56 C10 38 18 18 30 2 Z" fill="#8a5634"/><path d="M30 2 C37 12 42 24 44 34 Q30 39 16 34 C18 24 23 12 30 2 Z" fill="#5e3620"/><path d="M11 53 Q30 62 49 53 L49 60 Q30 70 11 60 Z" fill="#ebcd94" stroke="#c99b5e" stroke-width="2"/></symbol>
    <!-- featured flavors: mango kinoko / pistachio takenoko (original drawings, sticker style) -->
    <linearGradient id="gMango" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#f5a100"/></linearGradient>
    <linearGradient id="gPista" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe57a"/><stop offset="1" stop-color="#76a52a"/></linearGradient>
    <symbol id="km" viewBox="0 0 100 120">
      <g fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"><rect x="33" y="52" width="34" height="60" rx="14"/><path d="M6 62 C6 12 94 12 94 62 Q50 76 6 62 Z"/></g>
      <rect x="33" y="52" width="34" height="60" rx="14" fill="#f6e2a8" stroke="#b9873f" stroke-width="2.5"/>
      <path d="M6 62 C6 12 94 12 94 62 Q50 76 6 62 Z" fill="url(#gMango)" stroke="#c47a00" stroke-width="2.5"/>
      <path d="M10 57 Q50 69 90 57 L90 62 Q50 75 10 62 Z" fill="#e08a00" opacity=".45"/>
      <path d="M22 36 Q32 23 50 20" fill="none" stroke="#fff8cc" stroke-width="6" stroke-linecap="round" opacity=".9"/>
    </symbol>
    <symbol id="tp" viewBox="0 0 100 120">
      <g fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"><path d="M50 4 C68 30 82 66 80 94 Q50 108 20 94 C18 66 32 30 50 4 Z"/><path d="M20 88 Q50 102 80 88 L80 100 Q50 116 20 100 Z"/></g>
      <path d="M50 4 C68 30 82 66 80 94 Q50 108 20 94 C18 66 32 30 50 4 Z" fill="url(#gPista)" stroke="#5f8a22" stroke-width="2.5"/>
      <path d="M33 46 Q50 53 67 46 M27 68 Q50 77 73 68" fill="none" stroke="#5f8a22" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
      <g fill="#e6d34c"><path d="M44 30 l5 -3 3 5 -5 3 Z"/><path d="M58 58 l6 -2 2 5 -6 2 Z"/><path d="M36 58 l5 1 -1 5 -5 -1 Z"/><path d="M52 80 l6 0 0 5 -6 0 Z"/><path d="M64 36 l4 2 -2 4 -4 -2 Z"/></g>
      <path d="M20 88 Q50 102 80 88 L80 100 Q50 116 20 100 Z" fill="#f0d48a" stroke="#b9873f" stroke-width="2.5"/>
      <g fill="#d4a95a"><circle cx="34" cy="100" r="1.6"/><circle cx="48" cy="104" r="1.6"/><circle cx="62" cy="101" r="1.6"/><circle cx="72" cy="96" r="1.6"/></g>
      <path d="M40 22 Q46 14 50 10" fill="none" stroke="#f2f8d0" stroke-width="5" stroke-linecap="round" opacity=".85"/>
    </symbol>
    <!-- stackable pieces in the featured flavors (same shapes as pk / pt) -->
    <symbol id="pkm" viewBox="0 0 80 60"><rect x="28" y="24" width="24" height="34" rx="8" fill="#f6e2a8" stroke="#b9873f" stroke-width="2"/><path d="M3 30 C3 2 77 2 77 30 Q40 38 3 30 Z" fill="url(#gMango)" stroke="#c47a00" stroke-width="2"/><path d="M6 27 Q40 35 74 27 L74 30 Q40 38 6 30 Z" fill="#e08a00" opacity=".45"/><path d="M16 15 Q26 8 38 7" fill="none" stroke="#fff8cc" stroke-width="4" stroke-linecap="round"/></symbol>
    <symbol id="ptp" viewBox="0 0 60 70"><path d="M30 2 C42 18 50 38 49 56 Q30 64 11 56 C10 38 18 18 30 2 Z" fill="url(#gPista)" stroke="#5f8a22" stroke-width="2"/><path d="M19 28 Q30 33 41 28 M15 43 Q30 49 45 43" fill="none" stroke="#5f8a22" stroke-width="2" stroke-linecap="round" opacity=".7"/><g fill="#e6d34c"><path d="M27 17 l4 -2 2 4 -4 2 Z"/><path d="M35 36 l4 -1 1 4 -4 1 Z"/><path d="M21 37 l4 1 -1 4 -4 -1 Z"/></g><path d="M11 53 Q30 62 49 53 L49 60 Q30 70 11 60 Z" fill="#f0d48a" stroke="#b9873f" stroke-width="2"/><path d="M25 12 Q28 7 30 5" fill="none" stroke="#f2f8d0" stroke-width="3" stroke-linecap="round" opacity=".85"/></symbol>
    <!-- harvest relay (original simple drawings) -->
    <symbol id="cacao" viewBox="0 0 40 40"><path d="M20 3 C31 6 34 20 31 30 C28 37 12 37 9 30 C6 20 9 6 20 3 Z" fill="#c8742a"/><path d="M20 5 V35 M14 7 C11 16 11 26 13 33 M26 7 C29 16 29 26 27 33" stroke="#9a4f1a" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>
    <symbol id="wheat" viewBox="0 0 40 40"><path d="M20 38 V8" stroke="#b8862f" stroke-width="2.5" stroke-linecap="round"/><g fill="#e3b553" stroke="#b8862f" stroke-width="1"><ellipse cx="20" cy="7" rx="3.5" ry="5.5"/><ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(-30 15.5 13)"/><ellipse cx="24.5" cy="13" rx="3.5" ry="5.5" transform="rotate(30 24.5 13)"/><ellipse cx="15.5" cy="20" rx="3.5" ry="5.5" transform="rotate(-30 15.5 20)"/><ellipse cx="24.5" cy="20" rx="3.5" ry="5.5" transform="rotate(30 24.5 20)"/><ellipse cx="15.5" cy="27" rx="3.5" ry="5.5" transform="rotate(-30 15.5 27)"/><ellipse cx="24.5" cy="27" rx="3.5" ry="5.5" transform="rotate(30 24.5 27)"/></g></symbol>
    <symbol id="milk" viewBox="0 0 40 40"><rect x="15" y="2" width="10" height="5" rx="1.5" fill="#4a7fb5"/><path d="M15 7 H25 V11 L29 17 V35 Q29 38 26 38 H14 Q11 38 11 35 V17 L15 11 Z" fill="#fff" stroke="#8fb3d9" stroke-width="2"/><rect x="12" y="21" width="16" height="9" fill="#8fb3d9"/></symbol>
    <symbol id="bug" viewBox="0 0 40 40"><g stroke="#3b2a20" stroke-width="2" stroke-linecap="round"><path d="M10 18 L4 14 M10 24 L3 24 M10 30 L4 34 M30 18 L36 14 M30 24 L37 24 M30 30 L36 34 M17 7 L13 2 M23 7 L27 2"/></g><ellipse cx="20" cy="25" rx="10" ry="12" fill="#5a4a6e"/><path d="M20 13 V37" stroke="#3b2f48" stroke-width="1.5"/><circle cx="20" cy="10" r="5.5" fill="#3b2f48"/><circle cx="18" cy="9" r="1.3" fill="#fff"/><circle cx="22" cy="9" r="1.3" fill="#fff"/></symbol>
    <symbol id="basket" viewBox="0 0 100 50"><path d="M5 12 H95 L85 47 H15 Z" fill="#d7a868" stroke="#8a5634" stroke-width="3" stroke-linejoin="round"/><path d="M10 24 H90 M13 35 H87 M35 12 L38 47 M65 12 L62 47 M50 12 V47" stroke="#a87444" stroke-width="2" fill="none"/><rect x="2" y="6" width="96" height="9" rx="4.5" fill="#8a5634"/></symbol>
    <!-- quiz -->
    <symbol id="globe" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#7fb5d9" stroke="#4a7fb5" stroke-width="2"/><path d="M9 13 C13 10 17 12 16 16 C15 20 10 19 9 23 C8 19 7 15 9 13 Z M22 7 C27 8 31 12 30 15 C27 16 25 13 22 15 C20 12 20 9 22 7 Z M21 22 C26 20 31 22 30 27 C28 32 24 34 22 31 C21 28 18 26 21 22 Z" fill="#6aa84f"/><ellipse cx="20" cy="20" rx="8" ry="17" fill="none" stroke="#4a7fb5" stroke-width="1"/><path d="M3 20 H37" stroke="#4a7fb5" stroke-width="1"/></symbol>
  </defs>
</svg>`;

export function injectSprites(): void {
  document.body.insertAdjacentHTML('afterbegin', SYMBOLS);
}

/** Inline SVG that references a symbol. */
export function useSvg(id: string, viewBox: string): string {
  return `<svg viewBox="${viewBox}" aria-hidden="true"><use href="#${id}"/></svg>`;
}
