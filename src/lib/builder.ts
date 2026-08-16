/**
 * NadoCove's Builder ID + fee rate, applied to every order placed from the
 * trade panel. Defaults to 0 (no builder) until an ID is approved via
 * https://tally.so/r/0QO4oy — see .env.example.
 */
export const BUILDER_ID = Number(process.env.NEXT_PUBLIC_BUILDER_ID ?? 0);

// In 0.1bps units (10 = 1bps = 0.01%). Only meaningful when BUILDER_ID > 0.
export const BUILDER_FEE_RATE = Number(
  process.env.NEXT_PUBLIC_BUILDER_FEE_RATE ?? 0,
);
