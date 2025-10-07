"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import PhoneVerification from "@/components/PhoneVerification";

export default function PhoneVerificationPage() {
  return (
    <Suspense fallback={<div className="py-10">Loading...</div>}>
      <PhoneVerificationContent />
    </Suspense>
  );
}

function PhoneVerificationContent() {
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
      <PhoneVerification
        brand={brand}
        amount={amount}
        autoAdvance={true}
        onSuccess={({ brand: b, amount: a }) =>
          router.push(`/upload/success?brand=${encodeURIComponent(b || brand)}&amount=${encodeURIComponent(a || amount)}`)
        }
      />
    </section>
  );
}
