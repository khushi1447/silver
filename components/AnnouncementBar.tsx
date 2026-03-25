"use client"

import { useState, useEffect } from "react"

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed")
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem("announcement-dismissed", "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white text-sm py-2.5 px-4 text-center z-50">
      <span className="font-medium">
        Sale On Now — Free Shipping on All Orders Above ₹1,499!
      </span>
      <span className="mx-2 opacity-60">|</span>
      <a href="/shop" className="underline underline-offset-2 font-semibold hover:text-pink-200 transition-colors">
        Shop Now
      </a>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
