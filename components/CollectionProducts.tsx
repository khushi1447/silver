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
      const searchLower = searchQuery.toLowerCase();
      searchFiltered = products.filter(product => {
        const nameLower = product.name.toLowerCase();
        const descLower = (product.description || "").toLowerCase();
        const shortDescLower = (product.shortDescription || "").toLowerCase();
        const categoryLower = (product.category?.name || "").toLowerCase();
        return nameLower.includes(searchLower) || 
               descLower.includes(searchLower) || 
               shortDescLower.includes(searchLower) ||
               categoryLower.includes(searchLower);
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
    
    const menKeywords = ["men", "mens", "male", "man", "for men", "men's", "mens'"];
    const womenKeywords = ["women", "womens", "female", "lady", "ladies", "for her", "women's", "womens'", "her"];
    
    return searchFiltered.filter(product => {
      const nameLower = product.name.toLowerCase();
      const descLower = (product.description || "").toLowerCase();
      const shortDescLower = (product.shortDescription || "").toLowerCase();
      const fullText = `${nameLower} ${descLower} ${shortDescLower}`;
      
      if (filterMenOnly) {
        // Exclude products that clearly have women keywords
        const hasWomenKeyword = womenKeywords.some(keyword => fullText.includes(keyword));
        if (hasWomenKeyword) return false;
        
        // Include if has men keywords, or if it's a cuban/chain product (likely for men if no women keywords)
        const hasMenKeyword = menKeywords.some(keyword => fullText.includes(keyword));
        return hasMenKeyword || (searchQuery.toLowerCase().includes("cuban") && !hasWomenKeyword);
      }
      
      if (filterWomenOnly) {
        // Simple check: if product has "women" or "womens" in name/description and has "pendant" in name/description
        // This is more lenient for pendant products
        const hasPendant = nameLower.includes("pendant") || nameLower.includes("pendants") ||
                          descLower.includes("pendant") || descLower.includes("pendants") ||
                          shortDescLower.includes("pendant") || shortDescLower.includes("pendants");
        const hasWomen = nameLower.includes("women") || nameLower.includes("womens") ||
                        descLower.includes("women") || descLower.includes("womens") ||
                        shortDescLower.includes("women") || shortDescLower.includes("womens");
        
        // If it's a pendant product with women keywords, include it
        if (hasPendant && hasWomen) return true;
        
        // Exclude products that clearly have men keywords
        const hasMenKeyword = menKeywords.some(keyword => fullText.includes(keyword));
        if (hasMenKeyword) return false;
        
        // Include if has women keywords (any product with women keywords)
        const hasWomenKeyword = womenKeywords.some(keyword => fullText.includes(keyword));
        if (hasWomenKeyword) return true;
        
        // If searching for pendant/pendants, include all pendant products without men keywords
        // Also check category name
        const categoryLower = (product.category?.name || "").toLowerCase();
        const isPendantProduct = (searchQuery.toLowerCase().includes("pendant") || categoryLower.includes("pendant")) && 
                                 (hasPendant || categoryLower.includes("pendant") || categoryLower.includes("pendants"));
        return isPendantProduct;
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
