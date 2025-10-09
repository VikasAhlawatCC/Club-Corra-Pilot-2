"use client";
import * as React from "react";
import Image from "next/image";
import { ALL_BRANDS } from "../data/brands";
import { motion } from "motion/react";

export default function SelectedBrands() {
  return (
    <section
      id="partners"
      className="relative w-full pt-10 pb-10  md:pb-16 border-t-2 border-green-500/70"
      aria-labelledby="partners-heading"
    >
      {/* decorative gradient line */}
      <div
        aria-hidden="true"
        className="absolute -top-[2px] left-0 w-full h-[2px] bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"
      />

      {/* Heading */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-4">
            A personalised rewards world built around{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              30+ exclusive brands
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 px-4 text-sm sm:text-base">
            Meet Corra Club — your go-to destination to earn and save more on every purchase
          </p>
        </motion.div>
        </div>
      </div>

      {/* Full-width marquee */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="group relative overflow-hidden py-2">
          <div className="flex w-max animate-marquee">
            {[...ALL_BRANDS, ...ALL_BRANDS].map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="mx-1 sm:mx-2 first:ml-2 sm:first:ml-4 last:mr-2 sm:last:mr-4 md:first:ml-8 md:last:mr-8 min-w-[140px] sm:min-w-[170px] md:min-w-[200px] flex-shrink-0 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 px-3 py-3 sm:px-4 sm:py-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Brand Icon */}
                  <div
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center  ring-1 ring-black/5 overflow-hidden`}
                  >
                    {b.icon ? (
                      <Image
                        src={b.icon}
                        alt={b.name}
                        width={32}
                        height={32}
                        className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-neutral-700">{b.off}</span>
                    )}
                  </div>

                  {/* Brand Name */}
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 leading-tight">
                      {b.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500">
                      {b.off || ""}%
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
          <div className="flex items-center gap-3 sm:gap-6 text-xs md:text-sm font-medium text-neutral-700">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-center px-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">100+ new brands joining soon</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">Growing Daily</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">Earn cashback on every purchase</span>
          </div>
        </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle decorations */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]">
        <div className="absolute -top-10 right-1/3 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-60 w-60 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <style>{`
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

