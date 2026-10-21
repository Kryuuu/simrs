"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Register Service Worker safely
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration failed: ", err);
        });
      });
    }

    // Detect iOS
    const isIosDevice =
      typeof window !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIOS(Boolean(isIosDevice));

    // Handle standard Android/Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt && !showIOSGuide) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700 animate-slide-up no-print">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-lg bg-teal-600/20 text-teal-400 shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white">Instal SIMRS di Perangkat Anda</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Dapatkan pengalaman aplikasi mandiri (PWA) yang cepat, responsif, dan hemat bandwidth di Android/iOS/Desktop.
          </p>

          {showIOSGuide && (
            <div className="mt-2.5 p-2 rounded bg-slate-800 text-[10px] text-teal-300 space-y-1 border border-slate-700">
              <p className="font-semibold flex items-center gap-1">
                <Info className="h-3 w-3" /> Petunjuk iOS Safari:
              </p>
              <p>1. Ketuk ikon <strong>Bagikan (Share)</strong> di bilah bawah browser.</p>
              <p>2. Gulir ke bawah dan pilih <strong>&quot;Tambah ke Layar Utama (Add to Home Screen)&quot;</strong>.</p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {!showIOSGuide && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-7 text-xs bg-teal-600 hover:bg-teal-500 text-white font-medium"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Instal Sekarang
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowPrompt(false);
                setShowIOSGuide(false);
              }}
              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Nanti Saja
            </Button>
          </div>
        </div>
        <button
          onClick={() => {
            setShowPrompt(false);
            setShowIOSGuide(false);
          }}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
