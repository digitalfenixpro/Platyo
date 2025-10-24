import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Product, ProductVariation, Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/currencyUtils';

interface ProductDetailProps {
  product: Product;
  restaurant: Restaurant;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, restaurant, onClose }) => {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(product.variations[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    product.ingredients.filter(ing => !ing.optional).map(ing => ing.id)
  );
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const calculatePrice = () => {
    const basePrice = selectedVariation.price;
    const extraCost = product.ingredients
      .filter(ing => ing.optional && selectedIngredients.includes(ing.id))
      .reduce((sum, ing) => sum + (ing.extra_cost || 0), 0);

    return (basePrice + extraCost) * quantity;
  };

  const handleAddToCart = () => {
    addItem(product, selectedVariation, quantity, '');
    onClose();
  };

  const theme = restaurant.settings.theme;
  const primaryColor = theme.primary_color || '#FFC700';
  const cardBackgroundColor = theme.card_background_color || '#ffffff';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-3xl mt-20 mb-10 overflow-visible"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: cardBackgroundColor,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Imagen centrada, sobresaliendo ligeramente */}
        {product.images.length > 0 && (
          <div className="relative -top-12 mx-auto w-4/5 aspect-video rounded-xl overflow-hidden shadow-xl z-10">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido principal */}
        <div className="relative p-6 pt-10 overflow-y-auto" style={{ flex: 1 }}>
          {/* Botón de cierre dentro del contenedor */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-20"
          >
            <X className="w-5 h-5" style={{ color: primaryTextColor }} />
          </button>

          {/* Nombre del producto */}
          <h2
            className="font-bold mb-2 text-center"
            style={{
              fontSize: '26px',
              color: primaryTextColor,
              fontFamily: theme.primary_font || 'Inter'
            }}
          >
            {product.name.split(' ').map((word, i) => (
              <span key={i}>
                {i === 0 ? (
                  <span style={{ color: primaryColor }}>{word}</span>
                ) : (
                  <span>{' ' + word}</span>
                )}
              </span>
            ))}
          </h2>

          {/* Descripción */}
          <p
            className="text-center mb-5"
            style={{
              fontSize: '14px',
              color: secondaryTextColor,
              lineHeight: '1.6'
            }}
          >
            {product.description}
          </p>

          {/* Slider / Galería dentro del contenedor */}
          {product.images.length > 1 && (
            <div className="mb-6 overflow-x-auto flex gap-3 scrollbar-hide">
              {product.images.map((img, index) => (
                <div key={index} className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden shadow-md">
                  <img src={img} alt={`img-${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Variaciones */}
          {product.variations.length > 0 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Selecciona una opción
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variations.map(variation => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation)}
                    className="p-4 rounded-lg text-left transition-all border-2"
                    style={{
                      borderColor: selectedVariation.id === variation.id ? primaryColor : '#e5e7eb',
                      backgroundColor: selectedVariation.id === variation.id ? primaryColor : 'transparent',
                      color: selectedVariation.id === variation.id ? '#ffffff' : primaryTextColor,
                      borderRadius: '8px'
                    }}
                  >
                    <div className="font-semibold" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {variation.name}
                    </div>
                    <div className="font-bold" style={{ fontSize: '16px' }}>
                      {formatCurrency(variation.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ingredientes */}
          {product.ingredients.length > 0 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Ingredientes
              </h3>
              <div className="space-y-2">
                {product.ingredients.map(ingredient => (
                  <label
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: '#e5e7eb',
                      borderRadius: '8px',
                      opacity: ingredient.optional ? 1 : 0.7
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      disabled={!ingredient.optional}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '13px',
                        color: secondaryTextColor
                      }}
                    >
                      {ingredient.name} {!ingredient.optional && '(incluido)'}
                    </span>
                    {ingredient.optional && ingredient.extra_cost && ingredient.extra_cost > 0 && (
                      <span
                        className="font-medium"
                        style={{
                          fontSize: '13px',
                          color: primaryColor
                        }}
                      >
                        +{formatCurrency(ingredient.extra_cost)}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Botón agregar ingrediente */}
              <button
                className="mt-3 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                + Adicionar ingrediente
              </button>
            </div>
          )}

          {/* Cantidad y agregar al carrito */}
          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <span
                className="font-medium"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Cantidad:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="font-bold w-8 text-center"
                  style={{
                    fontSize: '18px',
                    color: primaryTextColor
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              Agregar {formatCurrency(calculatePrice())}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
