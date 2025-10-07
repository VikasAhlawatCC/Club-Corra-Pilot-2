"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

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

  return (
    <section className="animate-fade-up">
      <div className="mx-auto max-w-xl rounded-[28px] bg-white border border-black/10 shadow-xl shadow-black/5 p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_60%_30%,#16a34a0d,transparent_70%)]" />
        <div className="w-20 h-20 rounded-full bg-green-600 text-white grid place-items-center mx-auto mb-8 relative">
          <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
            <path
              d="M9 12l2 2 4-4M21 11.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-bold">Coins Credited!</h1>
        <p className="text-center text-black/60 mt-3">
          You earned Corra Coins for <span className="font-medium">{brand || "your purchase"}</span>.
        </p>
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-6 py-6 text-green-900 text-sm">
          <p className="font-semibold text-green-800">Receipt Verified & Wallet Updated</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Amount: ₹{amount || "—"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Coins Added: ₹{amount || "—"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Track & redeem in your dashboard</span>
            </li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition active:scale-[.98]"
          >
            Go To Dashboard
          </button>
          <button
            onClick={() => router.push("/rewards")}
            className="flex-1 h-12 rounded-xl border border-green-400 bg-white hover:bg-green-100 text-green-700 font-semibold transition"
          >
            Upload Another
          </button>
        </div>
      </div>
    </section>
  );
}


