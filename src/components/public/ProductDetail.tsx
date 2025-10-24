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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: cardBackgroundColor,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible', // 👈 importante para que la imagen pueda sobresalir
        }}
      >
        {/* Imagen superpuesta fuera del bloque */}
        {product.images.length > 0 && (
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-4/5 aspect-video rounded-xl overflow-hidden shadow-xl z-20">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute -top-32 right-6 z-30 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: primaryTextColor }} />
        </button>

        {/* Contenido */}
        <div className="p-6 pt-32 overflow-y-auto" style={{ flex: 1 }}>
          {/* Product Name */}
          <h2
            className="font-bold mb-3 text-center"
            style={{
              fontSize: '28px',
              color: primaryTextColor,
              fontFamily: theme.primary_font || 'Inter',
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

          <p
            className="text-center mb-6"
            style={{
              fontSize: '14px',
              color: secondaryTextColor,
              lineHeight: '1.6',
            }}
          >
            {product.description}
          </p>

          {/* Aquí sigue el resto del contenido (variaciones, ingredientes, etc.) */}
        </div>
      </div>
    </div>
  );
};
