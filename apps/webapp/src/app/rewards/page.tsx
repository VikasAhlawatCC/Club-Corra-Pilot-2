"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBrands, getPresignedUploadUrl, createRewardRequest, Brand } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function RewardsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [billAmount, setBillAmount] = useState<number>(0);
  const [coinsRedeemed, setCoinsRedeemed] = useState<number>(0);
  const [upiId, setUpiId] = useState<string>(user?.upiId || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  
  // Brand carousel state
  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(brands.length / ITEMS_PER_PAGE);
  const [showAllBrands, setShowAllBrands] = useState(false);
  
  // Overlay pagination state
  const OVERLAY_PER_PAGE = 8;
  const [overlayPage, setOverlayPage] = useState(0);
  const overlayTotalPages = Math.ceil(brands.length / OVERLAY_PER_PAGE);
  const overlayBrands = brands.slice(overlayPage * OVERLAY_PER_PAGE, overlayPage * OVERLAY_PER_PAGE + OVERLAY_PER_PAGE);

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
    user?.totalCoins || 0, // User's current coin balance
    selectedBrand ? Math.floor(billAmount * selectedBrand.redemptionPercentage / 100) : 0, // Brand's redemption percentage
    Math.floor(billAmount * 0.5) // Max 50% of bill amount
  );

  // Calculate coins earned: earn percentage of (bill amount - redeemed amount)
  // This follows the business rule: "earn percentage of (MRP - redeem amount)"
  const coinsEarned = selectedBrand && billAmount > 0
    ? Math.floor((billAmount - coinsRedeemed) * selectedBrand.earningPercentage / 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-center text-3xl sm:text-4xl font-bold">
          Request Rewards
        </h1>
        <p className="text-center text-black/70 mt-2">
          Upload your bill to earn Corra Coins and redeem them for cashback.
        </p>

        <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white animate-fade-up delay-100 relative">
        <div className="px-6 py-6 border-b border-black/10">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Submit a New Reward Request
          </h2>
          <p className="text-black/70 mt-2">
            Select the brand, upload your receipt, and enter the transaction details.
          </p>
        </div>
        <div className="p-6">
          {/* Brand selector */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Select a brand</div>
            {loadingBrands ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading brands...</p>
              </div>
            ) : brands.length > 0 ? (
              <>
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
                          {brands.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(brand => (
                            <button
                              key={brand.id}
                              className={`flex-1 rounded-lg border-2 p-4 flex flex-col items-center gap-3 text-center transition-all duration-500 ease-out mt-4 mb-4 ml-2 mr-4${
                                selectedBrand?.id === brand.id 
                                  ? "border-green-600 bg-green-50 scale-105 shadow-md" 
                                  : "border-black/10 hover:bg-black/5 hover:scale-102 hover:border-green-300"
                              }`}
                              onClick={() => handleSelectBrand(brand)}
                            >
                              <div
                                className={`h-12 w-12 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 transition-all duration-500 ease-out bg-gray-100 ${
                                  selectedBrand?.id === brand.id ? "ring-green-300" : ""
                                }`}
                              >
                                {brand.logoUrl ? (
                                  <Image
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    width={48}
                                    height={48}
                                    className={`h-8 w-8 object-contain transition-all duration-500 ease-out ${
                                      selectedBrand?.id === brand.id ? "scale-110" : "scale-100"
                                    }`}
                                    unoptimized
                                    draggable={false}
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-600">{brand.name.substring(0, 2)}</span>
                                )}
                              </div>
                              <div className={`font-medium text-sm transition-colors duration-500 ease-out ${
                                selectedBrand?.id === brand.id ? "text-green-700" : "text-gray-700"
                              }`}>
                                {brand.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {brand.earningPercentage}% earn, {brand.redemptionPercentage}% redeem
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

                {/* Pagination Dots */}
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
                        {overlayBrands.map(brand => (
                          <button
                            key={brand.id}
                            className={`rounded-md border-2 p-1.5 flex items-center gap-1.5 text-left text-xs transition-all duration-300 ease-out ${
                              selectedBrand?.id === brand.id
                                ? "border-green-600 bg-green-50"
                                : "border-black/10 hover:bg-black/5 hover:border-green-300"
                            }`}
                            onClick={() => {
                              handleSelectBrand(brand);
                              setShowAllBrands(false);
                              setPage(Math.floor(brands.indexOf(brand) / ITEMS_PER_PAGE));
                            }}
                          >
                            <div
                              className={`h-6 w-6 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 bg-gray-100`}
                            >
                              {brand.logoUrl ? (
                                <Image
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  width={24}
                                  height={24}
                                  className="h-4 w-4 object-contain"
                                  unoptimized
                                  draggable={false}
                                />
                              ) : (
                                <span className="text-xs font-semibold text-gray-600">{brand.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <span className="truncate text-xs">{brand.name}</span>
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
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🏪</div>
                <p className="text-gray-600 mb-2">No brands available</p>
                <p className="text-sm text-gray-500">Please try refreshing the page or contact support</p>
                <button 
                  onClick={fetchBrands}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-4 text-sm">
            <p className="font-semibold mb-2">Please ensure the following:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The receipt photo is clear and legible.</li>
              <li>
                The total transaction value and a unique Order ID are clearly visible on the receipt.
              </li>
            </ul>
          </div>

          {/* Dropzone */}
          <div className="mt-6">
            <label
              className={`block rounded-2xl border-2 border-dashed px-6 py-12 text-center text-black/70 cursor-pointer transition-colors ${
                receiptUrl
                  ? "border-green-500 bg-green-50"
                  : "border-black/15 hover:bg-black/5"
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReceiptFile(file);
                    handleFileUpload(file);
                  }
                }}
              />
              {uploading ? (
                <div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Uploading...</p>
                </div>
              ) : receiptUrl ? (
                <div className="animate-fade-in">
                  <div className="text-green-600 text-2xl">✓</div>
                  <div className="mt-3 text-sm">
                    Receipt uploaded successfully!
                  </div>
                </div>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full border border-black/20 grid place-items-center text-2xl">
                    ↥
                  </div>
                  <div className="mt-3 font-medium">
                    Click to upload or drag and drop your receipt
                  </div>
                  <div className="text-xs text-black/50">PNG or JPG, up to 10MB</div>
                </>
              )}
            </label>
          </div>

          {/* Amount */}
          <div className="mt-6">
            <label className="text-sm font-medium">
              Transaction Value (₹) as per your bill
            </label>
            <div className="mt-1 relative">
              <input
                className="w-full h-12 rounded-xl border border-black/15 px-4 pr-10 outline-none focus:border-green-600 transition"
                value={billAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow whole numbers (integers)
                  if (value === '' || /^\d+$/.test(value)) {
                    setBillAmount(Number(value) || 0);
                  }
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter amount (whole numbers only)"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-black/15 grid place-items-center text-xs">
                ↻
              </button>
            </div>
          </div>

          {/* Redemption Slider */}
          <div className="mt-6">
            <label className="text-sm font-medium">
              Redeem Corra Coins (1 Corra Coin = ₹1)
            </label>
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Coins to Redeem</span>
                  <span className="text-sm font-semibold text-green-600">{coinsRedeemed}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxRedeemable}
                  value={coinsRedeemed}
                  onChange={(e) => setCoinsRedeemed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #10B981 ${(coinsRedeemed / maxRedeemable) * 100}%, #E5E7EB ${(coinsRedeemed / maxRedeemable) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>Max: {maxRedeemable}</span>
                </div>
              </div>

              {coinsRedeemed > 0 && (
                <div>
                  <label htmlFor="upi" className="text-sm font-medium">
                    UPI ID
                  </label>
                  <div className="mt-1">
                    <input
                      id="upi"
                      type="text"
                      placeholder="Enter your UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full h-12 rounded-xl border border-black/15 px-4 outline-none focus:border-green-600 transition"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Amount:</span>
                <span className="font-medium">₹{billAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coins Redeemed:</span>
                <span className="font-medium text-red-600">-{coinsRedeemed} coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coins Earned:</span>
                <span className="font-medium text-green-600">+{coinsEarned} coins</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 text-sm">
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3">
              Your cashback will be processed within 2-3 business days after your transaction is successfully verified by our team.
            </div>
          </div>


          {/* Actions */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="h-11 px-4 rounded-xl border border-black/15 bg-white hover:bg-black/5 flex items-center gap-2 transition active:scale-95">
              <span className="h-6 w-6 rounded-md border border-black/15 grid place-items-center">
                📷
              </span>
              Take Photo
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedBrand || !receiptUrl || billAmount <= 0 || submitting || (coinsRedeemed > 0 && !upiId)}
              className={`flex-1 h-12 rounded-xl text-white font-medium transition ${
                !selectedBrand || !receiptUrl || billAmount <= 0 || submitting || (coinsRedeemed > 0 && !upiId)
                  ? "bg-black/20 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800 active:scale-95"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}