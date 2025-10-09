"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function UploadSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setBrand(params.get("brand") || "");
    setAmount(params.get("amount") || "");
  }, [params]);

  const amountNumber = Number(amount || 0);

  return (
    <section className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-up text-center">

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 relative"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-yellow-600 flex items-center gap-1">
              {amountNumber}
              <motion.div
                className="inline-block relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                  <span className="text-yellow-900 font-bold text-xs relative z-10 drop-shadow-sm">CC</span>
                </div>
              </motion.div>
            </span>
            <span className="text-green-600">Coins Credited</span>
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve verified your receipt and credited coins to your wallet.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
            <div className="text-green-800 font-medium text-center leading-loose space-y-1">
              <p className="flex items-center justify-center gap-2">🎉 Your coins are credited</p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-flex w-5 h-5 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full items-center justify-center shadow-lg border-2 border-yellow-200 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></span>
                  <span className="text-yellow-900 font-bold text-[10px] leading-none relative z-10 drop-shadow-sm">CC</span>
                </span>
                Earned Corra Coins will reflect in your wallet
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg"
          >
            Go to Wallet
          </Button>

          <button
            onClick={() => router.push("/")}
            className="w-full text-gray-600 hover:text-green-600 text-sm font-medium flex items-center justify-center gap-2"
          >
            Earn More
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-gray-500 mt-6"
      >
        Track your coin status in the Transaction History
      </motion.p>
    </section>
  );
}


