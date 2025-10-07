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
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [billAmount, setBillAmount] = useState<number>(1000);
  const [coinsRedeemed, setCoinsRedeemed] = useState<number>(0);
  const [upiId, setUpiId] = useState<string>(user?.upiId || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);

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

  const fetchBrands = async () => {
    try {
      const response = await getActiveBrands();
      if (response.success && response.data && Array.isArray(response.data)) {
        const validBrands = response.data.filter((brand: Brand) => brand && brand.id && brand.name);
        setBrands(validBrands);
        setSelectedBrand(validBrands[0] || null);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load brands: ${errorMessage}`);
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
    if (!selectedBrand || !receiptUrl || !token) {
      toast.error("Please fill in all required fields");
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
        router.push("/dashboard");
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

  const maxRedeemable = Math.min(
    user?.totalCoins || 0,
    selectedBrand ? Math.round(billAmount * selectedBrand.redemptionPercentage / 100) : 0,
    selectedBrand?.redemptionPercentage ? Math.round(billAmount * 0.5) : 0 // Max 50% of bill
  );

  const coinsEarned = selectedBrand 
    ? Math.round((billAmount - coinsRedeemed) * selectedBrand.earningPercentage / 100)
    : 0;

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Get Rewards</h1>

        <div className="space-y-6">
          {/* Brand Selection */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="font-semibold mb-4">Select Brand</h2>
            {loadingBrands ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading brands...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedBrand?.id === brand.id
                        ? "border-green-600 bg-green-50"
                        : "border-black/10 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <span className="text-xs font-semibold">{brand.name.substring(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{brand.name}</div>
                        <div className="text-xs text-gray-500">
                          {brand.earningPercentage}% earn, {brand.redemptionPercentage}% redeem
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bill Amount */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="font-semibold mb-4">Transaction Value</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[500, 1000, 2500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBillAmount(amount)}
                  className={`h-12 rounded-xl border text-sm font-medium ${
                    billAmount === amount
                      ? "border-green-600 bg-green-50"
                      : "border-black/15 hover:bg-black/5"
                  }`}
                >
                  ₹ {amount}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Enter custom amount"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          {/* Receipt Upload */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="font-semibold mb-4">Upload Receipt</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReceiptFile(file);
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer block"
              >
                {uploading ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Uploading...</p>
                  </div>
                ) : receiptUrl ? (
                  <div>
                    <div className="text-green-600 text-2xl">✓</div>
                    <p className="mt-2 text-green-600">Receipt uploaded successfully!</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-2xl">📷</div>
                    <p className="mt-2 text-gray-600">Click to upload receipt</p>
                    <p className="text-sm text-gray-500">JPG, PNG, PDF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Redemption Slider */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="font-semibold mb-4">Redeem Coins (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Coins to Redeem: {coinsRedeemed}
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxRedeemable}
                  value={coinsRedeemed}
                  onChange={(e) => setCoinsRedeemed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>Max: {maxRedeemable}</span>
                </div>
              </div>

              {coinsRedeemed > 0 && (
                <div>
                  <label htmlFor="upi" className="block text-sm font-medium mb-2">
                    UPI ID
                  </label>
                  <Input
                    id="upi"
                    type="text"
                    placeholder="Enter your UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Bill Amount:</span>
                <span>₹{billAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Coins Redeemed:</span>
                <span className="text-rose-600">-₹{coinsRedeemed}</span>
              </div>
              <div className="flex justify-between">
                <span>Coins Earned:</span>
                <span className="text-green-600">+₹{coinsEarned}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Net Earning:</span>
                <span className="text-green-600">₹{coinsEarned}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedBrand || !receiptUrl || submitting}
            className="w-full h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </main>
    </div>
  );
}
