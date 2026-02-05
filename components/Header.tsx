"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShoppingBag, Menu, X, Search, Heart, LogOut, User, ChevronDown, ChevronRight } from "lucide-react";
import { useUnifiedCart } from "@/hooks/useUnifiedCart";
import { useUnifiedWishlist } from "@/hooks/useUnifiedWishlist";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionHovered, setIsCollectionHovered] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { cart } = useUnifiedCart();
  const { isAuthenticated } = useAuth();
  const { count: wishlistCount } = useUnifiedWishlist();

  // Debug: Log cart state changes
  console.log('Header render - cart items:', cart?.items?.length || 0);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Collection", href: "#", hasDropdown: true },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const collectionMenu = {
    categories: [
      {
        name: "Chains",
        items: [
          { name: "Silver Cuban chains for men", href: "/collection/silver-cuban-chains-for-men" },
        ],
      },
      {
        name: "Pendants",
        items: [
          { name: "Silver pendants for women in Ahmedabad", href: "/collection/silver-pendants-women-ahmedabad" },
          { name: "Delicate silver pendant necklace", href: "/collection/delicate-silver-pendant-necklaces" },
        ],
      },
      {
        name: "Necklaces",
        items: [
          { name: "Best silver necklace for womens", href: "/collection/best-silver-necklaces-women" },
        ],
      },
      {
        name: "Bracelets",
        items: [
          { name: "Best mens sterling silver bracelet", href: "/collection/mens-sterling-silver-bracelets" },
          { name: "Best womens sterling silver bracelet", href: "/collection/womens-sterling-silver-bracelets" },
        ],
      },
      {
        name: "Rings",
        subcategories: [
          {
            name: "Men's Rings",
            items: [
              { name: "Best silver rings for men", href: "/collection/silver-rings-men" },
            ],
          },
          {
            name: "Women's Rings",
            items: [
              { name: "Best silver rings for women", href: "/collection/silver-rings-women" },
              { name: "Unique sterling rings for women", href: "/collection/unique-sterling-rings-women" },
            ],
          },
          {
            name: "Special/Theme Rings",
            items: [
              { name: "Silver infinity ring price", href: "/collection/silver-infinity-rings" },
            ],
          },
        ],
      },
    ],
  };
 

  // Sort categories alphabetically
  const sortedCategories = [...collectionMenu.categories].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 light-shadow">
   
      <meta name="google-site-verification" content="GNfOsLKh6Bcx3vSJb6Fmn1bWDFfHCcHfCxne4mQW7Xs" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <img
              src="/images/Logo.jpeg"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              onError={(e) => {
                console.error("Logo failed to load:", e.currentTarget.src);
                e.currentTarget.src = "/images/logo.png";
              }}
            />

            <span className="font-playfair text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              Silver Line
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {navigation.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setIsCollectionHovered(true)}
                    onMouseLeave={() => setIsCollectionHovered(false)}
                  >
                    <span className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group text-sm xl:text-base whitespace-nowrap cursor-pointer flex items-center gap-1">
                      {item.name}
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                    </span>
                    
                    {/* Collection Dropdown */}
                    {isCollectionHovered && (
                      <div 
                        className={`absolute top-full left-0 mt-0 bg-white rounded-none shadow-xl border border-gray-100 p-4 sm:p-5 md:p-6 z-50 animate-in fade-in-0 zoom-in-95 ${
                          hoveredCategory 
                            ? 'w-[90vw] sm:w-[600px] max-w-[600px]' 
                            : 'w-[90vw] sm:w-auto min-w-[200px] max-w-[250px]'
                        }`}
                        onMouseEnter={() => setIsCollectionHovered(true)}
                        onMouseLeave={() => {
                          setIsCollectionHovered(false);
                          setHoveredCategory(null);
                        }}
                      >
                        <div className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
                          Categories
                        </div>
                        <div className={`flex flex-col ${hoveredCategory ? 'lg:flex-row' : ''} gap-4 lg:gap-6 relative`}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {/* Left Column - Categories */}
                          <div className={`flex flex-col gap-0 ${hoveredCategory ? 'w-full lg:w-auto lg:min-w-[200px]' : 'w-full'}`}>
                            {sortedCategories.map((category, idx) => {
                              // Check if category has direct items
                              const hasItems = category.items && category.items.length > 0;
                              
                              // Check if category has subcategories with items
                              const hasSubcategoriesWithItems = category.subcategories && 
                                category.subcategories.some(sub => sub.items && sub.items.length > 0);
                              
                              // Only show arrow and allow hover if there's actual content
                              const hasContent = hasItems || hasSubcategoriesWithItems;
                              const showItems = hoveredCategory === category.name;
                              
                              return (
                                <div 
                                  key={idx} 
                                  className="relative"
                                  onMouseEnter={() => {
                                    if (hasContent) {
                                      setHoveredCategory(category.name);
                                    }
                                  }}
                                >
                                  <h3 className={`font-semibold text-xs sm:text-sm flex items-center justify-between gap-2 group/category cursor-pointer transition-colors py-2 px-2 ${
                                    showItems ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                  }`}>
                                    <span>{category.name}</span>
                                    {hasContent && (
                                      <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                                        showItems ? 'text-purple-600' : 'text-gray-400 group-hover/category:text-purple-600'
                                      }`} />
                                    )}
                                  </h3>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Right Column - Sub-items - Only show when there's content */}
                          {hoveredCategory && (() => {
                            const category = sortedCategories.find(cat => cat.name === hoveredCategory);
                            if (!category) return null;
                            
                            // Check if category has direct items
                            const hasItems = category.items && category.items.length > 0;
                            
                            // Check if category has subcategories with items
                            const hasSubcategoriesWithItems = category.subcategories && 
                              category.subcategories.some(sub => sub.items && sub.items.length > 0);
                            
                            // Only render if there's actual content
                            if (!hasItems && !hasSubcategoriesWithItems) return null;
                            
                            // Filter out empty subcategories
                            const validSubcategories = category.subcategories?.filter(
                              sub => sub.items && sub.items.length > 0
                            ) || [];
                            
                            return (
                              <div className="flex-1 w-full lg:w-auto lg:min-w-[250px] border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6"
                                onMouseEnter={() => setHoveredCategory(category.name)}
                              >
                                {validSubcategories.length > 0 ? (
                                  <div className="space-y-3 sm:space-y-4">
                                    {validSubcategories.map((subcategory, subIdx) => (
                                      <div key={subIdx} className="mb-3 sm:mb-4 last:mb-0">
                                        <h4 className="font-medium text-black text-xs mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-gray-200">{subcategory.name}</h4>
                                        <div className="space-y-1 sm:space-y-2">
                                          {subcategory.items.map((subItem, itemIdx) => (
                                            <Link
                                              key={itemIdx}
                                              href={subItem.href}
                                              className="block text-xs text-gray-700 hover:text-purple-600 transition-colors py-1"
                                              onClick={() => {
                                                setIsCollectionHovered(false);
                                                setHoveredCategory(null);
                                              }}
                                            >
                                              {subItem.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : hasItems ? (
                                  <div className="space-y-1 sm:space-y-2">
                                    {category.items.map((subItem, itemIdx) => (
                                      <Link
                                        key={itemIdx}
                                        href={subItem.href}
                                        className="block text-xs text-gray-700 hover:text-purple-600 transition-colors py-1"
                                        onClick={() => {
                                          setIsCollectionHovered(false);
                                          setHoveredCategory(null);
                                        }}
                                      >
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group text-sm xl:text-base whitespace-nowrap flex items-center"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              );
            })}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-sm bg-white shadow-sm w-40 lg:w-48 xl:w-64"
              />
            </form>

            {/* Mobile Search Icon */}
            <button
              className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist - Desktop only */}
            <Link
              href="/wishlist"
              className="hidden md:flex relative p-2 text-gray-700 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-full"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-gentle light-shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart - Show on all screens */}
            <Link
              href="/cart"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-full"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cart && cart.items && cart.items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-bounce-gentle light-shadow">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {/* Auth button - Login or Logout - Desktop only */}
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/");
                }}
                className="hidden md:flex p-2 text-gray-700 hover:text-red-600 transition-colors hover:bg-red-50 rounded-full"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex p-2 text-gray-700 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-full"
                title="Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-gray-100 animate-slide-up bg-white/95 backdrop-blur-sm">
            <form onSubmit={handleSearch} className="px-3 sm:px-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-sm bg-white shadow-sm"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-gray-100 animate-slide-up bg-white/95 backdrop-blur-sm rounded-b-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col space-y-2 sm:space-y-3">
              {/* Mobile Wishlist and User Icons */}
              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 pb-3 sm:pb-4 border-b border-gray-100">
                <Link
                  href="/wishlist"
                  className="relative flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium px-2 sm:px-3 py-2 hover:bg-purple-50 rounded-lg text-sm sm:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center light-shadow">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="text-black font-medium px-3 sm:px-4 py-2 text-sm sm:text-base">
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-1 border-l-2 border-purple-200">
                        {collectionMenu.categories.map((category, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="text-black font-semibold text-xs px-3 py-1">{category.name}</div>
                            {category.subcategories ? (
                              category.subcategories.map((subcategory, subIdx) => (
                                <div key={subIdx} className="pl-2 space-y-0.5">
                                  <div className="text-black font-medium text-xs px-3 py-0.5">{subcategory.name}</div>
                                  {subcategory.items.map((subItem, itemIdx) => (
                                    <Link
                                      key={itemIdx}
                                      href={subItem.href}
                                      className="block text-black hover:text-purple-600 transition-colors text-xs px-6 py-1"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      • {subItem.name}
                                    </Link>
                                  ))}
                                </div>
                              ))
                            ) : (
                              category.items.map((subItem, itemIdx) => (
                                <Link
                                  key={itemIdx}
                                  href={subItem.href}
                                  className="block text-black hover:text-purple-600 transition-colors text-xs px-6 py-1"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  • {subItem.name}
                                </Link>
                              ))
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium px-3 sm:px-4 py-2 hover:bg-purple-50 rounded-lg text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Auth button */}
              <div className="border-t border-gray-100 pt-3 sm:pt-4 mt-2">
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await signOut({ redirect: false });
                      router.push("/");
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium px-3 sm:px-4 py-2 hover:bg-red-50 rounded-lg w-full text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors duration-200 font-medium px-3 sm:px-4 py-2 hover:bg-purple-50 rounded-lg text-sm sm:text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
