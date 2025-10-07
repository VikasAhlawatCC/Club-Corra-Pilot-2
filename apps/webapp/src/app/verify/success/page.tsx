"use client";

import BackButton from "@/components/BackButton";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const phone = params.get("phone") || "";
  const brand = params.get("brand") || "";
  const amount = params.get("amount") || "";
  const redirect = params.get("redirect") || "";

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
        <BackButton />
        <h1 className="text-center text-3xl sm:text-4xl font-bold">Enter Contact Details</h1>
        <p className="text-center text-black/70 mt-2">Verify your mobile number to continue</p>

        <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white p-8 text-center animate-fade-up delay-100">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-700 text-white grid place-items-center text-2xl">✔</div>
          <h2 className="mt-4 text-2xl font-semibold">Mobile Number Verified!</h2>
          <p className="mt-1 text-black/70">Your contact details have been verified successfully. Proceeding to receipt verification…</p>

          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-left">
            <ul className="space-y-1 text-emerald-800">
              <li>✓ Mobile number verified (+91 {phone})</li>
              <li>✓ Account secured</li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              className="w-full h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800"
              onClick={() => {
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("auth", "true");
                  }
                } catch {}
                if (redirect === "dashboard") {
                  router.push("/dashboard");
                } else {
                  router.push(`/upload/success?brand=${encodeURIComponent(brand)}&amount=${encodeURIComponent(amount)}`);
                }
              }}
            >
              View Earned Coins
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}


