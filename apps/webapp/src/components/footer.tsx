"use client";
import { motion } from "motion/react";
import { Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-300 text-sm">Contact Us</p>
              <a 
                href="mailto:pbhutani@clubcorra.com" 
                className="text-white hover:text-green-400 transition-colors duration-300 font-medium text-sm sm:text-base break-all"
              >
                pbhutani@clubcorra.com
              </a>
            </div>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
          >
            <p className="text-gray-300 text-sm">Follow us on</p>
            
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/thecorraclub"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 group touch-target"
              >
                <Instagram className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/company/the-corra-club/posts/?feedView=all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 group touch-target"
              >
                <Linkedin className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-1/4 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </footer>
  );
}