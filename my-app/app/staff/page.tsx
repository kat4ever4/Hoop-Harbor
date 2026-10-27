"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Search, Star } from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";


export default function RosterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />

      <main className="mx-auto w-full max-w-7xl flex-grow p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Staff</h1>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        </div>
      </main>
    </div>
  );
}
