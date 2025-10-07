"use client";
import React from "react";
import Image from "next/image";
import { ALL_BRANDS } from "../data/brands";

export default function SelectedBrands() {
  return (
    <section
      id="partners"
      className="relative w-full pt-20 pb-10 md:pt-24 md:pb-16 border-t-2 border-green-500/70"
      aria-labelledby="partners-heading"
    >
      {/* decorative gradient line */}
      <div
        aria-hidden="true"
        className="absolute -top-[2px] left-0 w-full h-[2px] bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"
      />

      {/* Heading */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2
            id="partners-heading"
            className="text-2xl md:text-[32px] font-semibold tracking-tight text-neutral-900"
          >
            A personalised ecosystem starting with{" "}
            <span className="text-green-600">30+ Selected Brands</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
            Join Corra Club - Your perfectly curated brand eco-system to maximize your savings
          </p>
        </div>
      </div>

      {/* Full-width marquee */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="group relative overflow-hidden py-2">
          <div className="flex w-max animate-marquee">
            {[...ALL_BRANDS, ...ALL_BRANDS].map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="mx-2 first:ml-4 last:mr-4 md:first:ml-8 md:last:mr-8 min-w-[170px] md:min-w-[200px] flex-shrink-0 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  {/* Brand Icon */}
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.color} ring-1 ring-black/5 overflow-hidden`}
                  >
                    {b.icon ? (
                      <Image
                        src={b.icon}
                        alt={b.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-neutral-700">{b.short}</span>
                    )}
                  </div>

                  {/* Brand Name */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900 leading-tight">
                      {b.name}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-neutral-500">
                      {b.short || ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edge gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-green-50 via-green-50/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-green-100 via-green-50/80 to-transparent" />
        </div>
      </div>

      {/* Status indicators */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mt-6 flex flex-col items-center gap-3 md:mt-8">
          <div className="flex items-center gap-6 text-xs md:text-sm font-medium text-neutral-700">
            <StatusDot label="3L+ Active Partners" />
            <Divider />
            <StatusDot label="Growing Daily" />
            <Divider />
            <StatusDot label="Verified Brands" />
          </div>
        </div>
      </div>

      {/* Subtle decorations */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]">
        <div className="absolute -top-10 right-1/3 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-60 w-60 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
        @media (min-width: 768px) {
          .animate-marquee {
            animation-duration: 35s;
          }
        }
      `}</style>
    </section>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-2 rounded-full bg-green-500" />
      <span>{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-1 w-1 rounded-full bg-neutral-300" />;
}
