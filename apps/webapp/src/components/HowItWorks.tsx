"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EARNING_BRANDS as FALLBACK_BRANDS } from "@/data/brands";
import type { EarningBrand } from "@/data/brands";
import { motion } from "motion/react";
import { ChevronDown, Upload as UploadIcon, ShieldCheck, Wallet, Clock, Coins } from "lucide-react";
import type { ComponentType } from "react";
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
            off: Math.round(brand.earningPercentage > 1 ? brand.earningPercentage : brand.earningPercentage * 100),
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

  // Timeline steps
  type IconType = ComponentType<{ className?: string }>;
  const steps: {
    number: number;
    title: string;
    description: string;
    highlight?: string;
    icon: IconType;
    iconColor: string;
    isActive?: boolean;
  }[] = [
    {
      number: 1,
      title: "Upload Receipt",
      description: "Snap & upload your latest order receipt — that's all it takes!",
      icon: UploadIcon,
      iconColor: "from-green-400 via-emerald-500 to-green-600",
      isActive: true,
    },
    {
      number: 2,
      title: "Instant Corra Coins in your wallet",
      description:
        "We'll verify your purchase and credit coins instantly.",
      icon: ShieldCheck,
      iconColor: "from-blue-400 via-indigo-500 to-blue-600",
    },
    {
      number: 3,
      title: "Convert your Corra Coins to Cash",
      description:
        "Get instant cash back on your next purchase.",
      highlight: "1 CorraCoin = ₹1",
      icon: Wallet,
      iconColor: "from-yellow-300 via-yellow-400 to-amber-500",
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-16">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-green-200/40 blur-3xl" aria-hidden></div>
      <div className="pointer-events-none absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" aria-hidden></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="animate-fade-up relative">
          <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 px-4"
            >
              Shop. Upload. Earn.<br />
              Get Cash Back with <span className="text-green-600">Corra Coins</span>
              <motion.div 
                className="inline-block ml-2 relative"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                viewport={{ once: true }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                  <span className="text-yellow-900 font-bold text-xs relative z-10 drop-shadow-sm">CC</span>
                </div>
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-600 mb-8 sm:mb-12 px-4"
            >
              3 simple steps to your first cash back
            </motion.p>

          {/* Animated Timeline Container */}
          <div className="relative pl-6 sm:pl-8">
            {/* Animated Connecting Line */}
            <motion.div 
              className="absolute left-4 sm:left-6 top-0 w-0.5 bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 rounded-full"
              initial={{ height: 0 }}
              whileInView={{ height: "85%" }}
              transition={{ duration: 1.5, delay: 0.3 }}
              viewport={{ once: true }}
            />

            {/* Steps with Enhanced Animation */}
            <div className="space-y-8 sm:space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.3 + 0.5,
                    type: "spring",
                    bounce: 0.4
                  }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* Animated Circle Node */}
                  <motion.div 
                    className="absolute -left-6 sm:-left-8 top-2"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.3 + 0.7,
                      type: "spring",
                      bounce: 0.6
                    }}
                    viewport={{ once: true }}
                  >
          <div className="relative">
                      {/* Outer glowing ring - only for active step */}
                      {step.isActive && (
                        <motion.div 
                          className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-30"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: index * 0.5 
                          }}
                        />
                      )}
                      
                      {/* Main circle */}
                      <div className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${step.iconColor} rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:shadow-xl transition-shadow duration-300`}>
                        <motion.div 
                          className="text-white"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.3 + 1,
                            type: "spring",
                            bounce: 0.8
                          }}
                          viewport={{ once: true }}
                        >
                          <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        
                        {/* Inner shine effect - only for active step */}
                        {step.isActive && (
                          <motion.div
                            className="absolute inset-1 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                    </div>
                  </div>
                  </motion.div>

                  {/* Content Card */}
                  <motion.div
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 ml-6 sm:ml-8 border ${step.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} group-hover:border-green-200`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <div className="space-y-3">
                      <motion.h3 
                        className={`text-lg sm:text-xl font-bold ${step.isActive ? 'text-green-700' : 'text-gray-900'} group-hover:text-green-700 transition-colors duration-300 ${step.number === 3 ? 'flex items-center gap-2' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.3 + 1.2 }}
                        viewport={{ once: true }}
                      >
                        {step.number === 3 ? (
                          <>
                            Convert your 
                            <motion.div 
                              className="inline-block relative"
                              initial={{ scale: 0, rotate: -180 }}
                              whileInView={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.3 + 1.4, duration: 0.6, type: "spring" }}
                              viewport={{ once: true }}
                            >
                              <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                                <span className="text-yellow-900 font-bold text-xs relative z-10 drop-shadow-sm">CC</span>
                      </div>
                              {/* Shine effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                            </motion.div>
                            to Cash
                          </>
                        ) : (
                          step.title
                        )}
                      </motion.h3>
                      
                      <motion.div 
                        className="text-gray-600 leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.3 + 1.4 }}
                        viewport={{ once: true }}
                      >
                        <p className="font-bold font-normal">{step.description}</p>
                        {step.highlight && (
                          <motion.div 
                            className="font-bold text-green-700 mt-2 px-3 py-1 bg-green-50 rounded-lg inline-block"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.3 + 1.6 }}
                            viewport={{ once: true }}
                          >
                            {step.number === 3 ? (
                              <span className="flex items-center gap-1">
                                100{' '}
                                <motion.div
                                  className="inline-block relative"
                                  initial={{ scale: 0, rotate: -180 }}
                                  whileInView={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: index * 0.3 + 1.8, duration: 0.6, type: "spring" }}
                                  viewport={{ once: true }}
                                >
                                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border border-yellow-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                                    <span className="text-yellow-900 font-bold text-xs relative z-10 drop-shadow-sm">CC</span>
                        </div>
                                  {/* Shine effect */}
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  />
                                </motion.div>
                                {' '}= 100 ₹
                              </span>
                            ) : (
                              step.highlight
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    {/* Decorative arrow for better flow */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.3 + 1.8 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-6 h-6 text-green-500"
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ChevronDown />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom decorative element */}
          <motion.div
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 text-green-600">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium">Start earning today!</span>
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
                      </div>
          </motion.div>
        </div>

        <div id="brands" className="w-full">
          <div className="relative rounded-2xl border border-black/10 bg-white shadow-sm p-4 sm:p-6 animate-fade-up delay-100">
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Select a brand</h3>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Enhanced Carousel Controls with smooth animations */}
              <button
                onClick={prevPage}
                aria-label="Previous brands"
                className="h-10 w-10 sm:h-8 sm:w-8 rounded-full border border-black/10 grid place-items-center hover:bg-black/5 hover:scale-110 transition-all duration-500 ease-out group/prev flex-shrink-0"
              >
                <span className="group-hover/prev:-translate-x-0.5 transition-transform duration-300 ease-out text-lg sm:text-base">‹</span>
              </button>

              {/* Smooth scrolling brands container */}
              <div className="flex-1 overflow-hidden">
                <div 
                  className="flex gap-4 transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${page * (100 / ITEMS_PER_PAGE)}%)` }}
                >
                  {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div key={pageIndex} className="flex min-w-full gap-2">
                      {brands.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(b => (
                  <button
                    key={b.key}
                          className={`flex-1 rounded-lg p-2 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 text-center transition-all duration-500 ease-out mt-2 sm:mt-4 mb-2 sm:mb-4 ${
                            selected.key === b.key 
                              ? "bg-green-50 shadow-md" 
                              : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectBrand(b)}
                  >
                    <div
                            className={`h-10 w-10 sm:h-12 sm:w-12 grid place-items-center overflow-hidden transition-all duration-500 ease-out`}
                    >
                            {b.icon ? (
                      <Image
                        src={b.icon}
                        alt={b.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-neutral-700">{b.short}</span>
                            )}
                          </div>
                          <div className={`font-medium text-xs sm:text-sm transition-colors duration-500 ease-out ${
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
                className="h-10 w-10 sm:h-8 sm:w-8 rounded-full border border-black/10 grid place-items-center hover:bg-black/5 hover:scale-110 transition-all duration-500 ease-out group/next flex-shrink-0"
              >
                <span className="group-hover/next:translate-x-0.5 transition-transform duration-300 ease-out text-lg sm:text-base">›</span>
              </button>
            </div>

            {/* Enhanced Pagination Dots with smooth animations - Always visible */}
            <div className="mt-3 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to brand set ${i + 1}`}
                  onClick={() => setPage(i)}
                  className={`relative h-3 w-3 sm:h-3 sm:w-3 rounded-full transition-all duration-500 ease-out hover:scale-125 group/dot touch-manipulation ${
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
                <div className="absolute left-0 z-30 mt-2 w-72 sm:w-72 rounded-xl border border-black/10 bg-white shadow-lg p-3 max-w-[calc(100vw-2rem)]">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {overlayBrands.map(b => (
                      <button
                        key={b.key}
                        className={`rounded-md p-1.5 sm:p-1.5 flex items-center gap-1 sm:gap-1.5 text-left text-xs transition-all duration-300 ease-out touch-manipulation ${
                          selected.key === b.key
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          handleSelectBrand(b);
                          setShowAllBrands(false);
                          setPage(Math.floor(brands.indexOf(b) / ITEMS_PER_PAGE));
                        }}
                      >
                        <div
                          className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full grid place-items-center overflow-hidden ${b.color}`}
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-800">Make sure your receipt is from the last 1 month 🗓️</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-800">Use your earned coins for cashback on your next purchase</p>
                    </div>
                  </div>
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
              <div className="text-black/70 mt-1">Corra Coins Available</div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push(`/upload?brand=${selected.key}&amount=${amount}`)}
                className="w-full h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
              >
                Upload Receipt & Earn Coins Now
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scoped animations with smooth SVG animations */}
      <style>{`
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
