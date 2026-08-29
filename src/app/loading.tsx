import { LogoMark } from "@/components/logo";

/**
 * Shown automatically by Next.js while a route segment's data is loading —
 * same aurora-gradient language as the landing page instead of a bare
 * spinner, so a full-page navigation doesn't flash to plain black.
 */
export default function Loading() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cove-indigo/25 blur-[110px]" />
        <div
          className="aurora-blob absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cove-amber/15 blur-[110px]"
          style={{ animationDelay: "-7s", animationDuration: "20s" }}
        />
      </div>
      <div className="cove-fade-in flex flex-col items-center gap-3">
        <div className="animate-pulse">
          <LogoMark size={40} />
        </div>
        <p className="text-sm text-foreground-muted">Loading…</p>
      </div>
    </div>
  );
}
