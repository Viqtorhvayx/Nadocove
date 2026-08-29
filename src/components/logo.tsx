type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * The mark: an asymmetric indigo inlet — an organic cove shape, not a
 * geometric ring — cradling a calm amber sun/center. The sheltered
 * counterpoint to Nado's storm.
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
        d="M6 24 C6 12 16 6 26 8 C36 10 42 18 40 26 C38 34 28 40 18 38 C10 36.5 6 30 6 24 Z"
        fill="var(--color-cove-indigo, #7C93FF)"
      />
      <circle cx="27" cy="22" r="6" fill="var(--color-cove-amber, #F5B942)" />
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
          Nado<span className="text-cove-indigo">Cove</span>
        </span>
      )}
    </span>
  );
}
