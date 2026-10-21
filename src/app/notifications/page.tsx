"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Pill,
  FlaskConical,
  Boxes,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { useSIMRS } from "@/lib/demo-store";
import { formatTime } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useSIMRS();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-600" />
            Pusat Notifikasi & Tugas Klinis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan real-time untuk order cito, telaah resep baru, dan peringatan stok minimum.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md font-medium border transition-all ${
              filter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-md font-medium border transition-all ${
              filter === "unread"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Belum Dibaca
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((item) => (
            <Card
              key={item.id}
              className={`border transition-all ${
                !item.is_read
                  ? "border-teal-200 bg-teal-50/20 shadow-xs"
                  : "border-slate-200/90 bg-white"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      item.severity === "alert"
                        ? "bg-red-100 text-red-700"
                        : item.severity === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {item.category === "laboratorium" ? (
                      <FlaskConical className="h-4 w-4" />
                    ) : item.category === "stok" ? (
                      <Boxes className="h-4 w-4" />
                    ) : item.category === "resep" ? (
                      <Pill className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      {!item.is_read && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-600 text-white uppercase">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{item.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-2">
                      {formatTime(item.created_at)} WITA
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.link && (
                    <Link href={item.link}>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-slate-200 hover:bg-slate-50">
                        Buka Modul <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {!item.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markNotificationRead(item.id)}
                      className="h-7 text-xs text-slate-500 hover:text-slate-800"
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      Tandai Dibaca
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center border-slate-200">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-700 text-sm">Tidak ada notifikasi aktif</h4>
            <p className="text-slate-400 text-xs mt-0.5">Semua tugas dan pemberitahuan telah selesai ditinjau.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
