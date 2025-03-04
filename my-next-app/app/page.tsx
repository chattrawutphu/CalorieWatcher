"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function RootPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // This is a client-side redirect as backup
    // The middleware should handle most cases, but this is a fallback
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // Show a loader while checking authentication
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear" 
            }}
            className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600"
          />
        </div>
        <h2 className="text-xl font-medium text-purple-800">CalorieWatcher</h2>
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </motion.div>
    </div>
  );
}
