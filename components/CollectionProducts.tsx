"use client";

import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useMemo } from "react";

interface CollectionProductsProps {
  searchQuery: string;
  title?: string;
  filterMenOnly?: boolean;
  filterWomenOnly?: boolean;
}

export default function CollectionProducts({ searchQuery, title = "Products", filterMenOnly = false, filterWomenOnly = false }: CollectionProductsProps) {
  // Always fetch all products when we need to filter by gender, then filter client-side
  const shouldFetchAll = filterMenOnly || filterWomenOnly || searchQuery.toLowerCase().includes("pendant");
  
  const { products, loading, error } = useProducts({
    search: shouldFetchAll ? "" : searchQuery, // Empty search gets all products
    limit: 200, // Get more products to filter
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Filter for men's or women's products if needed
  const filteredProducts = useMemo(() => {
    // First, filter by search query if we fetched all products
    let searchFiltered = products;
    if (shouldFetchAll && searchQuery) {
      const searchKeywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
      searchFiltered = products.filter(product => {
        const nameLower = product.name.toLowerCase();
        const descLower = (product.description || "").toLowerCase();
        const shortDescLower = (product.shortDescription || "").toLowerCase();
        const categoryLower = (product.category?.name || "").toLowerCase();
        const fullText = `${nameLower} ${descLower} ${shortDescLower} ${categoryLower}`;
        
        // Match all keywords as whole words or starting/ending with non-alphanumeric
        return searchKeywords.every(keyword => {
          // Special case: if searching for "ring", exclude "earring"
          if (keyword === "ring" && fullText.includes("earring")) {
            // Only match if "ring" exists NOT as part of "earring"
            const ringRegex = /\bring\b/i;
            return ringRegex.test(fullText);
          }
          const regex = new RegExp(`\\b${keyword}\\b`, "i");
          return regex.test(fullText);
        });
      });
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('CollectionProducts Debug:', {
        totalProducts: products.length,
        searchFiltered: searchFiltered.length,
        searchQuery,
        filterMenOnly,
        filterWomenOnly
      });
    }
    
    if (!filterMenOnly && !filterWomenOnly) return searchFiltered;
    
    const menKeywords = ["men", "mens", "male", "man", "for men", "gents", "gent", "boys"];
    const womenKeywords = ["women", "womens", "female", "lady", "ladies", "for her", "her", "girls"];
    
    return searchFiltered.filter(product => {
      const nameLower = product.name.toLowerCase();
      const descLower = (product.description || "").toLowerCase();
      const shortDescLower = (product.shortDescription || "").toLowerCase();
      const categoryLower = (product.category?.name || "").toLowerCase();
      const fullText = `${nameLower} ${descLower} ${shortDescLower} ${categoryLower}`;
      
      const hasKeyword = (keywords: string[]) => {
        return keywords.some(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, "i");
          return regex.test(fullText);
        });
      };

      if (filterMenOnly) {
        // Exclude products that clearly have women keywords
        const hasWomen = hasKeyword(womenKeywords);
        if (hasWomen) return false;
        
        // Include if has men keywords
        const hasMen = hasKeyword(menKeywords);
        if (hasMen) return true;
        
        // Secondary check: if searching for something typically masculine 
        // and product matches that without having feminine keywords
        const isTypicallyMasculineSearch = 
          searchQuery.toLowerCase().includes("cuban") || 
          searchQuery.toLowerCase().includes("chain") ||
          (searchQuery.toLowerCase().includes("ring") && !fullText.includes("earring"));
        
        return isTypicallyMasculineSearch && !hasWomen;
      }
      
      if (filterWomenOnly) {
        // Exclude products that clearly have men keywords
        const hasMen = hasKeyword(menKeywords);
        if (hasMen) return false;
        
        // Include if has women keywords
        const hasWomen = hasKeyword(womenKeywords);
        if (hasWomen) return true;
        
        // If it doesn't have men keywords, we generally allow it in the women's collection
        // for jewelry categories.
        return !hasMen;
      }
      
      return true;
    });
  }, [products, filterMenOnly, filterWomenOnly, searchQuery, shouldFetchAll]);

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-2xl light-shadow px-4">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">😔</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error loading products</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-2xl light-shadow px-4">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">We couldn't find any products matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
