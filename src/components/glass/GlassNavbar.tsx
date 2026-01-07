"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/contexts/CartContext"
import { useState, useEffect } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/visit-us", label: "Visit Us" },
]

export function GlassNavbar() {
  const { cartCount, isLoading } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Debounced toggle with transition lock
  const handleToggleMenu = () => {
    if (isTransitioning) return // Prevent spam clicks
    
    setIsTransitioning(true)
    setIsMenuOpen(!isMenuOpen)
    
    // Unlock after transition completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300) // Match transition duration
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setIsTransitioning(false)
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 mx-auto mt-4 max-w-5xl px-4">
        <div className="rounded-full border border-white/20 bg-white/70 px-6 py-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50 will-change-transform">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center touch-manipulation"
              aria-label="Home"
            >
              <Image 
                src="/ATELIER-LOGO.svg" 
                alt="Atelier Kaira Logo" 
                width={140}
                height={28}
                className="h-8 w-auto"
                priority
              />
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors duration-200 text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white touch-manipulation"
                >
                  {link.label}
                </Link>
              ))}

              <Link href="/cart" className="touch-manipulation">
                <button 
                  className="relative rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-4 w-4 text-white" />
                  {!isLoading && cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <Link href="/cart" className="touch-manipulation">
                <button 
                  className="relative rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 shadow-lg active:scale-95 transition-transform"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-4 w-4 text-white" />
                  {!isLoading && cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              <button
                onClick={handleToggleMenu}
                disabled={isTransitioning}
                aria-label="Toggle menu"
                className="flex flex-col items-center justify-center gap-1.5 p-2 touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
              >
                <span
                  className={`h-0.5 w-5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-out will-change-transform ${
                    isMenuOpen ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-out ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-5 rounded-full bg-black dark:bg-white transition-all duration-300 ease-out will-change-transform ${
                    isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop with hardware acceleration */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden will-change-auto ${
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleToggleMenu}
        style={{ WebkitBackfaceVisibility: 'hidden' }}
      />

      {/* Slide menu with hardware acceleration */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-64 border-l border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-black/90 md:hidden will-change-transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)'
        }}
      >
        <div className="flex h-full flex-col px-6 py-20 overflow-y-auto overscroll-contain">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="border-b border-black/10 py-4 text-base font-medium transition-all duration-200 hover:translate-x-1 dark:border-white/10 text-black/70 dark:text-white/70 touch-manipulation"
              style={{ 
                transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}