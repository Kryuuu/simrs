"use client";

import React, { useState } from "react";
import { useSIMRS } from "@/lib/demo-store";
import { AlertCircle, RotateCcw, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoBanner() {
  const { isDemoMode, resetToInitialDemoData } = useSIMRS();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="demo-banner bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-4 transition-all z-40">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold px-1.5 py-0.5 rounded-sm bg-amber-200/60 text-amber-950 text-[10px] tracking-wide uppercase">
          Mode Demo Interaktif
        </span>
        <span className="hidden sm:inline text-amber-800">
          Supabase cloud belum dikonfigurasi di <code>.env.local</code>. Seluruh modul, transaksi FEFO, antrean, dan rekam medis berjalan penuh secara lokal.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={resetToInitialDemoData}
          className="h-6 px-2 text-[11px] bg-white/80 border-amber-300 hover:bg-amber-100 text-amber-900"
          title="Reset semua perubahan data ke seed awal"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset Demo
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 p-0.5 rounded"
          title="Sembunyikan banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
