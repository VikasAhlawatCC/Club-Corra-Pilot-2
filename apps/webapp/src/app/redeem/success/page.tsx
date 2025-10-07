"use client";

import BackButton from "@/components/BackButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function RedeemSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const amount = Number(params.get("amount") || 100);

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up text-center">
        <BackButton className="mb-4" />
        <section className="mt-6 rounded-2xl border border-black/10 shadow-soft bg-white p-10">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-700 grid place-items-center text-3xl">✓</div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold">Receipt Uploaded Successfully!</h1>
          <p className="mt-2 text-black/70">Your cashback request for ₹{amount} has been submitted and is being processed.</p>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 p-4">
            🎉 You&apos;ll receive your cashback within 24–48 hours
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
            >
              Back to Wallet
            </button>
            <button
              onClick={() => router.push("/")}
              className="h-12 rounded-xl border border-black/15"
            >
              Continue Exploring
            </button>
          </div>
          <div className="mt-6 text-sm text-black/60">Track your cashback status in the Transaction History</div>
        </section>
      </main>
    </div>
  );
}


