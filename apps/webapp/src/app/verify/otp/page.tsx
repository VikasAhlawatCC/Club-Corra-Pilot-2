"use client";

import BackButton from "@/components/BackButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">Loading…</div>}>
      <OtpContent />
    </Suspense>
  );
}

function OtpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") || "";
  const brand = params.get("brand") || "";
  const amount = params.get("amount") || "";
  const redirect = params.get("redirect") || "";
  const [otp, setOtp] = useState("");

  function handleVerify() {
    router.push(`/verify/success?phone=${encodeURIComponent(phone)}&brand=${encodeURIComponent(brand)}&amount=${encodeURIComponent(amount)}&redirect=${encodeURIComponent(redirect)}`);
  }

  return (
    <div className="font-sans bg-white min-h-screen">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
        <BackButton />
        <h1 className="text-center text-3xl sm:text-4xl font-bold">Enter Contact Details</h1>
        <p className="text-center text-black/70 mt-2">Verify your mobile number to continue</p>

        <section className="mt-10 rounded-2xl border border-black/10 shadow-soft bg-white p-8 text-center animate-fade-up delay-100">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-700 text-white grid place-items-center text-2xl">🛡️</div>
          <h2 className="mt-4 text-2xl font-semibold">Enter Verification Code</h2>
          <p className="mt-1 text-black/70">We&apos;ve sent a 6-digit code to +91 {phone}</p>

          <div className="mt-6 text-left">
            <label className="text-sm font-medium">OTP Code</label>
            <input
              className="mt-1 w-full h-12 rounded-xl border border-black/15 px-4 outline-none focus:border-green-600 text-center tracking-widest"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={6}
            />
            <div className="mt-2 text-sm text-green-700">Didn&apos;t receive the code? Resend OTP</div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleVerify} className="flex-1 h-12 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800">Verify OTP</button>
            <button onClick={() => router.back()} className="flex-1 h-12 rounded-xl border border-black/15">Change Mobile Number</button>
          </div>
        </section>
      </main>
    </div>
  );
}


