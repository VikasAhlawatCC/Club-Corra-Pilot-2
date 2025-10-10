"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBrands, getPresignedUploadUrl, createRewardRequest, updateUpiId, Brand } from "@/lib/api";
import { ALL_BRANDS, type Brand as StaticBrand } from "@/data/brands";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { motion } from "motion/react";
import { Info, Shield } from "lucide-react";

export default function RewardsPage() {
  return <RewardsContent />;
}

function RewardsContent() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedStaticBrand, setSelectedStaticBrand] = useState<StaticBrand>(ALL_BRANDS[0]);
  const [billAmount, setBillAmount] = useState<number>(0);
  const [coinsRedeemed, setCoinsRedeemed] = useState<number>(0);
  const [upiId, setUpiId] = useState<string>("");
  const [originalUpiId, setOriginalUpiId] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [dragging, setDragging] = useState<boolean>(false);
  
  // Brand carousel state
  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(ALL_BRANDS.length / ITEMS_PER_PAGE);
  const [showAllBrands, setShowAllBrands] = useState(false);
  
  // Overlay pagination state
  const OVERLAY_PER_PAGE = 8;
  const [overlayPage, setOverlayPage] = useState(0);
  const overlayTotalPages = Math.ceil(ALL_BRANDS.length / OVERLAY_PER_PAGE);
  const overlayBrands = useMemo(
    () => ALL_BRANDS.slice(overlayPage * OVERLAY_PER_PAGE, overlayPage * OVERLAY_PER_PAGE + OVERLAY_PER_PAGE),
    [overlayPage]
  );

  function getRewardPercentage(brand: string) {
    const rewardRates: { [key: string]: number } = {
      'Adidas': 10,
      'Decathlon': 8,
      'Firstcry': 12,
      'Urban Company': 15,
      'Myntra': 7,
      'Nykaa': 9,
      'Pharmeasy': 11,
      'Wakefit': 13
    };
    return rewardRates[brand] || 10;
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=rewards");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchBrands();
    }
  }, [token, isAuthenticated]);

  // Auto-fill UPI ID when user data is available
  useEffect(() => {
    if (user?.upiId) {
      setUpiId(user.upiId);
      setOriginalUpiId(user.upiId);
    }
  }, [user?.upiId]);

  // Pagination helpers
  function prevPage() {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }
  function nextPage() {
    setPage(p => (p + 1) % totalPages);
  }

  function handleSelectBrand(brand: Brand) {
    setSelectedBrand(brand);
  }

  function handleSelectStaticBrand(staticBrand: StaticBrand) {
    setSelectedStaticBrand(staticBrand);
    // Try to find matching API brand
    const matchingBrand = brands.find(b => b.name.toLowerCase() === staticBrand.name.toLowerCase());
    if (matchingBrand) {
      setSelectedBrand(matchingBrand);
    }
  }

  const fetchBrands = async () => {
    try {
      console.log("Fetching brands from API...");
      const response = await getActiveBrands();
      console.log("Brands API response:", response);
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data contains the brands array
        const brandsData = (response.data as any).data || response.data;
        
        if (Array.isArray(brandsData)) {
          const validBrands = brandsData.filter((brand: Brand) => brand && brand.id && brand.name);
          console.log("Valid brands found:", validBrands);
          setBrands(validBrands);
          setSelectedBrand(validBrands[0] || null);
          
          if (validBrands.length === 0) {
            toast.error("No active brands found. Please contact support.");
          } else {
            toast.success(`Loaded ${validBrands.length} brands successfully!`);
          }
        } else {
          console.error("Invalid brands data format:", brandsData);
          toast.error("Invalid brands data format from API");
        }
      } else {
        console.error("Invalid response format:", response);
        toast.error("Invalid response from brands API");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load brands: ${errorMessage}`);
      
      // Set fallback brands for development
      const fallbackBrands = [
        {
          id: 'fallback-1',
          name: 'Adidas',
          logoUrl: 'https://example.com/adidas-logo.png',
          earningPercentage: 5,
          redemptionPercentage: 2,
          isActive: true,
        },
        {
          id: 'fallback-2',
          name: 'Nike',
          logoUrl: 'https://example.com/nike-logo.png',
          earningPercentage: 4,
          redemptionPercentage: 2,
          isActive: true,
        },
      ];
      setBrands(fallbackBrands);
      setSelectedBrand(fallbackBrands[0]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!token) return;
    
    setUploading(true);
    try {
      const response = await getPresignedUploadUrl(file.name, file.type, token);
      if (response.success && response.data) {
        // Upload file to S3
        const uploadResponse = await fetch(response.data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (uploadResponse.ok) {
          setReceiptUrl(response.data.fileUrl);
          toast.success("Receipt uploaded successfully!");
        } else {
          throw new Error("Failed to upload file");
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload receipt: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      handleFileUpload(file);
    }
  }

  const handleSubmit = async () => {
    // Enhanced validation with specific error messages
    if (!selectedBrand) {
      toast.error("Please select a brand");
      return;
    }
    
    if (!receiptUrl) {
      toast.error("Please upload a receipt");
      return;
    }
    
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }
    
    if (billAmount <= 0) {
      toast.error("Please enter a valid transaction amount");
      return;
    }
    
    if (coinsRedeemed > 0 && !upiId) {
      toast.error("Please enter your UPI ID for redemption");
      return;
    }

    setSubmitting(true);
    try {
      // Update UPI ID if it has changed and user has a redemption amount
      if (coinsRedeemed > 0 && upiId && upiId !== originalUpiId) {
        try {
          await updateUpiId(upiId, token);
          toast.success("UPI ID updated successfully!");
        } catch (error) {
          console.error("Error updating UPI ID:", error);
          // Continue with the request even if UPI ID update fails
        }
      }

      const response = await createRewardRequest({
        brandId: selectedBrand.id,
        billAmount,
        coinsRedeemed,
        receiptUrl,
        upiId: coinsRedeemed > 0 ? upiId : undefined,
      }, token);

      if (response.success) {
        toast.success("Reward request submitted successfully!");
        
        // Refresh user data to show updated balance immediately
        await refreshUser();
        
        router.push("/dashboard");
      } else {
        toast.error(response.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting reward request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to submit request: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Calculate maximum redeemable coins based on business rules
  const maxRedeemable = Math.min(
    parseInt(user?.totalCoins || '0'), // User's current coin balance
    selectedBrand ? Math.floor(billAmount * selectedBrand.redemptionPercentage / 100) : 0, // Brand's redemption percentage
    Math.floor(billAmount * 0.5) // Max 50% of bill amount
  );

  // Calculate coins earned: earn percentage of (bill amount - redeemed amount)
  // This follows the business rule: "earn percentage of (MRP - redeem amount)"
  const coinsEarned = selectedBrand && billAmount > 0
    ? Math.floor((billAmount - coinsRedeemed) * selectedBrand.earningPercentage / 100)
    : 0;

  const canContinue = Boolean(receiptUrl && upiId && billAmount > 0);

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            Earn & Get Cashback on Your Purchases
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
              <span className="text-yellow-900 font-bold text-sm relative z-10 drop-shadow-sm">CC</span>
            </div>
          </h1>
          <p className="text-gray-600 mt-1">Upload your receipt to earn Corra Coins and get instant cashback on your purchases</p>
        </div>
        

        <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white animate-fade-up delay-100">

          <div className="p-6">
            {/* Brand selector */}
            <div className="mb-6">
              <div className="text-sm font-medium mb-2">Select a brand</div>
              <div className="flex items-center gap-3">
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
                        {ALL_BRANDS.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(b => (
                          <button
                            key={b.key}
                            className={`flex-1 rounded-lg border-2 p-4 flex flex-col items-center gap-3 text-center transition-all duration-500 ease-out mt-4 mb-4 ml-2 mr-4${
                              selectedStaticBrand.key === b.key 
                                ? "border-green-600 bg-green-50 scale-105 shadow-md" 
                                : "border-black/10 hover:bg-black/5 hover:scale-102 hover:border-green-300"
                            }`}
                            onClick={() => handleSelectStaticBrand(b)}
                          >
                            <div
                              className={`h-12 w-12 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 transition-all duration-500 ease-out ${b.color || "bg-gray-100"} ${
                                selectedStaticBrand.key === b.key ? "ring-green-300" : ""
                              }`}
                            >
                              <Image
                                src={b.icon}
                                alt={b.name}
                                width={48}
                                height={48}
                                className={`h-8 w-8 object-contain transition-all duration-500 ease-out ${
                                  selectedStaticBrand.key === b.key ? "scale-110" : "scale-100"
                                }`}
                                unoptimized
                                draggable={false}
                              />
                            </div>
                            <div className={`font-medium text-sm transition-colors duration-500 ease-out ${
                              selectedStaticBrand.key === b.key ? "text-green-700" : "text-gray-700"
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

              {/* Pagination Dots - Hidden on mobile */}
              <div className="mt-3 hidden sm:flex justify-center gap-2">
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
                            selectedStaticBrand.key === b.key
                              ? "border-green-600 bg-green-50"
                              : "border-black/10 hover:bg-black/5 hover:border-green-300"
                          }`}
                          onClick={() => {
                            handleSelectStaticBrand(b);
                            setShowAllBrands(false);
                            setPage(Math.floor(ALL_BRANDS.indexOf(b) / ITEMS_PER_PAGE));
                          }}
                        >
                          <div
                            className={`h-6 w-6 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 ${b.color || "bg-gray-100"}`}
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

                    {/* Pagination inside dropdown */}
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
            </div>

            {/* Reward Percentage Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.3
              }}
              className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 text-center shadow-lg relative overflow-hidden"
            >
              {/* Celebratory sparkles */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-2 right-4 text-yellow-400 text-xl"
              >
                ✨
              </motion.div>
              
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -360, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
                className="absolute top-3 left-4 text-yellow-400 text-lg"
              >
                🎉
              </motion.div>
              
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
                className="absolute bottom-2 right-6 text-yellow-400 text-sm"
              >
                💰
              </motion.div>

              <motion.div 
                className="flex items-center justify-center space-x-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.span 
                  className="text-3xl font-bold text-green-700 bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm border border-green-200 shadow-sm"
                  animate={{ 
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {getRewardPercentage(selectedStaticBrand.name)}%
                </motion.span>
                <span className="text-green-700 font-medium">
                  Corra Coins earned on purchases from {selectedStaticBrand.name}
                </span>
              </motion.div>
            </motion.div>

            {/* Dropzone */}
            <div className="mt-6">
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setReceiptFile(file);
                    handleFileUpload(file);
                  }
                }}
                className={`block rounded-2xl border-2 border-dashed px-6 py-12 text-center text-black/70 cursor-pointer transition-colors drop-shadow-soft ${
                  dragging || receiptUrl ? "border-green-500 bg-green-50" : "border-black/15 hover:bg-black/5"
                }`}
              >
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFileChange} />
                {uploading ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Uploading...</p>
                  </div>
                ) : receiptUrl ? (
                  <div className="animate-fade-in">
                    <div className="text-green-600 text-2xl">✓</div>
                    <div className="mt-3 text-sm">Receipt uploaded successfully!</div>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-12 w-12 rounded-full border border-black/20 grid place-items-center text-2xl">↥</div>
                    <div className="mt-3 font-medium">Click to upload or drag and drop</div>
                    <div className="text-xs text-black/50">PNG, JPG up to 10MB</div>
                  </>
                )}
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mt-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">Before You Upload:</p>
                </div>
                <ul className="text-sm text-blue-700 ml-6 space-y-1">
                  <li>• Snap a clear photo of your receipt from selected brand</li>
                  <li>• Make sure the Total Amount, Order Date & Order Id are clearly visible</li>
                  <li>• Make sure your receipt is from the last 1 month 🗓️</li>
                </ul>
              </div>
            </div>

            {/* Take Photo Button */}
            <div className="mt-4 flex justify-center">
              <button className="h-11 px-4 rounded-xl border border-black/15 bg-white hover:bg-black/5 flex items-center gap-2 transition active:scale-95">
                <span className="h-6 w-6 rounded-md border border-black/15 grid place-items-center">📷</span>
                Take Photo
              </button>
            </div>

            {/* Amount */}
            <div className="mt-6">
              <label className="text-sm font-medium">Transaction Value (₹)</label>
              <div className="mt-1 relative">
                <input
                  className="w-full h-12 rounded-xl border border-black/15 px-4 pr-10 outline-none focus:border-green-600 transition"
                  value={billAmount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    // Only allow whole numbers (integers)
                    if (newAmount === '' || /^\d+$/.test(newAmount)) {
                      setBillAmount(Number(newAmount) || 0);
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter amount (whole numbers only)"
                />
                <button 
                  onClick={() => {
                    setBillAmount(0);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-black/15 grid place-items-center text-xs hover:bg-gray-50 transition"
                >
                  ↻
                </button>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Redeem Corra Coins for Cashback</h2>
                <div className="text-green-700 font-semibold text-xl">₹{coinsRedeemed}</div>
              </div>
              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={maxRedeemable}
                  step={1}
                  value={coinsRedeemed}
                  onChange={(e) => {
                    const newAmount = Math.round(Number(e.target.value));
                    setCoinsRedeemed(newAmount);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-black/60 mt-2">
                  <span>₹0</span>
                  <span>₹{maxRedeemable}</span>
                </div>
              </div>
            </section>

            {/* UPI ID */}
            <div className="mt-4">
              <label className="text-sm font-medium">UPI ID</label>
              <input
                className={`mt-1 w-full h-12 rounded-xl border px-4 outline-none transition ${
                  coinsRedeemed === 0
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" 
                    : "border-black/15 focus:border-green-600"
                }`}
                placeholder={coinsRedeemed === 0 ? "Set redemption amount to enable UPI ID" : "Enter your UPI ID (e.g., name@paytm)"}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={coinsRedeemed === 0}
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-green-800 font-medium">Your UPI ID is secured</p>
                  <p className="text-xs text-green-700">We use bank-grade encryption to protect your payment information. Your UPI ID is only used for cashback transfers and is never shared with third parties.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => {
                  if (!canContinue) return;
                  handleSubmit();
                }}
                className={`w-full h-12 rounded-xl text-white font-medium transition ${
                  canContinue ? "bg-green-700 hover:bg-green-800 active:scale-95" : "bg-black/20 cursor-not-allowed"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </section>
      </section>
      
      {/* Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </>
  );
}