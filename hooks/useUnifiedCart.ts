"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'

interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    images: Array<{
      id: string
      url: string
      altText?: string
      isPrimary: boolean
    }>
  }
  quantity: number
  price: number
  selectedRingSize: string | null
}

interface Cart {
  id?: string
  userId?: string
  items: CartItem[]
  total: number
  itemCount: number
  subtotal: number
  tax: number
  shipping: number
}

export function useUnifiedCart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authenticatedCart = useCart()
  const guestCart = useGuestCart()
  const [hasMerged, setHasMerged] = useState(false)
  const [isMerging, setIsMerging] = useState(false)

  // Check if we need to merge (guest has items and user just logged in)
  const needsMerge = isAuthenticated && !hasMerged && guestCart.cart.items.length > 0

  // Merge guest cart when user logs in with retry logic for session sync
  useEffect(() => {
    const mergeGuestCart = async (retryCount = 0) => {
      const MAX_RETRIES = 3
      const RETRY_DELAY = 500 // ms

      if (isAuthenticated && !hasMerged && !isMerging && guestCart.cart.items.length > 0) {
        try {
          setIsMerging(true)
          const guestCartData = guestCart.getCartForMerge()
          await authenticatedCart.mergeCart(guestCartData)
          guestCart.clearCart()
          setHasMerged(true)
        } catch (error: any) {
          console.error('Error merging guest cart:', error)

          // If unauthorized and we have retries left, wait and try again
          // This handles the case where session isn't fully synced yet
          if (error?.message?.includes('Unauthorized') && retryCount < MAX_RETRIES) {
            console.log(`Retrying cart merge in ${RETRY_DELAY}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`)
            setIsMerging(false)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            return mergeGuestCart(retryCount + 1)
          }
        } finally {
          setIsMerging(false)
        }
      }
    }

    if (!authLoading) {
      // Add a small initial delay to allow session to sync
      const timer = setTimeout(() => {
        mergeGuestCart()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, hasMerged, isMerging, guestCart, authenticatedCart, authLoading])

  // Reset merge flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasMerged(false)
      setIsMerging(false)
    }
  }, [isAuthenticated])

  // Get current cart (authenticated or guest) - memoized to trigger re-renders
  const currentCart = useMemo((): Cart => {
    if (isAuthenticated) {
      const authCart = authenticatedCart.cart
      if (!authCart || !authCart.items) {
        return {
          items: [],
          total: 0,
          itemCount: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0
        }
      }
      return authCart
    } else {
      const gCart = guestCart.cart
      return {
        items: Array.isArray(gCart?.items) ? gCart.items : [],
        total: gCart?.total || 0,
        itemCount: gCart?.itemCount || 0,
        subtotal: gCart?.total || 0,
        tax: 0,
        shipping: 0
      }
    }
  }, [isAuthenticated, authenticatedCart.cart, guestCart.cart])

  // Add to cart (works for both guest and authenticated)
  const addToCart = useCallback(async (productId: string, quantity: number = 1, selectedRingSize: string = "") => {
    if (isAuthenticated) {
      return await authenticatedCart.addToCart(productId, quantity, selectedRingSize)
    } else {
      return await guestCart.addToCart(productId, quantity, selectedRingSize)
    }
  }, [isAuthenticated, authenticatedCart, guestCart])

  // Update cart item (works for both guest and authenticated)
  const updateCartItem = useCallback(async (productId: string, quantity: number, selectedRingSize: string = "") => {
    if (isAuthenticated) {
      return await authenticatedCart.updateCartItem(productId, quantity, selectedRingSize)
    } else {
      guestCart.updateCartItem(productId, quantity, selectedRingSize)
    }
  }, [isAuthenticated, authenticatedCart, guestCart])

  // Remove from cart (works for both guest and authenticated)
  const removeFromCart = useCallback(async (productId: string, selectedRingSize: string = "") => {
    if (isAuthenticated) {
      return await authenticatedCart.removeFromCart(productId, selectedRingSize)
    } else {
      guestCart.removeFromCart(productId, selectedRingSize)
    }
  }, [isAuthenticated, authenticatedCart, guestCart])

  // Clear cart (works for both guest and authenticated)
  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      // For authenticated users, we might want to clear the server cart
      // This would require an API endpoint
      console.log('Clear authenticated cart not implemented')
    } else {
      guestCart.clearCart()
    }
  }, [isAuthenticated, guestCart])

  return {
    cart: currentCart,
    loading: isAuthenticated ? authenticatedCart.loading : guestCart.loading,
    error: isAuthenticated ? authenticatedCart.error : null,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch: isAuthenticated ? authenticatedCart.refetch : () => { },
    clearError: isAuthenticated ? authenticatedCart.clearError : () => { },
    isAuthenticated,
    hasMerged,
    isMerging,
    needsMerge,
    debugCart: isAuthenticated ? () => { } : guestCart.debugCart
  }
}
