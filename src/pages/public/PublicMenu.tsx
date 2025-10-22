import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Gift, Star, X, ChevronLeft, ChevronRight, Grid3x3, List, Clock, MapPin, Facebook, Instagram, Phone, AlignLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';
import Pathtop from '../../components/public/Pathformtop.tsx';
import Pathbottom from '../../components/public/Pathformbottom.tsx';



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
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';
  const textColor = theme.primary_text_color || '#111827';
  const hasPromo = restaurant.settings.promo?.enabled && restaurant.settings.promo?.vertical_promo_image;

  return (
    
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: menuBackgroundColor,
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--menu-bg-color': menuBackgroundColor,
        '--card-bg-color': cardBackgroundColor,
        '--primary-text-color': primaryTextColor,
        '--secondary-text-color': secondaryTextColor,
        '--text-color': textColor,
        '--primary-font': theme.primary_font || 'Inter',
        '--secondary-font': theme.secondary_font || 'Poppins',
      } as React.CSSProperties}
    >
      <style>{`p, span { color: ${primaryTextColor} !important; }`}</style>
      

      {/*<LeftShape color={primaryColor} />*/}
      {/* DECORATIVE ORGANIC SHAPES - MATCHING REFERENCE */}
      {/*SE AGREGARON TODOS LOS SVG*/}
      <svg
        className="absolute top-40 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          opacity: 0.8, // antes estaba en className como opacity-80
          transform: 'translate(-20%, -20%)',
          borderBottomRightRadius: '50% 40%',
          borderTopRightRadius: '0% 0%',
        }}
        viewBox="0 0 285 538"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill={primaryColor} fill-rule="evenodd" d="M-72.947.728q5.076-.1 10.506 1.76 5.334 1.76 10.932 4.99 5.598 3.229 11.374 7.437a334 334 0 0 1 11.83 9.105 744 744 0 0 1 12.2 10.087 299 299 0 0 0 12.497 9.996 262 262 0 0 0 12.702 9.414q6.552 4.418 13.122 7.86a116 116 0 0 0 13.159 5.91 143 143 0 0 0 13.288 4.253 194 194 0 0 0 12.92 3.076Q68 75.909 74.128 76.903q6.225 1.095 11.963 2.081 5.835 1.087 11.08 2.358 5.44 1.274 10.189 3.023a51 51 0 0 1 8.896 4.267 47.5 47.5 0 0 1 7.601 5.707 48 48 0 0 1 6.106 7.337 59 59 0 0 1 4.718 8.482 76 76 0 0 1 3.33 9.626 81 81 0 0 1 2.042 10.676q.68 5.282.768 10.943a139 139 0 0 1-.513 11.603q-.597 5.746-1.684 11.581a156 156 0 0 1-2.854 11.558 233 233 0 0 1-3.826 11.344 412 412 0 0 1-4.511 11.429l-4.905 11.617a1181 1181 0 0 0-4.908 11.812 441 441 0 0 0-4.621 12.11 244 244 0 0 0-3.852 12.71 121 121 0 0 0-3.083 13.311 143 143 0 0 0-1.731 14.116 192 192 0 0 0-.481 15.019 313 313 0 0 0 .488 15.427q.437 7.815.97 15.73a1407 1407 0 0 1 .97 15.729q.437 7.815.491 15.232.05 7.613-.572 14.724a103 103 0 0 1-2.115 13.719q-1.491 6.608-4.043 12.512a56.6 56.6 0 0 1-6.45 10.807 53.5 53.5 0 0 1-8.667 9.301 67 67 0 0 1-10.39 7.511 75.6 75.6 0 0 1-11.816 5.631 86.6 86.6 0 0 1-12.56 3.665 82.7 82.7 0 0 1-13.4 1.599 90.4 90.4 0 0 1-13.262-.447 89 89 0 0 1-13.023-2.784 82.5 82.5 0 0 1-12.203-4.916 103 103 0 0 1-11.38-7.047 129 129 0 0 1-10.87-8.306 342 342 0 0 1-10.46-9.273 699 699 0 0 0-10.265-9.271 221 221 0 0 0-10.369-8.979 147 147 0 0 0-10.586-7.813 91 91 0 0 0-11.3-6.167 64.5 64.5 0 0 0-12.029-3.741q-6.22-1.29-12.854-1.415-6.538-.027-13.285.723t-13.506 2.086q-6.66 1.24-13.031 2.777-6.468 1.439-12.347 2.693-5.882 1.45-11.069 2.23-5.286.875-9.678.889-4.292-.08-7.586-1.315-3.2-1.134-5.301-3.516-2.097-2.577-3.201-6.111-1.2-3.633-1.7-8.131-.4-4.594-.4-9.766.004-5.367.211-11.121.306-5.849.521-11.992.31-6.045.332-12.387a201 201 0 0 0-.543-12.501 93 93 0 0 0-1.526-12.129 110 110 0 0 0-2.704-11.762 189 189 0 0 0-3.396-11.286 256 256 0 0 0-3.794-10.904 546 546 0 0 1-3.702-10.609 184 184 0 0 1-3.124-10.208q-1.464-5.103-2.152-9.994a74 74 0 0 1-.886-9.873q-.007-4.782.962-9.545a58.4 58.4 0 0 1 3.012-9.604q1.945-4.745 4.768-9.57a109 109 0 0 1 6.337-9.93 350 350 0 0 1 7.518-10.494 446 446 0 0 1 8.504-11.061q4.304-5.676 9.009-11.929a414 414 0 0 0 9.322-12.997 339 339 0 0 0 9.44-14.067 558 558 0 0 0 9.076-15.441 939 939 0 0 0 8.895-16.225 1306 1306 0 0 0 8.8-16.325 875 875 0 0 1 8.689-15.643 339 339 0 0 1 8.767-14.569q4.421-6.747 8.92-12.419 4.5-5.67 9.164-9.779 4.76-4.008 9.582-6.16 4.922-2.25 9.998-2.348" clip-rule="evenodd"/>
      </svg>
      
      <Pathbottom color={primaryColor} className="
          absolute 
          opacity-80 
          pointer-events-none 
          w-[400px] h-[400px]
          
      
          /* Versión escritorio */
          sm:top-20 sm:right-0 sm:bottom-auto sm:left-auto sm:translate-x-[25%] sm:-translate-y-[25%]
        ">
      </Pathbottom>
        
      <Pathtop color={primaryColor} className="
          absolute
          -bottom-1 -right-20
          w-[250px] h-auto
          opacity-80
          pointer-events-none
          rotate-45
        ">
      </Pathtop>
      

      

      {/* HEADER */}
      <header className="sticky top-0 z-50 relative "> {/* DF: SE QUITÓ EL BLUR */}
        <div className="w-full mx-auto px-4 py-4"> {/* DF: SE REDUJO EL PADDING PARA QUE QUEDE MAS DELGADO */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
             <div className="flex-1 max-w-xs shadow-lg">
              <div className="relative">
                {/* Icono de lupa */}
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: primaryTextColor, stroke: primaryTextColor }}
                />
            
                {/* Input */}
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setTimeout(() => {
                        document
                          .getElementById('products-section')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:outline-none transition-colors placeholder-opacity-70 custom-placeholder"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBackgroundColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                    color: primaryTextColor,
                    caretColor: primaryTextColor,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = primaryTextColor)}
                  onBlur={(e) => (e.target.style.borderColor = cardBackgroundColor)}
                />
            
                {/* CSS dinámico para el placeholder */}
                <style>{`
                  .custom-placeholder::placeholder {
                    color: ${primaryTextColor} !important;
                    opacity: 0.7;
                  }
                `}</style>
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
              {/* DF:OPEN/CLOSED STATUS BUTTON */}
              <button
                onClick={() => setShowHoursModal(true)}
                className="flex items-center gap-2 p-3 rounded-lg transition-all hover:opacity-90 shadow-lg h-18"
                style={{
                  backgroundColor: (() => {
                    const now = new Date();
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const currentDay = dayNames[now.getDay()];
                    const hours = restaurant.settings.business_hours?.[currentDay];
                    if (!hours?.is_open) return '#ef4444'; // rojo si cerrado
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    const [openH, openM] = hours.open.split(':').map(Number);
                    const [closeH, closeM] = hours.close.split(':').map(Number);
                    const openTime = openH * 60 + openM;
                    const closeTime = closeH * 60 + closeM;
                    return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444'; // verde o rojo
                  })(),
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  
                }}
              >
                <Clock className="w-5 h-5" style={{ color: textColor }} />
              
                <div className="text-left leading-tight"> 
                  
                  <p
                    className="font-semibold text-sm"
                    style={{
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
                      fontFamily: theme.secondary_font || 'Poppins',
                    }}
                  >
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
              </button>
              {hasPromo && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="p-3 rounded-lg border transition-colors relative hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Gift
                    className="w-5 h-5"
                    style={{
                      color: textColor,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',       // antes 6px → negativo para que quede encima del borde
                      right: '-4px',     // antes 6px → negativo para que sobresalga del borde
                      width: '15px',
                      height: '15px',
                      backgroundColor: secondaryColor,
                      borderRadius: '50%',
                      boxShadow: '0 0 0 2px white', // opcional: halo blanco para destacar
                    }}
                  />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="p-3 rounded-lg border hover:opacity-90 transition-colors relative shadow-lg"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: cardBackgroundColor,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                }}
              >
                <ShoppingCart className="w-5 h-5" style={{ color: primaryTextColor, stroke: primaryTextColor }} />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: secondaryColor }}
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
        <section className="max-w-7xl mx-auto px-4 py-10 relative z-30">
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
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: secondaryColor }} />
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
                    <div
                      className="relative flex flex-col items-center rounded-2xl shadow-md "
                      style={{
                        backgroundColor: cardBackgroundColor,
                      }}
                    >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-80 h-80 object-cover rounded-t-lg "
                            style={{
                              backgroundColor: cardBackgroundColor,
                            }}
                        />
                        {isCenter && (
                          <div
                            className="mt-2 px-1 py-1 max-w-xs"
                            style={{
                              backgroundColor: cardBackgroundColor,
                            }}
                          >
                            <p
                              className="font-bold text-center text-lg"
                              style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryTextColor} !important;`
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
                  className="absolute -left-10 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-20" /*DF: CAMBIO DE BOTONES EN MOVIL*/
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem',
                  }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: textColor }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-20" /*DF: CAMBIO DE BOTONES EN MOVIL*/
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem',
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
                        backgroundColor: index === featuredSlideIndex ? primaryColor : primaryTextColor,
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
        <div className="max-w-6xl mx-auto px-1 py-1 relative"> {/*DF:REDUCIR ANCHO DE SECCION*/}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
              style={{
                backgroundColor: selectedCategory === 'all' ? primaryColor : 'transparent',
                color: selectedCategory === 'all' ? secondaryTextColor : textColor,
                border: `1px solid ${primaryColor}`,
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
                  backgroundColor: selectedCategory === category.id ? primaryColor : 'transparent',
                  color: selectedCategory === category.id ? secondaryTextColor : textColor,
                  border: `1px solid ${primaryColor}`,
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
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24 relative z-10" id="products-section">
        {/* View Mode Selector */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <List className="w-5 h-5" style={{ color: viewMode === 'list' ? primaryColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <Grid3x3 className="w-5 h-5" style={{ color: viewMode === 'grid' ? primaryColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'editorial' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <AlignLeft className="w-5 h-5" style={{ color: viewMode === 'editorial' ? primaryColor : textColor }} />
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
                    className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                      backgroundColor: cardBackgroundColor
                    }}
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
                          className="mb-4 text-base leading-relaxed"
                          style={{
                            fontFamily: theme.primary_font || 'Inter',
                            color: secondaryTextColor
                          }}
                        >
                          {product.description}
                        </p>
                        <span
                          className="font-bold text-2xl"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
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
                    className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                      backgroundColor: cardBackgroundColor
                    }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-45 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3
                        className="font-bold mb-2 line-clamp-1"
                        style={{
                          fontSize: '14px',
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
                        <span
                          className="font-bold text-lg"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
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
                  className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-left gap-4 p-4 pl-0 py-0"
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                    display: 'flex',
                    backgroundColor: cardBackgroundColor
                  }}
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover rounded-xl flex-shrink-0 " /*DF: agregue el rounded-xl para que se vea cuadrada la imagen*/
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        borderTopRightRadius: '0px',
                        borderBottomRightRadius: '0px',/*DF:configurar las imagenes para que vayan al borde*/
                       }}
                    />
                  )}
                  <div className="flex-1 min-w-0 p-4">
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
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
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
            className="relative max-w-md w-full rounded-lg overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBackgroundColor,
              borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.5rem',
            }}
          >
            <button
              onClick={() => setShowHoursModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" style={{ color: primaryTextColor, stroke: primaryTextColor }} />
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

      {/* OPEN/CLOSED STATUS BUTTON 
      <button
        onClick={() => setShowHoursModal(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 shadow-lg px-4 py-3 z-40 transition-all hover:shadow-xl"
        style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
          borderLeft: `4px solid ${(() => {
            const now = new Date();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = dayNames[now.getDay()];
            const hours = restaurant.settings.business_hours?.[currentDay];
            if (!hours?.is_open) return '#ef4444'; // rojo si está cerrado
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [openH, openM] = hours.open.split(':').map(Number);
            const [closeH, closeM] = hours.close.split(':').map(Number);
            const openTime = openH * 60 + openM;
            const closeTime = closeH * 60 + closeM;
            return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444'; // verde si abierto
          })()}`,
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
      </button>*/}

      {/* FLOATING FOOTER BAR */}
      <div
        className="fixed bottom-1 left-4 right-4 shadow-lg z-40 rounded-xl p-1 " /* se le agregar este codigo para los bordes redondeados y padding a los lados*/
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" style={{ color: secondaryTextColor, stroke: secondaryTextColor }} />
                <span
                  className="font-medium"
                  style={{
                    fontFamily: theme.primary_font || 'Inter',
                    cssText: `color: ${secondaryTextColor} !important;`,
                  }}
                >
                {restaurant.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {restaurant.settings.social_media?.facebook && (
                <a
                  href={restaurant.settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Facebook className="w-5 h-5" style={{ color: primaryColor, stroke: primaryColor }} />
                </a>
              )}
              {restaurant.settings.social_media?.instagram && (
                <a
                  href={restaurant.settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Instagram className="w-5 h-5" style={{ color: primaryColor, stroke: primaryColor }} />
                </a>
              )}
              {restaurant.settings.social_media?.whatsapp && (
                <a
                  href={restaurant.settings.social_media.phone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Phone className="w-5 h-5" style={{ color: primaryColor, stroke: primaryColor }} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
