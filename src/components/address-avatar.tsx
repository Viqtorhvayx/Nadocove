const PALETTE = [
  "#7C93FF", // cove indigo
  "#F5B942", // cove amber
  "#34D399", // positive
  "#A78BFA",
  "#22D3EE",
  "#FF8C7A", // cove coral
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

/** Deterministic mulberry32 PRNG, seeded from the address hash, so the same
 * address always produces the same mosaic. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRID = 5;

/**
 * A generative pixel-mosaic avatar for a wallet address — no external
 * image/service, no identicon library dependency. Deterministic from the
 * address (mirrored left/right for a symmetric blockie look), colored from
 * the app's own brand palette so it feels native rather than a random hue.
 */
export function AddressAvatar({ address, size = 40, className }: { address: string; size?: number; className?: string }) {
  const rand = mulberry32(hashString(address.toLowerCase()));
  const half = Math.ceil(GRID / 2);
  const cellColors: string[][] = [];
  const bg = PALETTE[Math.floor(rand() * PALETTE.length)];

  for (let row = 0; row < GRID; row++) {
    const rowColors: string[] = [];
    for (let col = 0; col < half; col++) {
      const filled = rand() > 0.45;
      const color = filled ? PALETTE[Math.floor(rand() * PALETTE.length)] : "transparent";
      rowColors.push(color);
    }
    const mirrored = [...rowColors, ...rowColors.slice(0, GRID - half).reverse()];
    cellColors.push(mirrored);
  }

  const cell = 100 / GRID;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 rounded-full ${className ?? ""}`}
      role="img"
      aria-label="Wallet avatar"
    >
      <rect width="100" height="100" fill={bg} fillOpacity={0.25} />
      {cellColors.map((row, r) =>
        row.map((color, c) =>
          color === "transparent" ? null : (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />
          ),
        ),
      )}
    </svg>
  );
}
