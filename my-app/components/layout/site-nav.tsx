"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Settings, Users } from "lucide-react";
import { APP_CONFIG } from "@/lib/app-config";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/staff", label: "Staff", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-slate-900 text-white shadow">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/icon.png"
            alt=""
            width={48}
            height={48}
            className="mr-3 rounded object-contain"
          />
          <span className="text-xl font-bold tracking-wide">{APP_CONFIG.name}</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-1 text-sm font-medium sm:gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                    : "flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:text-white"
                }
              >
                <Icon className={active ? "h-4 w-4 text-indigo-400" : "h-4 w-4"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
