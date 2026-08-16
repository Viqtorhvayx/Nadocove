import type { ReactNode } from "react";

type CardProps = {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, note, children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {note && <span className="text-xs text-foreground-muted">{note}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
