"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoadingSplash } from "@/components/ui/loading-splash";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Keep track of whether this is the first load of the app
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { status } = useSession();
  
  useEffect(() => {
    // Check if this is the first load of the app
    const hasLoadedBefore = sessionStorage.getItem("app_initialized");
    
    if (hasLoadedBefore) {
      // If the app has been loaded before in this session, don't show the splash screen
      setIsLoading(false);
      setIsFirstLoad(false);
    } else {
      // If this is the first load, show the splash screen and set a minimum duration
      const timer = setTimeout(() => {
        // Only hide loading if session is ready
        if (status !== "loading") {
          setIsLoading(false);
          // Mark that the app has been initialized
          sessionStorage.setItem("app_initialized", "true");
        }
      }, 3000); // Show loading for at least 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [status]); // Add status as dependency
  
  // Additional effect to handle session loading state changes
  useEffect(() => {
    if (status !== "loading" && !isFirstLoad) {
      setIsLoading(false);
    }
  }, [status, isFirstLoad]);
  
  return (
    <>
      {(isFirstLoad || status === "loading") && (
        <LoadingSplash 
          show={isLoading || status === "loading"} 
          onAnimationComplete={() => setIsFirstLoad(false)}
        />
      )}
      {(!isLoading && status !== "loading") && children}
    </>
  );
} 