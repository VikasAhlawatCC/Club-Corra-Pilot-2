"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getActiveBrands, getPresignedUploadUrl, createPendingTransaction, Brand } from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";

// Generate a unique session ID for tracking pending transactions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="py-10">Loading…</div>}>
      <UploadContent />
    </Suspense>
  );
}

function UploadContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [amount, setAmount] = useState<string>("500");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [dragging, setDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => {
    // Get or create session ID
    const existing = localStorage.getItem('pendingTransactionSessionId');
    if (existing) return existing;
    
    const newSessionId = generateSessionId();
    localStorage.setItem('pendingTransactionSessionId', newSessionId);
    return newSessionId;
  });
  
  // Brand carousel state
  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(brands.length / ITEMS_PER_PAGE);
  const [showAllBrands, setShowAllBrands] = useState(false);
  
  // Overlay pagination state for "View all brands"
  const OVERLAY_PER_PAGE = 8;
  const [overlayPage, setOverlayPage] = useState(0);
  const overlayTotalPages = Math.ceil(brands.length / OVERLAY_PER_PAGE);
  const overlayBrands = useMemo(
    () => brands.slice(overlayPage * OVERLAY_PER_PAGE, overlayPage * OVERLAY_PER_PAGE + OVERLAY_PER_PAGE),
    [overlayPage, brands]
  );

  // Fetch brands from API (no authentication required for public endpoint)
  useEffect(() => {
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
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

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

  useEffect(() => {
    const brandParam = params.get("brand");
    const amt = params.get("amount");
    if (brandParam && brands.length > 0) {
      const found = brands.find((b) => b.name.toLowerCase() === brandParam.toLowerCase() || b.id === brandParam);
      if (found) setSelectedBrand(found);
    }
    if (amt && !Number.isNaN(Number(amt))) setAmount(String(amt));
  }, [params, brands]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Upload file to S3 using presigned URL (no auth required for public endpoint)
      setUploading(true);
      try {
        console.log("Getting presigned upload URL for:", file.name, file.type);
        const response = await getPresignedUploadUrl(file.name, file.type);
        console.log("Presigned URL response:", response);
        
        if (response.success && response.data) {
          console.log("Uploading to S3 URL:", response.data.uploadUrl);
          // Upload file to S3
          const uploadResponse = await fetch(response.data.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          console.log("S3 upload response status:", uploadResponse.status);
          console.log("S3 upload response headers:", uploadResponse.headers);

          if (uploadResponse.ok) {
            setReceiptUrl(response.data.fileUrl);
            toast.success("Receipt uploaded successfully!");
            console.log("File uploaded successfully, receipt URL:", response.data.fileUrl);
          } else {
            const errorText = await uploadResponse.text();
            console.error("S3 upload failed:", uploadResponse.status, errorText);
            throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${errorText}`);
          }
        } else {
          console.error("Invalid response from presigned URL API:", response);
          throw new Error("Invalid response from upload URL API");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to upload receipt: ${errorMessage}`);
      } finally {
        setUploading(false);
      }
    }
  }

  const canContinue = Boolean(selectedBrand) && 
    Boolean(fileName) && 
    Boolean(receiptUrl) && 
    !uploading && 
    !loadingBrands &&
    !submitting &&
    parseInt(amount) > 0;

  return (
    <>
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        Upload Receipt {selectedBrand ? `for ${selectedBrand.name}` : ''}
      </h1>
      <p className="text-center text-black/70 mt-2">
        {selectedBrand ? `Upload your ${selectedBrand.name} purchase receipt` : 'Upload your purchase receipt to earn Corra Coins'}
      </p>

      {/* Removed old inline stepper (now in layout) */}

      <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white animate-fade-up delay-100 relative">
        <div className="px-6 py-6 border-b border-black/10">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {selectedBrand ? `Upload Receipt for ${selectedBrand.name}` : 'Upload Receipt'}
          </h2>
          <p className="text-black/70 mt-2">
            Upload a clear photo of your purchase receipt to earn Corra Coins
          </p>
        </div>
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
                      {brands.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(b => (
                        <button
                          key={b.id}
                          className={`flex-1 rounded-lg border-2 p-4 flex flex-col items-center gap-3 text-center transition-all duration-500 ease-out mt-4 mb-4 ml-2 mr-4 ${
                            selectedBrand?.id === b.id 
                              ? "border-green-600 bg-green-50 scale-105 shadow-md" 
                              : "border-black/10 hover:bg-black/5 hover:scale-102 hover:border-green-300"
                          }`}
                          onClick={() => handleSelectBrand(b)}
                        >
                          <div
                            className={`h-12 w-12 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 transition-all duration-500 ease-out bg-gray-100 ${
                              selectedBrand?.id === b.id ? "ring-green-300" : ""
                            }`}
                          >
                            <Image
                              src={b.logoUrl}
                              alt={b.name}
                              width={48}
                              height={48}
                              className={`h-8 w-8 object-contain transition-all duration-500 ease-out ${
                                selectedBrand?.id === b.id ? "scale-110" : "scale-100"
                              }`}
                              unoptimized
                              draggable={false}
                            />
                          </div>
                          <div className={`font-medium text-sm transition-colors duration-500 ease-out ${
                            selectedBrand?.id === b.id ? "text-green-700" : "text-gray-700"
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
                    {overlayBrands.map(b => (
                      <button
                        key={b.id}
                        className={`rounded-md border-2 p-1.5 flex items-center gap-1.5 text-left text-xs transition-all duration-300 ease-out ${
                          selectedBrand?.id === b.id
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
                          className={`h-6 w-6 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 bg-gray-100`}
                        >
                          <Image
                            src={b.logoUrl}
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

          {/* Requirements */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-4 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure the receipt photo is clear</li>
              <li>
                Total transaction value & Unique Order Id must be present on the
                receipt
              </li>
            </ul>
          </div>

          {/* Dropzone */}
          <div className="mt-6">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setFileName(file.name);
                  const url = URL.createObjectURL(file);
                  setPreviewUrl(url);
                }
              }}
              className={`block rounded-2xl border-2 border-dashed px-6 py-12 text-center text-black/70 cursor-pointer transition-colors ${
                dragging || previewUrl
                  ? "border-green-500 bg-green-50"
                  : "border-black/15 hover:bg-black/5"
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={onFileChange}
              />
              {previewUrl ? (
                <div className="animate-fade-in">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={224}
                    className="mx-auto max-h-56 rounded-xl"
                  />
                  <div className="mt-3 text-sm">
                    Selected: <span className="font-medium">{fileName}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full border border-black/20 grid place-items-center text-2xl">
                    ↥
                  </div>
                  <div className="mt-3 font-medium">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-black/50">PNG, JPG up to 10MB</div>
                </>
              )}
            </label>
          </div>

          {/* Amount */}
          <div className="mt-6">
            <label className="text-sm font-medium">
              Transaction Value (₹)
            </label>
            <div className="mt-1 relative">
              <input
                className="w-full h-12 rounded-xl border border-black/15 px-4 pr-10 outline-none focus:border-green-600 transition"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow whole numbers (integers)
                  if (value === '' || /^\d+$/.test(value)) {
                    setAmount(value);
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

          {/* Notes */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3">
              Verifying your transaction will take 2–3 business days
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3">
              You can get cashback on earned Corra Coins on purchase
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
              onClick={async () => {
                if (!canContinue) {
                  if (loadingBrands) {
                    toast.error("Please wait for brands to load");
                  } else if (!selectedBrand) {
                    toast.error("Please select a brand");
                  } else if (!receiptUrl) {
                    toast.error("Please upload a receipt");
                  } else if (!fileName) {
                    toast.error("Please select a file");
                  } else if (parseInt(amount) <= 0) {
                    toast.error("Please enter a valid amount");
                  }
                  return;
                }
                
                setSubmitting(true);
                try {
                  // Create pending transaction in backend
                  // For now, use a placeholder URL since we're not uploading to S3 yet
                  const placeholderUrl = `local://${fileName}_${Date.now()}`;
                  
                  const response = await createPendingTransaction({
                    sessionId: sessionId,
                    brandId: selectedBrand!.id,
                    billAmount: parseInt(amount) || 0,
                    receiptUrl: placeholderUrl,
                    fileName: fileName,
                  });

                  if (response.success) {
                    toast.success("Request saved! Please sign in to continue.");
                    
                    // Navigate to phone verification step
                    const url = `/upload/phone?brand=${encodeURIComponent(
                      selectedBrand!.id
                    )}&amount=${encodeURIComponent(amount)}`;
                    router.push(url);
                  } else {
                    toast.error(response.message || "Failed to save request");
                  }
                } catch (error) {
                  console.error("Error creating pending transaction:", error);
                  const errorMessage = error instanceof Error ? error.message : "Unknown error";
                  toast.error(`Failed to save request: ${errorMessage}`);
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!canContinue}
              className={`flex-1 h-12 rounded-xl text-white font-medium transition ${
                canContinue
                  ? "bg-green-700 hover:bg-green-800 active:scale-95"
                  : "bg-black/20 cursor-not-allowed"
              }`}
              title={!canContinue ? 
                (!selectedBrand ? "Please select a brand" :
                 !receiptUrl ? "Please upload a receipt" : 
                 loadingBrands ? "Loading brands..." : 
                 "Please complete all fields") : 
                ""}
            >
              {submitting ? "Submitting..." : loadingBrands ? "Loading brands..." : uploading ? "Uploading..." : "Continue"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
