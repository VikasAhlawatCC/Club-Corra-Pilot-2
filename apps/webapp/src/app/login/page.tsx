"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendOTP as sendOTPApi, verifyOTP } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 flex items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [redirect, setRedirect] = useState("/dashboard");
  const [stage, setStage] = useState<"phone" | "otp" | "redirecting">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const r = params.get("redirect");
    if (r) setRedirect(r.startsWith("/") ? r : `/${r}`);
  }, [params]);

  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(v => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  async function sendOTP() {
    if (phone.length !== 10 || sending) return;
    setSending(true);
    
    try {
      await sendOTPApi(`+91${phone}`);
      toast.success("OTP sent successfully!");
      setStage("otp");
      setResendTimer(30);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to send OTP: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  }
  
  async function verifyOTPCode() {
    if (otp.length !== 6 || verifying) return;
    setVerifying(true);
    
    try {
      const response = await verifyOTP(`+91${phone}`, otp);
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        toast.success("Login successful!");
        setStage("redirecting");
        setTimeout(() => {
          router.push(redirect);
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to verify OTP: ${errorMessage}`);
    } finally {
      setVerifying(false);
    }
  }
  function resend() {
    if (resendTimer || sending) return;
    sendOTP();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {stage === "phone" && (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-600 text-white grid place-items-center mx-auto mb-8">
                <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
                  <path
                    d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1v3.52a1 1 0 01-1 1A17.82 17.82 0 012 5a1 1 0 011-1h3.54a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.24 2.22z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Mobile Number</h2>
              <p className="text-gray-600 mb-8">We&apos;ll send you an OTP to verify your account</p>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs sm:text-sm px-4 py-4 leading-relaxed">
                  We only use this number for security and Corra Coin updates.
                </div>

                <Button
                  onClick={sendOTP}
                  disabled={phone.length !== 10 || sending}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg"
                >
                  {sending ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </div>
          )}

          {stage === "otp" && (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-600 text-white grid place-items-center mx-auto mb-8">
                <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
                  <path d="M12 2l9 4v6c0 5-3.8 9.4-9 10-5.2-.6-9-5-9-10V6l9-4z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-600 mb-8">
                We&apos;ve sent a 6-digit code to +91 {phone}
              </p>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="text-center text-xs sm:text-sm">
                  {!resendTimer ? (
                    <button
                      onClick={resend}
                      className="text-green-600 hover:text-green-700 font-medium underline underline-offset-4"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-gray-500">Resend in {resendTimer}s</span>
                  )}
                </div>

                <Button
                  onClick={verifyOTPCode}
                  disabled={otp.length !== 6 || verifying}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg"
                >
                  {verifying ? "Verifying..." : "Verify & Continue"}
                </Button>

                <button
                  onClick={() => {
                    setStage("phone");
                    setOtp("");
                    setResendTimer(0);
                  }}
                  className="w-full text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Change Mobile Number
                </button>
              </div>
            </div>
          )}

          {stage === "redirecting" && (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-600 text-white grid place-items-center mx-auto mb-8">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
              <p className="text-gray-600 mb-8">
                Phone verified successfully. Redirecting to your dashboard...
              </p>
              
              <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-6 text-green-900 text-sm mb-8">
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Mobile number verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Secured account updates</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
