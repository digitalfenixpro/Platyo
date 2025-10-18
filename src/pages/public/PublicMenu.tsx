import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Gift, Star, X, ChevronLeft, ChevronRight, Grid3x3, List, Clock, MapPin, Facebook, Instagram, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';
import LeftBlob from './LeftBlob';

export const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items: cartItems } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'editorial'>('list');
  const [showHoursModal, setShowHoursModal] = useState(false);

  const loadMenuData = () => {
    try {
      setLoading(true);
      setError(null);

      const restaurants = loadFromStorage('restaurants', []);
      const restaurantData = restaurants.find((r: Restaurant) => r.slug === slug || r.id === slug || r.domain === slug);

      if (!restaurantData) {
        setError(`Restaurante no encontrado: ${slug}`);
        setLoading(false);
        return;
      }

      const subscriptions = loadFromStorage('subscriptions', []);
      const subscription = subscriptions.find((s: Subscription) => s.restaurant_id === restaurantData.id);

      if (!subscription || subscription.status !== 'active') {
        setError('Este restaurante no está disponible en este momento. Suscripción inactiva o vencida.');
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      const allCategories = loadFromStorage('categories', []);
      const allProducts = loadFromStorage('products', []);

      const restaurantCategories = allCategories.filter((cat: Category) =>
        cat.restaurant_id === restaurantData.id && cat.active
      );

      const restaurantProducts = allProducts.filter((prod: Product) =>
        prod.restaurant_id === restaurantData.id && prod.status === 'active'
      );

      setCategories(restaurantCategories);
      setProducts(restaurantProducts);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el menú');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadMenuData();
    } else {
      setError('No se proporcionó un identificador de restaurante');
      setLoading(false);
    }
  }, [slug]);

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      if (!matchesCategory) return false;

      if (searchTerm === '') return true;

      const searchLower = searchTerm.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const getFeaturedProducts = () => {
    if (!restaurant?.settings.promo?.featured_product_ids?.length) {
      return products.filter(p => p.is_featured).slice(0, 5);
    }

    const featuredIds = restaurant.settings.promo.featured_product_ids;
    return products
      .filter(p => featuredIds.includes(p.id))
      .slice(0, 5);
  };

  const featuredProducts = getFeaturedProducts();
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const nextSlide = () => {
    setFeaturedSlideIndex((prev) => (prev + 1) % Math.max(1, featuredProducts.length));
  };

  const prevSlide = () => {
    setFeaturedSlideIndex((prev) => (prev - 1 + featuredProducts.length) % Math.max(1, featuredProducts.length));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurante no encontrado</h2>
          <p className="text-gray-600 mb-4">{error || 'El menú que buscas no está disponible.'}</p>
        </div>
      </div>
    );
  }

  const theme = restaurant.settings.theme;
  const primaryColor = theme.primary_color || '#FFC700';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const accentColor = theme.accent_color || '#FFC700';
  const textColor = theme.text_color || '#1f2937';
  const hasPromo = restaurant.settings.promo?.enabled && restaurant.settings.promo?.vertical_promo_image;

  return (
    <div
      className="min-h-screen bg-gray-50 relative overflow-hidden"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--primary-font': theme.primary_font || 'Inter',
        '--secondary-font': theme.secondary_font || 'Poppins',
      } as React.CSSProperties}
    >
      {/* DECORATIVE ORGANIC SHAPES - MATCHING REFERENCE */}
      <svg
        className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          opacity: 0.8, // equivalente a opacity-80
          transform: 'translate(-20%, -20%)',
          borderBottomRightRadius: '50% 40%',
          borderTopRightRadius: '0% 0%',
        }}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M-72.9467 0.727783C-69.5626 0.661947 -66.0607 1.2489 -62.4412 2.48863C-58.8854 3.66209 -55.2414 5.32512 -51.5091 7.47777C-47.7767 9.63043 -43.9856 12.1095 -40.1355 14.9149C-36.2217 17.7866 -32.2784 20.8215 -28.3057 24.0196C-24.2692 27.284 -20.2021 30.6465 -16.1043 34.1072C-12.0064 37.5679 -7.84111 40.8998 -3.60828 44.1028C0.62207 47.4359 4.85611 50.5739 9.09387 53.5168C13.4617 56.4622 17.8357 59.0824 22.2159 61.3775C26.5961 63.6726 30.9824 65.6425 35.3749 67.2872C39.7674 68.932 44.1968 70.3497 48.663 71.5405C52.9992 72.7287 57.3059 73.7538 61.5832 74.6157C65.8604 75.4776 70.042 76.2401 74.1279 76.9032C78.2776 77.6326 82.2653 78.3263 86.0911 78.9845C89.9807 79.7089 93.6739 80.4946 97.1708 81.3417C100.798 82.1913 104.194 83.1991 107.36 84.3651C110.525 85.5312 113.491 86.9536 116.256 88.6325C119.022 90.3114 121.555 92.2136 123.857 94.3391C126.092 96.5284 128.128 98.9741 129.963 101.676C131.734 104.312 133.307 107.139 134.681 110.158C135.989 113.24 137.099 116.449 138.011 119.784C138.921 123.25 139.602 126.808 140.053 130.46C140.506 133.981 140.762 137.629 140.821 141.403C140.813 145.242 140.642 149.109 140.308 153.006C139.91 156.837 139.348 160.697 138.624 164.587C137.836 168.41 136.884 172.263 135.77 176.145C134.591 179.961 133.316 183.742 131.944 187.489C130.505 191.3 129.002 195.11 127.433 198.918C125.798 202.791 124.163 206.663 122.528 210.535C120.894 214.407 119.258 218.345 117.62 222.347C116.049 226.286 114.509 230.322 112.999 234.457C111.619 238.595 110.335 242.831 109.147 247.167C107.895 251.437 106.867 255.874 106.064 260.478C105.261 265.081 104.684 269.787 104.333 274.594C103.979 279.532 103.818 284.538 103.852 289.613C103.886 294.688 104.048 299.83 104.34 305.04C104.631 310.25 104.955 315.493 105.31 320.77C105.665 326.046 105.988 331.289 106.28 336.499C106.571 341.709 106.735 346.786 106.771 351.731C106.805 356.806 106.614 361.714 106.199 366.455C105.783 371.197 105.078 375.77 104.084 380.174C103.09 384.579 101.742 388.75 100.041 392.686C98.2758 396.556 96.1256 400.158 93.5901 403.493C91.0522 406.957 88.1634 410.058 84.9238 412.794C81.7479 415.596 78.285 418.1 74.5349 420.305C70.7849 422.511 66.8459 424.388 62.718 425.936C58.5902 427.484 54.4034 428.706 50.1578 429.601C45.7822 430.493 41.3158 431.027 36.7586 431.2C32.3315 431.376 27.9105 431.227 23.4958 430.753C19.0835 430.149 14.7424 429.221 10.4725 427.969C6.26895 426.653 2.20158 425.014 -1.72955 423.053C-5.6582 420.962 -9.45186 418.613 -13.1105 416.006C-16.8354 413.463 -20.4585 410.695 -23.9797 407.7C-27.5008 404.706 -30.9876 401.615 -34.4401 398.427C-37.8287 395.305 -41.2505 392.215 -44.7054 389.156C-48.0941 386.034 -51.5502 383.041 -55.0739 380.177C-58.5337 377.379 -62.0623 374.775 -65.6596 372.364C-69.3232 370.018 -73.0899 367.962 -76.9597 366.197C-80.832 364.562 -84.8417 363.315 -88.9889 362.456C-93.1361 361.596 -97.4209 361.125 -101.843 361.041C-106.201 361.023 -110.63 361.264 -115.128 361.764C-119.626 362.264 -124.128 362.96 -128.634 363.85C-133.074 364.676 -137.417 365.602 -141.665 366.627C-145.977 367.586 -150.093 368.484 -154.012 369.32C-157.934 370.287 -161.623 371.03 -165.081 371.55C-168.605 372.133 -171.831 372.43 -174.759 372.439C-177.62 372.385 -180.149 371.947 -182.345 371.124C-184.478 370.368 -186.245 369.196 -187.646 367.608C-189.044 365.89 -190.111 363.853 -190.847 361.497C-191.647 359.075 -192.214 356.365 -192.547 353.366C-192.814 350.303 -192.947 347.048 -192.947 343.6C-192.944 340.022 -192.874 336.315 -192.736 332.479C-192.532 328.58 -192.358 324.582 -192.215 320.487C-192.009 316.457 -191.898 312.328 -191.883 308.1C-191.934 303.935 -192.115 299.768 -192.426 295.599C-192.673 291.496 -193.182 287.453 -193.952 283.47C-194.656 279.423 -195.557 275.502 -196.656 271.708C-197.689 267.85 -198.821 264.088 -200.052 260.422C-201.281 256.625 -202.546 252.991 -203.846 249.518C-205.144 245.915 -206.378 242.379 -207.548 238.909C-208.718 235.439 -209.759 232.036 -210.672 228.701C-211.648 225.299 -212.366 221.968 -212.824 218.707C-213.346 215.379 -213.642 212.088 -213.71 208.834C-213.715 205.646 -213.394 202.464 -212.748 199.289C-212.036 196.05 -211.032 192.849 -209.736 189.685C-208.44 186.522 -206.85 183.332 -204.968 180.115C-203.083 176.768 -200.971 173.458 -198.631 170.185C-196.29 166.781 -193.784 163.283 -191.113 159.691C-188.443 156.098 -185.608 152.412 -182.609 148.63C-179.74 144.846 -176.737 140.87 -173.6 136.701C-170.529 132.596 -167.422 128.264 -164.278 123.704C-161.136 119.275 -157.989 114.586 -154.838 109.637C-151.816 104.685 -148.791 99.5377 -145.762 94.1956C-142.799 88.9173 -139.834 83.509 -136.867 77.9706C-133.902 72.5623 -130.968 67.1208 -128.067 61.6462C-125.168 56.3017 -122.272 51.0872 -119.378 46.0028C-116.484 40.9184 -113.562 36.0622 -110.611 31.4343C-107.664 26.9363 -104.69 22.7967 -101.691 19.0154C-98.6913 15.2341 -95.6369 11.9743 -92.5273 9.23599C-89.3539 6.56393 -86.1597 4.51031 -82.9448 3.07507C-79.6635 1.57606 -76.3308 0.793641 -72.9467 0.727783Z"
          fill={primaryColor}
        />
</svg>

      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-80 pointer-events-none"
        style={{
          background: primaryColor,
          borderTopLeftRadius: '60% 50%',
          borderBottomLeftRadius: '0% 0%',
          transform: 'translate(25%, 25%)',
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 relative bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setTimeout(() => {
                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-none bg-gray-50"
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                />
              </div>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 text-center">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-16 mx-auto"
                />
              ) : (
                <div
                  className="text-3xl font-bold"
                  style={{
                    color: primaryColor,
                    fontFamily: theme.secondary_font || 'Poppins'
                  }}
                >
                  {restaurant.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
              {hasPromo && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  <Gift className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="p-3 rounded-lg border border-gray-200 hover:opacity-90 transition-colors relative"
                style={{
                  backgroundColor: 'white',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED SECTION SLIDER */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 relative z-30">
          <div className="text-center mb-12">
            <p
              className="text-sm mb-2 opacity-70"
              style={{
                color: textColor,
                fontFamily: theme.primary_font || 'Inter'
              }}
            >
              Te presentamos nuestros
            </p>
            <h2
              className="text-5xl font-bold mb-2"
              style={{
                color: textColor,
                fontFamily: theme.secondary_font || 'Poppins'
              }}
            >
              destacados
            </h2>
            <div className="flex items-center justify-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: accentColor }} />
              ))}
            </div>
          </div>

          <div className="relative h-[450px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                {featuredProducts.map((product, index) => {
                  const offset = index - featuredSlideIndex;
                  const isCenter = offset === 0;
                  const isVisible = Math.abs(offset) <= 1;

                  if (!isVisible) return null;

                  return (
                    <div
                      key={product.id}
                      className="absolute cursor-pointer transition-all duration-700 ease-in-out"
                      style={{
                        transform: `translateX(${offset * 350}px) scale(${isCenter ? 1.2 : 0.75})`,
                        opacity: isCenter ? 1 : 0.4,
                        zIndex: isCenter ? 20 : 10 - Math.abs(offset),
                        pointerEvents: isCenter ? 'auto' : 'none',
                      }}
                      onClick={() => isCenter && setSelectedProduct(product)}
                    >
                      <div className="relative flex flex-col items-center">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-80 h-80 object-cover rounded-full shadow-2xl"
                        />
                        {isCenter && (
                          <div className="mt-6 bg-white rounded-lg shadow-xl px-8 py-4 max-w-xs">
                            <p
                              className="font-bold text-center text-lg"
                              style={{
                                color: textColor,
                                fontFamily: theme.secondary_font || 'Poppins'
                              }}
                            >
                              {product.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {featuredProducts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-20"
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem'
                  }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: textColor }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-20"
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem'
                  }}
                >
                  <ChevronRight className="w-6 h-6" style={{ color: textColor }} />
                </button>

                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedSlideIndex(index)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: index === featuredSlideIndex ? accentColor : '#d1d5db',
                        width: index === featuredSlideIndex ? '24px' : '8px',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* CATEGORIES TABS - CENTERED */}
      <div className="relative z-20" >
        <div className="max-w-7xl mx-auto px-4 py-4 relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
              style={{
                backgroundColor: selectedCategory === 'all' ? 'white' : 'transparent',
                color: selectedCategory === 'all' ? textColor : '#000',
                border: `2px solid ${selectedCategory === 'all' ? 'white' : 'transparent'}`,
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                fontFamily: theme.primary_font || 'Inter'
              }}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
                style={{
                  backgroundColor: selectedCategory === category.id ? 'white' : 'transparent',
                  color: selectedCategory === category.id ? textColor : '#000',
                  border: `2px solid ${selectedCategory === category.id ? 'white' : 'transparent'}`,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  fontFamily: theme.primary_font || 'Inter'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 relative z-10" id="products-section">
        {/* View Mode Selector */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <List className="w-5 h-5" style={{ color: viewMode === 'list' ? accentColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <Grid3x3 className="w-5 h-5" style={{ color: viewMode === 'grid' ? accentColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`p-2 px-4 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'editorial' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <span className="text-sm font-medium" style={{ color: viewMode === 'editorial' ? accentColor : textColor }}>Editorial</span>
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' :
            'space-y-6'
          }>
            {filteredProducts.map((product) => {
              const minPrice = product.variations.length > 0
                ? Math.min(...product.variations.map(v => v.price))
                : 0;

              if (viewMode === 'editorial') {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full md:w-64 h-64 object-cover rounded-lg flex-shrink-0"
                          style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3
                          className="font-bold mb-3 text-2xl"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            color: textColor
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          className="text-gray-600 mb-4 text-base leading-relaxed"
                          style={{ fontFamily: theme.primary_font || 'Inter' }}
                        >
                          {product.description}
                        </p>
                        <span
                          className="font-bold text-2xl"
                          style={{
                            color: accentColor,
                            fontFamily: theme.secondary_font || 'Poppins'
                          }}
                        >
                          Desde ${minPrice.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (viewMode === 'grid') {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3
                        className="font-bold mb-2 line-clamp-1"
                        style={{
                          fontSize: '16px',
                          fontFamily: theme.secondary_font || 'Poppins',
                          color: textColor
                        }}
                      >
                        {product.name}
                      </h3>
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: accentColor,
                          fontFamily: theme.secondary_font || 'Poppins'
                        }}
                      >
                        ${minPrice.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex items-center gap-4 p-4"
                  onClick={() => setSelectedProduct(product)}
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold mb-1 truncate"
                      style={{
                        fontSize: '18px',
                        fontFamily: theme.secondary_font || 'Poppins',
                        color: textColor
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-2 line-clamp-2"
                      style={{ fontFamily: theme.primary_font || 'Inter' }}
                    >
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: accentColor,
                          fontFamily: theme.secondary_font || 'Poppins'
                        }}
                      >
                        ${minPrice.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* PROMOTIONAL MODAL */}
      {showPromoModal && hasPromo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.5rem' }}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              style={{ borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem' }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <img
              src={restaurant.settings.promo.vertical_promo_image}
              alt="Promoción"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* CART SIDEBAR */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        restaurant={restaurant}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        restaurant={restaurant}
      />

      {/* HOURS MODAL */}
      {showHoursModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowHoursModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-lg overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.5rem' }}
          >
            <button
              onClick={() => setShowHoursModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ color: textColor, fontFamily: theme.secondary_font || 'Poppins' }}>
              Horarios de Atención
            </h3>
            <div className="space-y-3">
              {restaurant.settings.business_hours && Object.entries(restaurant.settings.business_hours).map(([day, hours]: [string, any]) => {
                const dayNames: Record<string, string> = {
                  monday: 'Lunes',
                  tuesday: 'Martes',
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                };
                return (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium" style={{ color: textColor, fontFamily: theme.primary_font || 'Inter' }}>
                      {dayNames[day]}
                    </span>
                    <span className="text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>
                      {hours.is_open ? `${hours.open} - ${hours.close}` : 'Cerrado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OPEN/CLOSED STATUS BUTTON */}
      <button
        onClick={() => setShowHoursModal(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-white shadow-lg px-4 py-3 z-40 transition-all hover:shadow-xl"
        style={{
          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
          borderLeft: `4px solid ${(() => {
            const now = new Date();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = dayNames[now.getDay()];
            const hours = restaurant.settings.business_hours?.[currentDay];
            if (!hours?.is_open) return '#ef4444';
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [openH, openM] = hours.open.split(':').map(Number);
            const [closeH, closeM] = hours.close.split(':').map(Number);
            const openTime = openH * 60 + openM;
            const closeTime = closeH * 60 + closeM;
            return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444';
          })()}`
        }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: textColor }} />
          <div className="text-left">
            <p className="text-xs text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>Estado</p>
            <p className="font-bold text-sm" style={{
              color: (() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = dayNames[now.getDay()];
                const hours = restaurant.settings.business_hours?.[currentDay];
                if (!hours?.is_open) return '#ef4444';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openH, openM] = hours.open.split(':').map(Number);
                const [closeH, closeM] = hours.close.split(':').map(Number);
                const openTime = openH * 60 + openM;
                const closeTime = closeH * 60 + closeM;
                return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444';
              })(),
              fontFamily: theme.secondary_font || 'Poppins'
            }}>
              {(() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = dayNames[now.getDay()];
                const hours = restaurant.settings.business_hours?.[currentDay];
                if (!hours?.is_open) return 'Cerrado';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openH, openM] = hours.open.split(':').map(Number);
                const [closeH, closeM] = hours.close.split(':').map(Number);
                const openTime = openH * 60 + openM;
                const closeTime = closeH * 60 + closeM;
                return currentTime >= openTime && currentTime <= closeTime ? 'Abierto' : 'Cerrado';
              })()}
            </p>
          </div>
        </div>
      </button>

      {/* FLOATING FOOTER BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 shadow-lg z-40"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-800" />
              <span className="font-medium text-gray-800" style={{ fontFamily: theme.primary_font || 'Inter' }}>
                {restaurant.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {restaurant.settings.social_media?.facebook && (
                <a
                  href={restaurant.settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                >
                  <Facebook className="w-5 h-5 text-gray-800" />
                </a>
              )}
              {restaurant.settings.social_media?.instagram && (
                <a
                  href={restaurant.settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                >
                  <Instagram className="w-5 h-5 text-gray-800" />
                </a>
              )}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                >
                  <Phone className="w-5 h-5 text-gray-800" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
