"use client";

import { usePathname, useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import React from "react";

const steps = [
  { key: "upload", label: "Upload Receipt", href: "/upload" },
  { key: "phone", label: "Phone Verification", href: "/upload/phone" },
  { key: "success", label: "Success", href: "/upload/success" },
];

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeIdx =
    pathname.endsWith("/phone") ? 1 :
    pathname.endsWith("/success") ? 2 : 0;

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <BackButton />
        </div>
        {/* Stepper */}
        <nav aria-label="Progress" className="mb-10">
          <ol className="flex items-center justify-center gap-4 sm:gap-10">
            {steps.map((s, i) => {
              const state = i < activeIdx ? "done" : i === activeIdx ? "current" : "upcoming";
              return (
                <li key={s.key} className="flex items-center gap-4">
                  <button
                    disabled={state === "upcoming"}
                    onClick={() => state === "done" ? router.push(s.href) : null}
                    className="flex flex-col items-center group disabled:cursor-default"
                  >
                    <span
                      className={`h-12 w-12 rounded-full grid place-items-center text-sm font-medium transition-all ${
                        state === "done"
                          ? "bg-green-600 text-white"
                          : state === "current"
                          ? "bg-green-600 text-white ring-4 ring-green-600/25"
                          : "bg-black/10 text-black/50"
                      }`}
                    >
                      {state === "done" ? (
                        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                          <path d="M7.5 10.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      ) : i + 1}
                    </span>
                    <span
                      className={`mt-2 text-xs sm:text-sm font-medium tracking-wide text-center ${
                        state === "current"
                          ? "text-green-700"
                          : state === "done"
                          ? "text-green-600"
                          : "text-black/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block w-24 h-px bg-black/20 relative">
                      <div
                        className={`absolute inset-0 origin-left bg-green-600 transition-transform duration-700 ${
                          i < activeIdx ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        {children}
      </main>
    </div>
  );
}
