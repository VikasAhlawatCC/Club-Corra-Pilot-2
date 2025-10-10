"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X, Mail, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface WaitlistSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function WaitlistSuccessModal({ 
  isOpen, 
  onClose, 
  email 
}: WaitlistSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative mx-auto w-20 h-20 mb-6"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    Welcome to Club Corra! 🎉
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6"
                  >
                    You're now on our early access list
                  </motion.p>

                  {/* Email confirmation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Confirmation sent to:</span>
                    </div>
                    <p className="text-green-800 font-semibold mt-1 break-all">{email}</p>
                  </motion.div>

                  {/* What's next */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-left bg-gray-50 rounded-xl p-4 mb-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">What's next?</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check your email for confirmation</li>
                      <li>• We'll notify you when we launch</li>
                      <li>• Get exclusive early access to rewards</li>
                    </ul>
                  </motion.div>

                  {/* Action button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={onClose}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      Got it!
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
