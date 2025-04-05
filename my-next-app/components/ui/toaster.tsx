"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useRef, useState } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const swipeStartRef = useRef<{ x: number, y: number } | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"up" | "left" | "right" | null>(null)
  const [swipingToastId, setSwipingToastId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 })
  
  const handleSwipeStart = (e: React.PointerEvent, id: string) => {
    swipeStartRef.current = { x: e.clientX, y: e.clientY }
    setSwipingToastId(id)
    setSwipeOffset({ x: 0, y: 0 })
  }
  
  const handleSwipeMove = (e: React.PointerEvent) => {
    if (!swipeStartRef.current || !swipingToastId) return
    
    const { x: startX, y: startY } = swipeStartRef.current
    const currentX = e.clientX
    const currentY = e.clientY
    
    const deltaX = currentX - startX
    const deltaY = startY - currentY // Inverted so upward swipe is positive
    
    const threshold = 20 // Minimum distance to determine direction
    
    // Update swipe offset for animation
    setSwipeOffset({ x: deltaX, y: -deltaY })
    
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > threshold) {
      setSwipeDirection("up")
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      setSwipeDirection(deltaX > 0 ? "right" : "left")
    }
  }
  
  const handleSwipeEnd = (e: React.PointerEvent, id: string) => {
    if (!swipeStartRef.current) return
    
    const { x: startX, y: startY } = swipeStartRef.current
    const endX = e.clientX
    const endY = e.clientY
    
    const deltaX = endX - startX
    const deltaY = startY - endY // Inverted so upward swipe is positive
    
    const threshold = 50 // Minimum distance to consider it a swipe
    
    let shouldDismiss = false
    
    // If it's a significant vertical upward swipe
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > threshold) {
      shouldDismiss = true
      // Keep the up direction for animation
      setSwipeDirection("up")
    } 
    // If it's a significant horizontal swipe
    else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      shouldDismiss = true
      // Keep the left/right direction for animation
      setSwipeDirection(deltaX > 0 ? "right" : "left")
    }
    
    if (shouldDismiss) {
      // Let the animation complete before dismissing
      setTimeout(() => {
        dismiss(id)
        setSwipeDirection(null)
        setSwipingToastId(null)
        setSwipeOffset({ x: 0, y: 0 })
      }, 200)
    } else {
      // Reset if not dismissing
      setSwipeDirection(null)
      setSwipingToastId(null)
      setSwipeOffset({ x: 0, y: 0 })
    }
    
    swipeStartRef.current = null
  }

  const getSwipeStyle = (id: string) => {
    if (id !== swipingToastId) return {}
    
    // Apply transform based on swipe direction and offset
    if (swipeDirection === "up") {
      return { 
        transform: `translateY(${swipeOffset.y}px)`,
        transition: swipeOffset.y < -50 ? 'transform 0.2s ease-out' : 'none'
      }
    } else if (swipeDirection === "left") {
      return { 
        transform: `translateX(${swipeOffset.x}px)`,
        transition: swipeOffset.x < -50 ? 'transform 0.2s ease-out' : 'none'
      }
    } else if (swipeDirection === "right") {
      return { 
        transform: `translateX(${swipeOffset.x}px)`,
        transition: swipeOffset.x > 50 ? 'transform 0.2s ease-out' : 'none'
      }
    }
    
    return {}
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            onPointerDown={(e) => handleSwipeStart(e, id)}
            onPointerMove={handleSwipeMove}
            onPointerUp={(e) => handleSwipeEnd(e, id)}
            style={getSwipeStyle(id)}
            className={`${props.className || ""}`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 