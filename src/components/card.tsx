import type { ReactNode } from "react";

type CardProps = {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, note, children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_16px_32px_-18px_rgba(0,0,0,0.7)] ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {note && <span className="text-xs text-foreground-muted">{note}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
