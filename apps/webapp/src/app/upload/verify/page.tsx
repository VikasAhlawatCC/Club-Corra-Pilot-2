"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="py-10">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
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
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        Verifying Your Receipt
      </h1>
      <p className="text-center text-black/60 mt-2">
        Brand: <span className="font-medium">{brand || "—"}</span> • Amount: ₹
        {amount || "—"}
      </p>

      <div className="mt-10 rounded-2xl border border-black/10 bg-white shadow-sm p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-green-600/10 text-green-700 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
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
          <div>
            <h2 className="text-xl font-semibold">Verification In Progress</h2>
            <p className="text-black/60 mt-1">
              This usually takes 2–3 business days. You will be notified once
              complete.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/upload")}
            className="flex-1 h-12 rounded-xl border border-black/15 bg-white hover:bg-black/5 font-medium"
          >
            Edit Upload
          </button>
            <button
              onClick={() =>
                router.push(
                  `/upload/success?brand=${encodeURIComponent(
                    brand
                  )}&amount=${encodeURIComponent(amount)}`
                )
              }
              className="flex-1 h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-medium"
            >
              Simulate Success →
            </button>
        </div>
      </div>
    </section>
  );
}
