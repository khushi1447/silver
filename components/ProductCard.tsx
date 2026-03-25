"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { type ApiProduct } from "@/types/api";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: ApiProduct;
}

export default function ProductCard({ product }: ProductCardProps) {

  return (
    <div className="group bg-white rounded-2xl light-shadow hover:light-shadow-lg transition-all duration-500 overflow-hidden animate-fade-in border border-gray-100 hover:border-purple-200">
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-gray-200 aspect-square">
          <Image
            src={product.images?.[0]?.url || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <WishlistButton
              productId={product.id}
              className="p-3 bg-white/95 backdrop-blur-sm rounded-full light-shadow hover:bg-white transition-colors hover:scale-110 transform duration-200"
              size="sm"
            />
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/80 to-pink-400/80 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-semibold text-lg drop-shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block truncate">
            {product.description.length > 50
              ? product.description.slice(0, 50) + "…"
              : product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-1">
          <span className="text-base sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ₹{product.price}
          </span>
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            disabled={product.stock === 0}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed light-shadow hover:light-shadow-lg transform hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
