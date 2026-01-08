"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Loader2, PackageSearch } from "lucide-react"
import { useUnifiedCart } from "@/hooks/useUnifiedCart"
import { useAuth } from "@/hooks/useAuth"

export default function CartContent() {
  const MAX_QUANTITY = 9;
  const { isAuthenticated } = useAuth()
  const { cart, loading, error, updateCartItem, removeFromCart, debugCart } = useUnifiedCart()

  // Expose debug function globally for testing
  if (typeof window !== 'undefined') {
    (window as any).debugGuestCart = debugCart
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
    } else {
      // Limit quantity to MAX_QUANTITY
      const limitedQuantity = Math.min(quantity, MAX_QUANTITY);
      await updateCartItem(productId, limitedQuantity)
    }
  }

  const removeItem = async (productId: string) => {
    await removeFromCart(productId)
  }


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading cart</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link 
            href="/track" 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300 font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            <PackageSearch className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Track Your Order</span>
            <span className="sm:hidden">Track Order</span>
          </Link>
        </div>
        <div className="text-center animate-fade-in">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">Discover our beautiful jewelry collection</p>
          <Link href="/shop" className="inline-block bg-gray-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const shipping = cart.total > 500 ? 0 : 25
  const total = cart.total + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link 
            href="/track" 
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300 font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            <PackageSearch className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Track Your Order</span>
            <span className="sm:hidden">Track Order</span>
          </Link>
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Guest Mode:</strong> Your cart is saved locally.
                <Link href="/login" className="text-blue-600 hover:text-blue-800 underline ml-1">
                  Sign in
                </Link> to save permanently and access from any device.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cart.items.map((item) => (
            <div key={`cart-item-${item.productId}`} className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Link href={`/product/${item.productId}`} className="flex-shrink-0 w-full sm:w-auto">
                  <Image
                    src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0]?.url || "/placeholder.svg"}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover hover:opacity-75 transition-opacity w-full sm:w-20 sm:h-20"
                  />
                </Link>

                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 sm:truncate">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>
                  {item.quantity >= MAX_QUANTITY && (
                    <p className="text-xs text-amber-600 mt-1">Max quantity reached</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900 text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= MAX_QUANTITY}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-sm h-fit animate-slide-up">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4 sm:mb-5">
            <div className="flex justify-between text-sm sm:text-base">
              <span>Subtotal</span>
              <span>₹{cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <Link
              href="/checkout"
              className="w-full bg-gray-900 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-800 transition-colors text-center block text-sm sm:text-base"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <Link
                href="/login?callbackUrl=/checkout"
                className="w-full bg-purple-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-purple-700 transition-colors text-center block text-sm sm:text-base"
              >
                Sign In to Checkout
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Guest checkout coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
