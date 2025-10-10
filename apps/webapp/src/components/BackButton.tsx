"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleBack = () => {
    // If on login page (mobile entry page), redirect to base URL
    if (pathname === "/login") {
      router.push("/");
    } else {
      router.back();
    }
  };
  
  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-sm text-black/70 hover:text-black rounded-lg border border-black/10 px-3 py-2 bg-white/70 backdrop-blur ${className}`}
    >
      <span className="rotate-180">➔</span>
      Back
    </button>
  );
}


