import React, { useState } from 'react';
import type { Product } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const getNutritionImage = (productName: string): string => {
  const name = productName.toUpperCase();
  if (name.includes('DOUBLE SHOT PRE-WORKOUT') || name.includes('PRE-WORKOUT')) {
    return '/images/preworkout_nutrition.png';
  }
  if (name.includes('CITRULLINE')) {
    return '/images/citrulline_nutrition.png';
  }
  if (name.includes('ISO WHEY TANK') || name.includes('WHEY') || name.includes('PROTEIN')) {
    return '/images/whey_nutrition.png';
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return '/images/eaa_nutrition.png';
  }
  return '/images/general_nutrition.png';
};

interface ProductCardProps {
  product: Product;
  onViewDetail?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const { addToCart } = useCart();

  // Parse comma-separated strings into lists
  const flavorList = product.flavors.split(',').map((f) => f.trim()).filter(Boolean);
  const sizeList = product.sizes.split(',').map((s) => s.trim()).filter(Boolean);

  // Selector states (default to first elements)
  const [selectedFlavor, setSelectedFlavor] = useState(flavorList[0] || 'Default');
  const [selectedSize, setSelectedSize] = useState(sizeList[0] || 'Default');

  const isOutOfStock = product.stock <= 0;

  // Discount calculation
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedFlavor, selectedSize);
  };

  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  return (
    <div className="product-card">
      {/* Product Badges */}
      {product.category.toLowerCase() === 'coming soon' ? (
        <div className="product-card-badge badge-coming-soon">Coming Soon</div>
      ) : product.isBestSeller ? (
        <div className="product-card-badge badge-bestseller">Best Seller</div>
      ) : product.isNewArrival ? (
        <div className="product-card-badge badge-new">New Arrival</div>
      ) : null}
      {hasDiscount && <div className="badge-sale">-{discountPercent}%</div>}

      {/* Product Image Wrapper with 3D Flip */}
      <div 
        className="product-card-image-wrapper" 
        onClick={() => onViewDetail && onViewDetail(product.id)}
        style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
      >
        <div className="product-card-image-inner">
          {/* Front Side: Product Mockup Image */}
          <div className="product-card-image-front">
            <img
              className="product-card-image"
              src={product.image}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pre_workout.png';
              }}
            />
          </div>
          {/* Back Side: Nutrition Facts Label */}
          <div className="product-card-image-back">
            <img
              className="product-card-image"
              src={getNutritionImage(product.name)}
              alt={`${product.name} Nutritional Facts`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/general_nutrition.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-card-content">
        <div className="product-goal-tag">{product.goal}</div>
        <h3 
          className="product-title"
          onClick={() => onViewDetail && onViewDetail(product.id)}
          style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
        >
          {product.name}
        </h3>
        <p className="product-desc" title={product.description}>
          {product.description}
        </p>

        {/* Pricing */}
        <div className="product-pricing">
          {product.category.toLowerCase() === 'coming soon' ? (
            <span className="price-coming-soon">COMING SOON</span>
          ) : hasDiscount ? (
            <>
              <span className="price-active has-sale">{formatPrice(product.salePrice!)}</span>
              <span className="price-original">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price-active">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Option Selection Controls */}
        <div className="product-options-area">
          {flavorList.length > 0 && (
            <div className="option-group">
              <span className="option-title">Flavor:</span>
              <div className="option-chips">
                {flavorList.map((flavor) => (
                  <button
                    key={flavor}
                    className={`option-chip ${selectedFlavor === flavor ? 'selected' : ''}`}
                    onClick={() => setSelectedFlavor(flavor)}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizeList.length > 0 && (
            <div className="option-group">
              <span className="option-title">Size:</span>
              <div className="option-chips">
                {sizeList.map((size) => (
                  <button
                    key={size}
                    className={`option-chip ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger */}
          {product.category.toLowerCase() === 'coming soon' ? (
            <div className="coming-soon-btn-disabled">COMING SOON</div>
          ) : isOutOfStock ? (
            <div className="out-of-stock-text">OUT OF STOCK</div>
          ) : (
            <button className="add-cart-btn" onClick={handleAddToCart}>
              <ShoppingCart size={16} />
              Add To Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
