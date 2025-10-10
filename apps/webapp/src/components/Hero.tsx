"use client"; // Added to allow onClick in this component

import Image from "next/image";
import { circleBrands } from "@/data/brands";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import WaitlistSuccessModal from "./WaitlistSuccessModal";
import { getBrandLogoUrl, getFallbackImageUrl } from "@/utils/imageUtils";

// Brands displayed in the orbit are sourced from circleBrands (data/brands)

 interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}


export default function Hero({}:HeroSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

// Email validation function
const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: "Please enter your email address" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

const handleGetEarlyAccess = async () => {
  // Client-side validation
  const validation = validateEmail(email);
  if (!validation.isValid) {
    toast.error(validation.message!);
    return;
  }

  setIsLoading(true);
  
  try {
    const { addToWaitlist } = await import('@/lib/api');
    await addToWaitlist(email.trim());
    
    // Store the submitted email and show success modal
    setSubmittedEmail(email.trim());
    setShowSuccessModal(true);
    setEmail(""); // Clear the email field
    
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    
    // Enhanced error handling with specific error categorization
    let errorMessage = "Something went wrong. Please try again.";
    let isUserError = false;
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Network/connection errors
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      // Server errors (5xx)
      else if (message.includes('server') || message.includes('internal') || message.includes('500')) {
        errorMessage = "Our servers are temporarily unavailable. Please try again in a few minutes.";
      }
      // Rate limiting
      else if (message.includes('rate limit') || message.includes('too many requests')) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      }
      // Email already exists (treat as success)
      else if (message.includes('email already exists') || message.includes('already registered')) {
        setSubmittedEmail(email.trim());
        setShowSuccessModal(true);
        setEmail("");
        toast.success("You're already on our early access list! 🎉 We'll notify you when we launch!");
        return;
      }
      // Invalid email format
      else if (message.includes('invalid email') || message.includes('email format')) {
        errorMessage = "Please enter a valid email address.";
        isUserError = true;
      }
      // Generic API error
      else if (message.includes('failed to add') || message.includes('error')) {
        errorMessage = "Unable to add you to the waitlist. Please try again.";
      }
    }
    
    // Show appropriate error message
    if (isUserError) {
      toast.error(errorMessage);
    } else {
      toast.error(errorMessage);
    }
    
  } finally {
    setIsLoading(false);
  }
};



  const scrollToActionSection = () => {
    document.querySelector('#brands')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };


	return (
		<>
		<section className="min-h-screen relative overflow-hidden">
			{/* Enhanced gradient background with pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50/80 to-white"></div>
			<div className="absolute inset-0 bg-gradient-to-tr from-green-100/30 via-transparent to-emerald-100/20"></div>
			
			{/* Subtle pattern overlay */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.05)_0%,transparent_50%)]"></div>
				<div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05)_0%,transparent_50%)]"></div>
				<div className="absolute bottom-0 left-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(5,150,105,0.03)_0%,transparent_50%)]"></div>
			</div>

			{/* Enhanced background decorations */}
			<div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-r from-emerald-300/20 to-green-400/20 rounded-full blur-3xl"></div>
			<div className="absolute bottom-20 left-10 w-56 h-56 bg-gradient-to-r from-green-300/15 to-emerald-400/15 rounded-full blur-3xl"></div>
			<div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-teal-300/10 to-emerald-300/10 rounded-full blur-2xl"></div>

			{/* Top right login prompt - Mobile responsive */}
			<div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
				<span className="text-gray-600 hidden sm:inline">Already a member?</span>
				<button
					onClick={() => {
						window.location.href = "/login?redirect=dashboard";
					}}
					className="bg-white/90 backdrop-blur-sm border-2 border-green-600 hover:border-green-700 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 sm:px-6 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm touch-target"
            >
					<span className="sm:hidden">Login</span>
					<span className="hidden sm:inline">Log-In</span>
				</button>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
				<div className="flex flex-col items-center text-center space-y-12">
				<div className="animate-fade-up text-center relative">
					<div className="flex justify-center">
						<Image
							src="/corro_logo.png"
							alt="Corra Club"
							width={150}
							height={108}
							className="mx-auto mb-6 rounded-full"
						/>
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight px-4">
						One Club.
						<span className="text-green-700"> Many Brands.</span>
						<br className="hidden sm:block" />
						Infinite Rewards.
					</h1>
					{/* Decorative SVGs around headline */}
					<svg
						viewBox="0 0 24 24"
						className="hidden sm:block pointer-events-none absolute -left-6 top-8 h-5 w-5 text-green-600/70 animate-pulse"
						aria-hidden
					>
						<path
							d="M12 2l2.5 6 6.5 2.5-6.5 2.5L12 21l-2.5-8L3 10.5 9.5 8 12 2z"
							fill="currentColor"
						/>
					</svg>
					<svg
						viewBox="0 0 28 28"
						className="hidden sm:block pointer-events-none absolute -right-8 top-6 h-6 w-6 text-blue-500/60 motion-safe:animate-spin"
						style={{ animationDuration: "12s" }}
						aria-hidden
					>
						<circle
							cx="14"
							cy="14"
							r="10"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeDasharray="4 6"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						className="hidden sm:block pointer-events-none absolute -left-10 bottom-6 h-6 w-6 text-emerald-500/60 animate-bounce"
						aria-hidden
					>
						<path
							d="M12 3v18M3 12h18"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						className="hidden sm:block pointer-events-none absolute right-4 bottom-12 h-7 w-7 text-purple-500/50 motion-safe:animate-spin"
						style={{ animationDuration: "15s", animationDirection: "reverse" }}
						aria-hidden
					>
						<path
							d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						className="hidden sm:block pointer-events-none absolute left-12 top-2 h-4 w-4 text-amber-500/60 animate-pulse"
						style={{ animationDelay: "1s" }}
						aria-hidden
					>
						<circle cx="12" cy="12" r="8" fill="currentColor" />
					</svg>
					<svg
						viewBox="0 0 32 32"
						className="hidden sm:block pointer-events-none absolute -right-4 bottom-4 h-8 w-8 text-teal-400/50 animate-bounce"
						style={{ animationDelay: "0.5s", animationDuration: "2s" }}
						aria-hidden
					>
						<path
							d="M16 4L18 12L26 14L18 16L16 24L14 16L6 14L14 12Z"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						className="hidden lg:block pointer-events-none absolute left-24 bottom-20 h-5 w-5 text-rose-400/60 motion-safe:animate-spin"
						style={{ animationDuration: "20s" }}
						aria-hidden
					>
						<polygon
							points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10"
							fill="currentColor"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						className="hidden lg:block pointer-events-none absolute right-16 top-16 h-6 w-6 text-indigo-400/50 animate-pulse"
						style={{ animationDelay: "2s" }}
						aria-hidden
					>
						<rect
							x="6"
							y="6"
							width="12"
							height="12"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							rx="2"
						/>
					</svg>
					<motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4"
            >
              Earn <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">₹100/-</span> cashback on every ₹1000/- spend online. Show us your recent purchase & get Corra Coins for <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">FREE!</span>
            </motion.p>


				</div>

		 <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col gap-6 items-center w-full max-w-lg"
          >
            {/* Primary CTA - Get Cashback Now with enhanced styling */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={scrollToActionSection}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 h-14 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 group border-0"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">₹</span>
                    Get Cashback Now
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-5 h-5 group-hover:text-green-100 transition-colors" />
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start earning cashback from your favorite brands right away</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Secondary CTA - Email Input + Button (Connected) */}
            <div className="flex flex-col sm:flex-row w-full bg-white/90 backdrop-blur-sm rounded-lg border-2 border-gray-200 focus-within:border-green-500 transition-colors overflow-hidden">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleGetEarlyAccess();
                  }
                }}
                disabled={isLoading}
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-6 border-0 focus:ring-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                onClick={handleGetEarlyAccess}
                disabled={isLoading}
                variant="outline"
                className="border-2 border-green-600 hover:border-green-700 text-green-600 hover:text-green-700 hover:bg-green-50 px-4 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 text-sm sm:text-lg font-semibold rounded-none sm:rounded-r-lg shadow-none hover:shadow-none transition-all duration-300 transform hover:scale-105 whitespace-nowrap bg-white/90 touch-target disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="sm:hidden">Adding...</span>
                    <span className="hidden sm:inline">Adding to Waitlist...</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Get Access</span>
                    <span className="hidden sm:inline">Get Early Access</span>
                  </>
                )}
              </Button>
            </div>

          </motion.div>

				<div className="relative w-full max-w-2xl mx-auto px-4 mt-8 sm:mt-12">
					<div className="relative h-64 sm:h-80 md:h-96 w-full">
						{/* Decorative background glows (removed blue) */}
						<div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-green-200/80 blur-3xl" aria-hidden></div>
						<div className="pointer-events-none absolute -bottom-10 -right-12 h-48 w-48 rounded-full bg-green-300/70 blur-3xl" aria-hidden></div>
						{/* Orbit container */}
						<div className="absolute inset-0">
							<div className="orbit-container h-full w-full relative">
								{/* Animated orbit rings */}
								<svg
									viewBox="0 0 320 320"
									className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 motion-safe:animate-spin"
									style={{ animationDuration: "18s" }}
									aria-hidden
								>
									<circle
										cx="160"
										cy="160"
										r="120"
										fill="none"
										stroke="#22c55e22"
										strokeWidth="2"
										strokeDasharray="6 10"
									/>
								</svg>
								<svg
									viewBox="0 0 360 360"
									className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 motion-safe:animate-spin"
									style={{ animationDuration: "28s" }}
									aria-hidden
								>
									<circle
										cx="180"
										cy="180"
										r="150"
										fill="none"
										stroke="#22c55e33"
										strokeWidth="2"
										strokeDasharray="4 14"
									/>
								</svg>
								{/* Center logo with ripple */}
								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
									<div className="center-pulse h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full bg-white grid place-items-center shadow-lg overflow-hidden">
										<Image
											src="/corro_logo.png"
											alt="Corra Club"
											width={128}
											height={128}
											className="rounded-full object-cover w-full h-full"
										/>
									</div>
								</div>

                                {/* Brand orbit */}
                                 <div className="absolute inset-0">
                                    {circleBrands.map((b, index) => {
                                        const count = circleBrands.length || 1;
                                        const angle = (360 / count) * index;
                                        const isLeft = angle > 90 && angle < 270;
                                        return (
                                            <div
                                                key={b.key}
                                                className="group absolute left-[53%] top-[58%] -translate-x-1/2 -translate-y-1/2"
                                                style={{
                                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-150px) rotate(${-angle}deg)`,
                                                }}
                                            >
                                                <div
                                                    className={`relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 grid place-items-center overflow-hidden brand-orbit transition-transform duration-300 group-hover:scale-110 ring-1 ring-black/10`}
                                                >
													{b.icon ? (
														<Image
															src={getBrandLogoUrl(b.icon, b.name)}
															alt={b.name}
															width={40}
															height={40}
															className="w-full h-full object-contain"
															unoptimized
															onError={(e) => {
																console.error('Failed to load hero brand image:', b.name);
																e.currentTarget.src = getFallbackImageUrl(b.name);
															}}
														/>
													) : (
														<span className="text-xs font-semibold text-neutral-700">{b.short}</span>
													)}
                                                </div>
                                                
                                            </div>
                                        );
                                    })}
                                </div>
							</div>
						</div>

						{/* Side callouts */}
						<div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 md:-translate-x-32 lg:-translate-x-40 xl:-translate-x-48 hidden md:block">
							<div className="relative rounded-2xl border-2 border-green-200 bg-white/80 backdrop-blur-sm shadow-lg px-6 py-4 w-32">
								{/* Decorative corner sparkle */}
								<svg
									viewBox="0 0 24 24"
									className="absolute -top-2 -right-2 h-5 w-5 text-green-500 animate-pulse"
									aria-hidden
								>
									<path
										d="M12 2l2.5 6 6.5 2.5-6.5 2.5L12 21l-2.5-8L3 10.5 9.5 8 12 2z"
										fill="currentColor"
									/>
								</svg>
								<div className="text-3xl font-bold leading-none text-green-700">
									30+
								</div>
								<div className="text-xs text-black/70 leading-snug mt-1">
									Selected
									<br />
									Brands
								</div>
							</div>
						</div>
						<div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-32 lg:translate-x-40 xl:translate-x-48 text-right hidden md:block">
							<div className="relative rounded-2xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg px-6 py-4 w-44">
								{/* Decorative spinning ring */}
								<svg
									viewBox="0 0 28 28"
									className="absolute -top-2 -left-2 h-6 w-6 text-blue-500/70 motion-safe:animate-spin"
									style={{ animationDuration: "10s" }}
									aria-hidden
								>
									<circle
										cx="14"
										cy="14"
										r="10"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray="4 6"
									/>
								</svg>
								{/* Cash icon */}
								<svg
									viewBox="0 0 24 24"
									className="absolute -bottom-2 -right-2 h-6 w-6 text-green-600 animate-bounce"
									aria-hidden
								>
									<path
										fill="currentColor"
										d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"
									/>
								</svg>
								<div className="text-sm leading-snug text-black/80">
									Get cash back
									<br />
									<span className="text-green-700 font-semibold">on each</span>
									<br />
									<span className="text-green-700 font-semibold">purchase</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				</div>
			</div>
		</section>

		{/* Success Modal */}
		<WaitlistSuccessModal
			isOpen={showSuccessModal}
			onClose={() => setShowSuccessModal(false)}
			email={submittedEmail}
		/>
		</>
	);
}

