"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EARNING_BRANDS as FALLBACK_BRANDS } from "@/data/brands";
import type { EarningBrand } from "@/data/brands";
import { motion } from "motion/react";
import { getActiveBrands, Brand } from "@/lib/api";
import { toast } from "sonner";


export default function HowItWorks() {
  const router = useRouter();
  const [brands, setBrands] = useState<EarningBrand[]>(FALLBACK_BRANDS);
  const [selected, setSelected] = useState<EarningBrand>(FALLBACK_BRANDS[0]);
  const [amount, setAmount] = useState<number>(1000);
  const presetValues = [500, 1000, 2500];
  const coins = useMemo(() => Math.round(amount * selected.rate), [amount, selected]);
  const [coinAnimKey, setCoinAnimKey] = useState(0);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  
  // NEW: carousel + dropdown state
  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(brands.length / ITEMS_PER_PAGE);
  const [showAllBrands, setShowAllBrands] = useState(false);
  // NEW: overlay pagination state
  const OVERLAY_PER_PAGE = 8;
  const [overlayPage, setOverlayPage] = useState(0);
  const overlayTotalPages = Math.ceil(brands.length / OVERLAY_PER_PAGE);
  const overlayBrands = useMemo(
    () => brands.slice(overlayPage * OVERLAY_PER_PAGE, overlayPage * OVERLAY_PER_PAGE + OVERLAY_PER_PAGE),
    [overlayPage, brands]
  );

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getActiveBrands();
        if (response.success && response.data && Array.isArray(response.data)) {
          // Convert API brands to EarningBrand format
          const apiBrands: EarningBrand[] = response.data
            .filter((brand: Brand) => brand && brand.id && brand.name && typeof brand.earningPercentage === 'number')
            .map((brand: Brand) => ({
            key: brand.id,
            name: brand.name,
            short: brand.name.substring(0, 2).toUpperCase(),
            color: "bg-blue-100", // Default color, could be enhanced
            icon: brand.logoUrl,
            // Handle both percentage (15) and decimal (0.15) formats
            // Ensure rate is always between 0 and 1
            rate: Math.min(1, Math.max(0, brand.earningPercentage > 1 ? brand.earningPercentage / 100 : brand.earningPercentage)),
          }));
          
          setBrands(apiBrands);
          setSelected(apiBrands[0] || FALLBACK_BRANDS[0]);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to load brands: ${errorMessage}. Using default list.`);
        setBrands(FALLBACK_BRANDS);
        setSelected(FALLBACK_BRANDS[0]);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  function handleSelectBrand(b: EarningBrand) {
    setSelected(b);
    setCoinAnimKey(k => k + 1);
  }

  function handleSetAmount(v: number) {
    setAmount(v);
    setCoinAnimKey(k => k + 1);
  }

  // NEW: pagination helpers
  function prevPage() {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }
  function nextPage() {
    setPage(p => (p + 1) % totalPages);
  }

  // Enhanced timeline steps with animated SVGs
  const steps = [
    {
      key: "upload",
      label: "Upload Receipt",
      desc: "Upload receipt of latest order to verify details.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 group-hover:animate-upload">
          <path
            d="M12 3l5 5h-3v5h-4V8H7l5-5z"
            fill="currentColor"
            className="transition-all duration-800 ease-out group-hover:fill-green-600"
          />
          <path
            d="M6 18h12v2H6z"
            fill="currentColor"
            className="transition-all duration-800 ease-out group-hover:fill-green-600"
          />
          {/* Animated upload arrow */}
          <path
            d="M12 3l5 5h-3v5h-4V8H7l5-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out animate-upload-arrow"
          />
        </svg>
      ),
    },
    {
      key: "verify",
      label: "Verify",
      desc: "Get coins in your Corra Wallet. Convert to cash for next transaction.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 group-hover:animate-verify">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="transition-all duration-800 ease-out group-hover:stroke-green-600"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-800 ease-out group-hover:stroke-green-600 animate-check-draw"
          />
          {/* Animated checkmark */}
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out animate-check-pulse"
          />
        </svg>
      ),
    },
    {
      key: "earn",
      label: "Earn Coins",
      desc: "Upload proof of next transaction & get Corra coins to cash.",
      note: "1 CorraCoin = ₹1",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 group-hover:animate-earn">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="transition-all duration-800 ease-out group-hover:stroke-green-600"
          />
          <path
            d="M12 6v12m6-6H6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-800 ease-out group-hover:stroke-green-600"
          />
          {/* Animated plus with glow effect */}
          <path
            d="M12 6v12m6-6H6"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out animate-plus-glow"
          />
          {/* Floating coins animation */}
          <circle
            cx="8"
            cy="8"
            r="1"
            fill="currentColor"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out animate-coin-float-1"
          />
          <circle
            cx="16"
            cy="8"
            r="1"
            fill="currentColor"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out animate-coin-float-2"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-16">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-green-200/40 blur-3xl" aria-hidden></div>
      <div className="pointer-events-none absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" aria-hidden></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="animate-fade-up relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">How to Earn Corra Coins?</h2>

          {/* Enhanced Animated Timeline */}
          <div className="relative">
            {/* Animated vertical line with gradient */}
            <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-green-600 via-green-500 to-green-400">
              <div className="absolute inset-0 bg-green-600 animate-grow origin-top" />
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>

            <ol className="space-y-10">
              {steps.map((s, i) => (
                <li key={s.key} className="relative group">
                  {/* Enhanced Icon node with smooth hover effects */}
                  <div
                    className="absolute left-6 -translate-x-1/2 top-1.5 h-10 w-10 rounded-full bg-white shadow-md ring-1 ring-black/5 grid place-items-center text-green-700 z-10 animate-pop hover:scale-105 hover:shadow-md hover:ring-green-300 transition-all duration-1000 ease-out cursor-pointer group-hover:bg-green-50"
                    style={{ animationDelay: `${i * 160}ms` }}
                  >
                    <div className="group-hover:scale-105 transition-transform duration-1000 ease-out">
                      {s.icon}
                    </div>
                    {/* Pulse ring on hover */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-green-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-1000 ease-out" />
                  </div>

                  {/* Enhanced Card with smooth hover effects */}
                  <div className="ml-14 relative">
                    <div
                      className="rounded-2xl border border-green-100 bg-white shadow-sm px-6 py-5 animate-slide-in opacity-0 hover:shadow-lg hover:border-green-200 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-1000 ease-out cursor-pointer group overflow-hidden"
                      style={{ animationDelay: `${200 + i * 160}ms` }}
                    >
                      {/* Animated background gradient on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-50/0 to-green-50/0 group-hover:from-green-50/30 group-hover:to-green-50/20 transition-all duration-1200 ease-out" />
                      
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-200/30 transition-all duration-1000 ease-out" />
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out">
                        <div className="absolute top-2 right-2 w-1 h-1 bg-green-400 rounded-full animate-float-1" />
                        <div className="absolute top-4 right-6 w-1 h-1 bg-green-300 rounded-full animate-float-2" />
                        <div className="absolute bottom-4 left-4 w-1 h-1 bg-green-500 rounded-full animate-float-3" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className={`font-semibold text-lg transition-all duration-1000 ease-out ${i === 0 ? "text-green-700" : "text-black group-hover:text-green-700"}`}>
                          {s.label}
                          {/* Enhanced animated underline */}
                          <span className="block w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1200 ease-out mt-1 rounded-full" />
                        </div>
                        <p className="mt-1 text-black/70 text-sm group-hover:text-black/90 transition-all duration-1000 ease-out">{s.desc}</p>
                        {s.note && (
                          <div className="mt-3 inline-flex items-center rounded-md bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 group-hover:bg-green-200 group-hover:scale-105 group-hover:shadow-sm transition-all duration-1000 ease-out">
                            {s.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced animated chevron with smooth effects */}
                    {i < steps.length - 1 && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-5 h-5 text-green-600 flex items-center justify-center animate-fade-in hover:scale-110 hover:text-green-700 transition-all duration-1000 ease-out cursor-pointer group/chevron"
                        style={{ animationDelay: `${260 + i * 160}ms` }}
                        aria-hidden
                      >
                        <svg viewBox="0 0 20 20" className="w-5 h-5 animate-bounce-subtle group-hover/chevron:animate-bounce-smooth transition-all duration-1000 ease-out">
                          <path
                            d="M5 7l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className="transition-all duration-1000 ease-out group-hover/chevron:stroke-green-700"
                          />
                          {/* Animated glow effect */}
                          <path
                            d="M5 7l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className="opacity-0 group-hover/chevron:opacity-30 transition-opacity duration-1000 ease-out animate-chevron-glow"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Enhanced Footer marker with smooth animations */}
            <div className="mt-12 flex items-center justify-center text-green-700 text-sm font-medium animate-fade-in hover:scale-102 transition-all duration-1000 ease-out cursor-pointer group" style={{ animationDelay: `${steps.length * 160 + 300}ms` }}>
              <span className="mx-2 h-2 w-2 rounded-full bg-green-600 group-hover:animate-pulse group-hover:scale-110 transition-all duration-1000 ease-out"></span>
              <span className="group-hover:text-green-800 transition-colors duration-1000 ease-out">Start earning today!</span>
              <span className="mx-2 h-2 w-2 rounded-full bg-green-600 group-hover:animate-pulse group-hover:scale-110 transition-all duration-1000 ease-out"></span>
            </div>
          </div>
        </div>

        <div id="brands" className="w-full">
          <div className="relative rounded-2xl border border-black/10 bg-white shadow-sm p-6 animate-fade-up delay-100">
            {/* Card accents */}
            <svg
              viewBox="0 0 28 28"
              className="pointer-events-none absolute -top-3 -left-3 h-7 w-7 text-blue-400/60 motion-safe:animate-spin"
              style={{ animationDuration: "16s" }}
              aria-hidden
            >
              <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6"/>
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 text-green-500/70 animate-pulse"
              aria-hidden
            >
              <path d="M12 2l2.5 6 6.5 2.5-6.5 2.5L12 21l-2.5-8L3 10.5 9.5 8 12 2z" fill="currentColor"/>
            </svg>
            
            {/* Select a brand title */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select a brand</h3>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Enhanced Carousel Controls with smooth animations */}
              <button
                onClick={prevPage}
                aria-label="Previous brands"
                className="h-8 w-8 rounded-full border border-black/10 grid place-items-center hover:bg-black/5 hover:scale-110 transition-all duration-500 ease-out group/prev"
              >
                <span className="group-hover/prev:-translate-x-0.5 transition-transform duration-300 ease-out">‹</span>
              </button>

              {/* Smooth scrolling brands container */}
              <div className="flex-1 overflow-hidden">
                <div 
                  className="flex gap-4 transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${page * (100 / ITEMS_PER_PAGE)}%)` }}
                >
                  {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div key={pageIndex} className="flex gap-4 min-w-full">
                      {brands.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(b => (
                        <button
                          key={b.key}
                          className={`flex-1 rounded-lg border-2 p-4 flex flex-col items-center gap-3 text-center transition-all duration-500 ease-out mt-4 mb-4 ml-2 mr-4${
                            selected.key === b.key 
                              ? "border-green-600 bg-green-50 scale-105 shadow-md" 
                              : "border-black/10 hover:bg-black/5 hover:scale-102 hover:border-green-300"
                          }`}
                          onClick={() => handleSelectBrand(b)}
                        >
                          <div
                            className={`h-12 w-12 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 transition-all duration-500 ease-out ${b.color} ${
                              selected.key === b.key ? "ring-green-300" : ""
                            }`}
                          >
                            <Image
                              src={b.icon}
                              alt={b.name}
                              width={48}
                              height={48}
                              className={`h-8 w-8 object-contain transition-all duration-500 ease-out ${
                                selected.key === b.key ? "scale-110" : "scale-100"
                              }`}
                              unoptimized
                              draggable={false}
                            />
                          </div>
                          <div className={`font-medium text-sm transition-colors duration-500 ease-out ${
                            selected.key === b.key ? "text-green-700" : "text-gray-700"
                          }`}>
                            {b.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextPage}
                aria-label="Next brands"
                className="h-8 w-8 rounded-full border border-black/10 grid place-items-center hover:bg-black/5 hover:scale-110 transition-all duration-500 ease-out group/next"
              >
                <span className="group-hover/next:translate-x-0.5 transition-transform duration-300 ease-out">›</span>
              </button>
            </div>

            {/* Enhanced Pagination Dots with smooth animations */}
            <div className="mt-3 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to brand set ${i + 1}`}
                  onClick={() => setPage(i)}
                  className={`relative h-3 w-3 rounded-full transition-all duration-500 ease-out hover:scale-125 group/dot  ${
                    page === i 
                      ? "bg-green-600 scale-125 shadow-md" 
                      : "bg-black/20 hover:bg-black/30 hover:scale-110"
                  }`}
                >
                  {/* Animated ring effect for active dot */}
                  {page === i && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-green-400 opacity-50 animate-ping" />
                  )}
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover/dot:opacity-30 transition-opacity duration-300 ease-out" />
                </button>
              ))}
            </div>

            {/* View all brands CTA */}
            <div className="mt-4 relative inline-block">
              <button
                onClick={() => {
                  setShowAllBrands(s => !s);
                  if (!showAllBrands) setOverlayPage(0);
                }}
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline flex items-center gap-1 transition-colors duration-300"
              >
                {showAllBrands ? "Hide brands" : "View all brands"}
                <span
                  className={`transition-transform text-xs ${showAllBrands ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  ▼
                </span>
              </button>

              {showAllBrands && (
                <div className="absolute left-0 z-30 mt-2 w-72 rounded-xl border border-black/10 bg-white shadow-lg p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {overlayBrands.map(b => (
                      <button
                        key={b.key}
                        className={`rounded-md border-2 p-1.5 flex items-center gap-1.5 text-left text-xs transition-all duration-300 ease-out ${
                          selected.key === b.key
                            ? "border-green-600 bg-green-50"
                            : "border-black/10 hover:bg-black/5 hover:border-green-300"
                        }`}
                        onClick={() => {
                          handleSelectBrand(b);
                          setShowAllBrands(false);
                          setPage(Math.floor(brands.indexOf(b) / ITEMS_PER_PAGE));
                        }}
                      >
                        <div
                          className={`h-6 w-6 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 ${b.color}`}
                        >
                          <Image
                            src={b.icon}
                            alt={b.name}
                            width={24}
                            height={24}
                            className="h-4 w-4 object-contain"
                            unoptimized
                            draggable={false}
                          />
                        </div>
                        <span className="truncate text-xs">{b.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Enhanced pagination inside dropdown */}
                  {overlayTotalPages > 1 && (
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() =>
                          setOverlayPage(p => (p - 1 + overlayTotalPages) % overlayTotalPages)
                        }
                        className="h-7 px-2 text-xs rounded border border-black/10 hover:bg-black/5 hover:scale-110 transition-all duration-300 ease-out group/overlay-prev"
                      >
                        <span className="group-hover/overlay-prev:-translate-x-0.5 transition-transform duration-200 ease-out">‹</span>
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: overlayTotalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setOverlayPage(i)}
                            className={`relative h-2.5 w-2.5 rounded-full transition-all duration-400 ease-out hover:scale-125 group/overlay-dot ${
                              overlayPage === i
                                ? "bg-green-600 scale-125 shadow-sm"
                                : "bg-black/20 hover:bg-black/30 hover:scale-110"
                            }`}
                            aria-label={`Overlay page ${i + 1}`}
                          >
                            {/* Animated ring for active overlay dot */}
                            {overlayPage === i && (
                              <div className="absolute inset-0 rounded-full ring-1 ring-green-400 opacity-40 animate-ping" />
                            )}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setOverlayPage(p => (p + 1) % overlayTotalPages)
                        }
                        className="h-7 px-2 text-xs rounded border border-black/10 hover:bg-black/5 hover:scale-110 transition-all duration-300 ease-out group/overlay-next"
                      >
                        <span className="group-hover/overlay-next:translate-x-0.5 transition-transform duration-200 ease-out">›</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-4 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your purchase must be within 1 month</li>
                <li>Earned coins will be available for cashback on next purchase</li>
              </ul>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Transaction Value</div>
              <div className="grid grid-cols-3 gap-3">
                {presetValues.map(v => (
                  <button
                    key={v}
                    onClick={() => handleSetAmount(v)}
                    className={`h-12 rounded-xl border text-sm font-medium ${
                      amount === v ? "border-green-600 bg-green-50" : "border-black/15 hover:bg-black/5"
                    }`}
                  >
                    ₹ {v}
                  </button>
                ))}
              </div>

            </div>

            <div className="mt-6 relative rounded-2xl bg-amber-50 border border-amber-200 p-8 text-center overflow-hidden">
              {/* Spinning dashed ring behind coins */}

              {/* Sparkles */}
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute -top-2 left-4 h-5 w-5 text-amber-500/70 animate-pulse" aria-hidden>
                <path d="M12 2l2.5 6 6.5 2.5-6.5 2.5L12 21l-2.5-8L3 10.5 9.5 8 12 2z" fill="currentColor"/>
              </svg>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute -bottom-2 right-4 h-5 w-5 text-amber-500/70 animate-bounce" aria-hidden>
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div key={coinAnimKey} className="flex items-center justify-center gap-3 animate-coin-pop">
                <span className="text-4xl font-bold">{coins}</span>
                <motion.div 
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                    <span className="text-yellow-900 font-bold text-sm relative z-10 drop-shadow-sm">CC</span>
                  </div>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              <div className="text-black/70 mt-1">Corra Coins Earned</div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push(`/upload?brand=${selected.key}&amount=${amount}`)}
                className="w-full h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
              >
                Earn Coins Now →
              </button>
              <button
                onClick={() => {
                  try {
                    const isAuthed = typeof window !== "undefined" && !!localStorage.getItem("auth");
                    if (isAuthed) {
                      router.push("/dashboard");
                    } else {
                      router.push("/verify?redirect=dashboard");
                    }
                  } catch {
                    router.push("/verify?redirect=dashboard");
                  }
                }}
                className="mt-3 w-full h-12 rounded-xl border border-black/15 text-green-700 font-medium hover:bg-green-50"
              >
                Already Earned? Convert To Cash →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scoped animations with smooth SVG animations */}
      <style jsx>{`
        @keyframes grow {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        .animate-grow {
          animation: grow 1.2s ease-out forwards;
        }
        
        @keyframes shimmer {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes pop {
          0% { transform: scale(.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop .6s ease-out forwards;
        }
        
        @keyframes slideIn {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn .55s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn .5s ease forwards;
        }
        
        @keyframes floatSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .animate-bounce-subtle {
          animation: floatSubtle 3s ease-in-out infinite;
        }
        
        @keyframes floatSmooth {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-1px) scale(1.01); }
        }
        .animate-bounce-smooth {
          animation: floatSmooth 4s ease-in-out infinite;
        }
        
        @keyframes coinPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-coin-pop {
          animation: coinPop .8s ease-out;
        }
        
        @keyframes fadeUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-up {
          animation: fadeUp .6s ease-out forwards;
        }
        
        @keyframes delay-100 {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .delay-100 {
          animation: delay-100 .6s ease-out .1s forwards;
          opacity: 0;
        }
        
        /* SVG Animations */
        @keyframes upload {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1px) rotate(1deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-upload {
          animation: upload 4s ease-in-out infinite;
        }
        
        @keyframes uploadArrow {
          0% { transform: translateY(0); opacity: 0; }
          50% { transform: translateY(-1px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .animate-upload-arrow {
          animation: uploadArrow 3s ease-in-out infinite;
        }
        
        @keyframes verify {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.02) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-verify {
          animation: verify 4s ease-in-out infinite;
        }
        
        @keyframes checkDraw {
          0% { stroke-dasharray: 0 100; }
          100% { stroke-dasharray: 100 0; }
        }
        .animate-check-draw {
          animation: checkDraw 1s ease-in-out infinite;
        }
        
        @keyframes checkPulse {
          0%, 100% { transform: scale(1); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-check-pulse {
          animation: checkPulse 3s ease-in-out infinite;
        }
        
        @keyframes earn {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.03) rotate(0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-earn {
          animation: earn 4s ease-in-out infinite;
        }
        
        @keyframes plusGlow {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-plus-glow {
          animation: plusGlow 3s ease-in-out infinite;
        }
        
        @keyframes coinFloat1 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { transform: translateY(-2px) translateX(1px); opacity: 1; }
        }
        .animate-coin-float-1 {
          animation: coinFloat1 4s ease-in-out infinite;
        }
        
        @keyframes coinFloat2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { transform: translateY(-1px) translateX(-1px); opacity: 1; }
        }
        .animate-coin-float-2 {
          animation: coinFloat2 4.5s ease-in-out infinite;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { transform: translateY(-1px) translateX(0.5px); opacity: 1; }
        }
        .animate-float-1 {
          animation: float1 5s ease-in-out infinite;
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { transform: translateY(-1px) translateX(-0.5px); opacity: 1; }
        }
        .animate-float-2 {
          animation: float2 5.5s ease-in-out infinite;
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { transform: translateY(-1px) translateX(1px); opacity: 1; }
        }
        .animate-float-3 {
          animation: float3 4.5s ease-in-out infinite;
        }
        
        @keyframes chevronGlow {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        .animate-chevron-glow {
          animation: chevronGlow 3s ease-in-out infinite;
        }
        
        /* Enhanced hover animations */
        .group:hover .animate-bounce-subtle {
          animation-duration: 1s;
        }
        
        .group:hover .animate-upload {
          animation-duration: 1s;
        }
        
        .group:hover .animate-verify {
          animation-duration: 1s;
        }
        
        .group:hover .animate-earn {
          animation-duration: 1s;
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: transform, opacity, color, background-color, border-color, box-shadow, stroke, fill;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 0.8s;
        }
        
        /* Enhanced smooth transitions for hover states */
        .group:hover * {
          transition-duration: 1.2s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Ultra-smooth transitions for specific elements */
        .group:hover .transition-all {
          transition-duration: 1.5s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Smooth scroll-like pagination animations */
        @keyframes slideInFromRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInFromLeft {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeInScale {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-slide-in-right {
          animation: slideInFromRight 0.6s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInFromLeft 0.6s ease-out forwards;
        }
        
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-out forwards;
        }
        
        /* Smooth carousel transitions */
        .carousel-container {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Enhanced button hover effects */
        .group\/prev:hover, .group\/next:hover {
          transform: scale(1.1);
        }
        
        .group\/dot:hover {
          transform: scale(1.25);
        }
      `}</style>
    </section>
  );
}
