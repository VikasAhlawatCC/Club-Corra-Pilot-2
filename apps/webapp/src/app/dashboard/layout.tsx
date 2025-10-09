"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
      }
    } catch {}
    router.push("/login");
  }

  return (
    <div className="font-sans min-h-screen relative overflow-hidden">
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-2 border-green-600 hover:border-green-700 text-green-600 hover:text-green-700 hover:bg-green-50 px-6 py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          Logout
        </Button>
      </div>

      {/* Coordinated background with main theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-green-50/60 to-emerald-50/40" />
      <div className="absolute inset-0 bg-gradient-to-tl from-white/80 via-transparent to-green-100/30" />

      {/* Subtle coin-themed pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-8 h-8 border-2 border-green-300/50 rounded-full" />
        <div className="absolute top-40 right-32 w-6 h-6 border-2 border-emerald-300/60 rounded-full" />
        <div className="absolute bottom-40 left-1/3 w-10 h-10 border-2 border-green-400/40 rounded-full" />
        <div className="absolute bottom-20 right-20 w-7 h-7 border-2 border-emerald-300/50 rounded-full" />
      </div>

      {/* Background blur elements */}
      <div className="absolute top-32 right-1/4 w-36 h-36 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-1/4 w-44 h-44 bg-gradient-to-tr from-green-200/15 to-emerald-300/15 rounded-full blur-3xl" />

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
