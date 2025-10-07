"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-sm text-black/70 hover:text-black rounded-lg border border-black/10 px-3 py-2 bg-white/70 backdrop-blur ${className}`}
    >
      <span className="rotate-180">➔</span>
      Back
    </button>
  );
}


