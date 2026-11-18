// Start-screen key visual: stadium, title with laurel and crown, mango vs pistachio.
// Drawn in SVG after the campaign key visual (no logos or package images).

/** Leaves along a quadratic laurel branch (x0,y0)->(cx,cy)->(x1,y1). */
function laurel(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number): string {
  let s = `<path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" fill="none" stroke="#e0a312" stroke-width="2.5" stroke-linecap="round"/>`;
  for (let i = 1; i <= 6; i++) {
    const t = i / 6.6;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    for (const side of [-40, 40]) {
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="3.6" transform="rotate(${(a + side).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(6 0)" fill="#f7c429" stroke="#fff" stroke-width="1.2"/>`;
    }
  }
  return s;
}

const CONFETTI: [number, number, number, string][] = [
  [92, 22, 20, '#f7c429'], [128, 52, -30, '#e8503a'], [300, 18, 35, '#f7c429'], [268, 48, -15, '#4fb3ff'],
  [352, 92, 25, '#e8503a'], [44, 96, -20, '#f7c429'], [182, 132, 40, '#e8503a'], [226, 128, -35, '#f7c429'],
];

export function heroSvg(): string {
  const confetti = CONFETTI.map(([x, y, r, c]) =>
    `<rect x="${x}" y="${y}" width="7" height="4" rx="1" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('');
  return `
<svg class="hero-svg" viewBox="0 0 400 250" role="img" aria-label="きのたけカップ 今大会はマンゴーの山 対 ピスタチオの里">
  <defs>
    <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d8ce0"/><stop offset="1" stop-color="#a6dcff"/></linearGradient>
    <pattern id="hCrowd" width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#c9d6ee"/>
      <circle cx="3" cy="3" r="2.4" fill="#f28b82"/><circle cx="10" cy="4" r="2.4" fill="#8ab4f8"/>
      <circle cx="6.5" cy="8" r="2.4" fill="#fdd663"/><circle cx="12.5" cy="9" r="2" fill="#c58af9"/>
    </pattern>
  </defs>
  <rect width="400" height="250" fill="url(#hSky)"/>
  <g fill="#fff" opacity=".9">
    <ellipse cx="44" cy="40" rx="30" ry="11"/><ellipse cx="64" cy="33" rx="18" ry="11"/>
    <ellipse cx="350" cy="30" rx="34" ry="11"/><ellipse cx="330" cy="24" rx="18" ry="10"/>
    <ellipse cx="372" cy="64" rx="22" ry="8"/>
  </g>
  <!-- stands and field -->
  <path d="M0 150 Q200 104 400 150 V206 H0 Z" fill="url(#hCrowd)"/>
  <path d="M0 150 Q200 104 400 150" fill="none" stroke="#eef3fb" stroke-width="5"/>
  <path d="M0 196 Q200 178 400 196 V250 H0 Z" fill="#7fcd52"/>
  <path d="M0 214 Q200 198 400 214 M0 234 Q200 220 400 234" fill="none" stroke="#a3de7c" stroke-width="7"/>
  ${confetti}
  <!-- flags of origin: India (mango) / Italy (pistachio) -->
  <g>
    <line x1="14" y1="146" x2="14" y2="206" stroke="#eef3fb" stroke-width="2.5"/>
    <rect x="15" y="146" width="30" height="7" fill="#ff9933"/><rect x="15" y="153" width="30" height="7" fill="#fff"/><rect x="15" y="160" width="30" height="7" fill="#138808"/>
    <circle cx="30" cy="156.5" r="2.6" fill="none" stroke="#0b3d91" stroke-width="1"/>
    <line x1="386" y1="146" x2="386" y2="206" stroke="#eef3fb" stroke-width="2.5"/>
    <rect x="355" y="146" width="10" height="21" fill="#009246"/><rect x="365" y="146" width="10" height="21" fill="#fff"/><rect x="375" y="146" width="10" height="21" fill="#ce2b37"/>
  </g>
  <!-- crown, laurel, title -->
  ${laurel(66, 116, 30, 86, 50, 34)}
  ${laurel(334, 116, 370, 86, 350, 34)}
  <path d="M180 42 L175 16 L189 28 L200 8 L211 28 L225 16 L220 42 Z" fill="#f7c429" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="200" cy="30" r="3" fill="#e8503a"/>
  <text x="200" y="83" text-anchor="middle" class="hero-title" font-size="40" fill="#4a2c1d" stroke="#fff" stroke-width="9" stroke-linejoin="round" paint-order="stroke">きのたけカップ</text>
  <path d="M112 94 H288 L280 105 L288 116 H112 L120 105 Z" fill="#fff8e6" stroke="#f0b93a" stroke-width="2"/>
  <text x="200" y="110" text-anchor="middle" font-size="12.5" font-weight="900" letter-spacing="2" fill="#d6402f">KINOTAKE CUP</text>
  <!-- featured flavors -->
  <use href="#km" x="44" y="120" width="96" height="115"/>
  <use href="#tp" x="260" y="120" width="96" height="115"/>
  <text x="200" y="196" text-anchor="middle" font-size="30" font-weight="900" font-style="italic" fill="#d6402f" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke">VS</text>
  <g font-size="12" font-weight="900" text-anchor="middle" fill="#fff">
    <rect x="42" y="228" width="100" height="20" rx="10" fill="#e07a0a" stroke="#fff" stroke-width="2"/>
    <text x="92" y="242">マンゴーの山</text>
    <rect x="252" y="228" width="112" height="20" rx="10" fill="#5f8f24" stroke="#fff" stroke-width="2"/>
    <text x="308" y="242">ピスタチオの里</text>
  </g>
</svg>`;
}
