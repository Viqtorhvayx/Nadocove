type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * The mark: a teal cove (open ring, mouth facing the water on the right)
 * cradling a calm amber center — the sheltered counterpoint to Nado's storm.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="NadoCove"
    >
      <path
        d="M36.256 34.28 A16 16 0 1 1 36.256 13.72"
        stroke="var(--color-cove-teal, #2DD4BF)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="24" r="5.5" fill="var(--color-cove-amber, #F5B942)" />
    </svg>
  );
}

type LogoProps = LogoMarkProps & {
  wordmark?: boolean;
};

export function Logo({ size = 28, className, wordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} className={className} />
      {wordmark && (
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: size * 0.64 }}
        >
          Nado<span className="text-cove-teal">Cove</span>
        </span>
      )}
    </span>
  );
}
