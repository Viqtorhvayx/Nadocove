"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ConnectButton } from "@/components/connect-button";
import { SignInButton } from "@/components/sign-in-button";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/dashboard", label: "Dashboard" },
];

/**
 * The one header used on every page — landing, Discover, and the
 * dashboard (connected or not). Previously each page built its own header
 * from scratch, so Discover and the dashboard's logged-out state had no
 * nav links at all: the only way "back" was recognizing a small logo icon
 * as a home button. Same header everywhere means there's always a visible
 * path to every other section of the app.
 */
export function AppHeader({ showNadoDocs = false }: { showNadoDocs?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
      <Link href="/">
        <Logo size={26} />
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6">
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname.startsWith("/dashboard")
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                active
                  ? "font-medium text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {showNadoDocs && (
          <a
            href="https://docs.nado.xyz"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-foreground-muted transition hover:text-foreground sm:inline"
          >
            Nado Docs
          </a>
        )}
        <SignInButton />
        <ConnectButton />
      </nav>
    </header>
  );
}
