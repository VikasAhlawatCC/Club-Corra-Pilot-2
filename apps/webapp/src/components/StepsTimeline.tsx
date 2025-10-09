"use client";

import { Upload, CheckCircle, Trophy } from "lucide-react";

interface StepsTimelineProps {
  currentStep: 1 | 2 | 3;
}

export function StepsTimeline({ currentStep }: StepsTimelineProps) {
  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center">
        {/* Step 1 - Upload Receipt */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentStep >= 1
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}>
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs text-gray-500 mt-2 text-center max-w-20">Upload Receipt</span>
        </div>
        
        {/* Connector */}
        <div className={`w-16 h-0.5 mx-4 transition-all ${
          currentStep > 1 ? "bg-green-600" : "bg-gray-300"
        }`} />
        
        {/* Step 2 - Verify Details */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentStep >= 2
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}>
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-xs text-gray-500 mt-2 text-center max-w-20">Verify Details</span>
        </div>
        
        {/* Connector */}
        <div className={`w-16 h-0.5 mx-4 transition-all ${
          currentStep > 2 ? "bg-green-600" : "bg-gray-300"
        }`} />
        
        {/* Step 3 - Get Coins */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentStep >= 3
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs text-gray-500 mt-2 text-center max-w-20">Get Coins</span>
        </div>
      </div>
    </div>
  );
}


