"use client";

import BackButton from "@/components/BackButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import { ALL_BRANDS, type Brand } from "@/data/brands";
import Image from "next/image";

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">Loading…</div>}>
      <RedeemContent />
    </Suspense>
  );
}

function RedeemContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [selected, setSelected] = useState<Brand>(ALL_BRANDS[0]);
  const [amount, setAmount] = useState<string>(String(Number(params.get("amount") || 100)));
  const [upiId, setUpiId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [dragging, setDragging] = useState<boolean>(false);
  const [redeemAmount, setRedeemAmount] = useState<number>(100);

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

  // Pagination helpers
  function prevPage() {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }
  function nextPage() {
    setPage(p => (p + 1) % totalPages);
  }

  function handleSelectBrand(b: Brand) {
    setSelected(b);
  }

  // Sync redeemAmount with amount when amount changes
  useEffect(() => {
    const numAmount = Number(amount);
    if (!Number.isNaN(numAmount) && numAmount > 0) {
      setRedeemAmount(Math.min(Math.max(numAmount, 50), 500));
    }
  }, [amount]);

  useEffect(() => {
    const a = params.get("amount");
    if (a && !Number.isNaN(Number(a))) setAmount(String(a));
  }, [params]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  const canContinue = Boolean(fileName && upiId && Number(amount) > 0);

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-up">
        <BackButton />
        <h1 className="text-center text-3xl sm:text-4xl font-bold">Claim Cashback</h1>
        <p className="text-center text-black/70 mt-2">Redeem ₹{redeemAmount} from your Corra Coins</p>

        {/* Stepper */}
        <div className="mt-6 flex items-center justify-center gap-12 text-sm">
          {[
            { label: "Upload Receipt", active: true },
            { label: "Verify Details", active: false },
            { label: "Submit", active: false },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full grid place-items-center text-white ${s.active ? "bg-green-700" : "bg-black/30"}`}>{i + 1}</div>
              <span className="text-black/70">{s.label}</span>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white animate-fade-up delay-100">
          <div className="px-6 py-6 border-b border-black/10">
            <h2 className="text-xl sm:text-2xl font-semibold">Upload Receipt for {selected.name}</h2>
            <p className="text-black/70 mt-2">Upload a clear photo of your purchase receipt to claim cashback</p>
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
                        {ALL_BRANDS.slice(pageIndex * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(b => (
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
                              className={`h-12 w-12 rounded-full grid place-items-center overflow-hidden ring-1 ring-black/10 transition-all duration-500 ease-out ${b.color || "bg-gray-100"} ${
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
                          key={b.key}
                          className={`rounded-md border-2 p-1.5 flex items-center gap-1.5 text-left text-xs transition-all duration-300 ease-out ${
                            selected.key === b.key
                              ? "border-green-600 bg-green-50"
                              : "border-black/10 hover:bg-black/5 hover:border-green-300"
                          }`}
                          onClick={() => {
                            handleSelectBrand(b);
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

            <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Get Cashback Now!</h2>
            <div className="text-green-700 font-semibold text-xl">₹{redeemAmount}</div>
          </div>
          <div className="mt-4">
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={redeemAmount}
              onChange={(e) => {
                const newAmount = Math.round(Number(e.target.value));
                setRedeemAmount(newAmount);
                setAmount(String(newAmount));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-black/60 mt-2">
              <span>₹50</span>
              <span>₹500</span>
            </div>
          </div>
        </section>

            {/* Upload Requirements */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-4 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure the receipt photo is clear</li>
                <li>PNG or JPG up to 10MB</li>
              </ul>
            </div>

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
                    setFileName(file.name);
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  }
                }}
                className={`block rounded-2xl border-2 border-dashed px-6 py-12 text-center text-black/70 cursor-pointer transition-colors drop-shadow-soft ${
                  dragging || previewUrl ? "border-green-500 bg-green-50" : "border-black/15 hover:bg-black/5"
                }`}
              >
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFileChange} />
                {previewUrl ? (
                  <div className="animate-fade-in">
                    <Image src={previewUrl} alt="Preview" width={400} height={224} className="mx-auto max-h-56 rounded-xl drop-shadow-soft" />
                    <div className="mt-3 text-sm">Selected: <span className="font-medium">{fileName}</span></div>
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
                  value={amount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    // Only allow whole numbers (integers)
                    if (newAmount === '' || /^\d+$/.test(newAmount)) {
                      setAmount(newAmount);
                      const numAmount = Number(newAmount);
                      if (!Number.isNaN(numAmount) && numAmount > 0) {
                        setRedeemAmount(Math.min(Math.max(numAmount, 50), 500));
                      }
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter amount (whole numbers only)"
                />
                <button 
                  onClick={() => {
                    setAmount(String(redeemAmount));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-black/15 grid place-items-center text-xs hover:bg-gray-50 transition"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* UPI ID */}
            <div className="mt-4">
              <label className="text-sm font-medium">UPI ID</label>
              <input
                className={`mt-1 w-full h-12 rounded-xl border px-4 outline-none transition ${
                  redeemAmount === 50
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" 
                    : "border-black/15 focus:border-green-600"
                }`}
                placeholder={redeemAmount === 0 ? "Set amount to enable UPI ID" : "Enter your UPI ID (e.g., name@paytm)"}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={redeemAmount === 0}
              />
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
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => {
                  if (!canContinue) return;
                  const integerAmount = parseInt(amount) || 0;
                  router.push(`/redeem/success?amount=${encodeURIComponent(integerAmount)}`);
                }}
                className={`w-full h-12 rounded-xl text-white font-medium transition ${
                  canContinue ? "bg-green-700 hover:bg-green-800 active:scale-95" : "bg-black/20 cursor-not-allowed"
                }`}
              >
                Continue to Verify
              </button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Slider Styles */}
      <style jsx>{`
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
    </div>
  );
}


