import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { formatPrice, truncate } from '../../utils/helpers';
import './PizzaCard.css';

const DEFAULT_SIZES = [
  { label: 'Small', priceAdjustment: 0 },
  { label: 'Medium', priceAdjustment: 80 },
  { label: 'Large', priceAdjustment: 160 },
];

const DEFAULT_CRUSTS = [
  { label: 'Thin', priceAdjustment: 0 },
  { label: 'Classic', priceAdjustment: 20 },
  { label: 'Stuffed', priceAdjustment: 60 },
];

const DEFAULT_TOPPINGS = [
  { name: 'Extra Cheese', price: 40, isVeg: true },
  { name: 'Mushrooms', price: 30, isVeg: true },
  { name: 'Black Olives', price: 30, isVeg: true },
  { name: 'Jalapeños', price: 25, isVeg: true },
  { name: 'Bell Peppers', price: 25, isVeg: true },
];

const PizzaCard = ({ pizza, compact = false, showCustomize = false }) => {
  const { addItem } = useCart();
  const [customizing, setCustomizing] = useState(showCustomize);

  // Available options from server or default fallback
  const sizes = (pizza.sizes && pizza.sizes.length > 0) ? pizza.sizes : DEFAULT_SIZES;
  const crusts = (pizza.crusts && pizza.crusts.length > 0) ? pizza.crusts : DEFAULT_CRUSTS;
  const toppingsList = (pizza.availableToppings && pizza.availableToppings.length > 0)
    ? pizza.availableToppings
    : DEFAULT_TOPPINGS;

  const [selectedSize, setSelectedSize] = useState(sizes[1]?.label || 'Medium');
  const [selectedCrust, setSelectedCrust] = useState(crusts[0]?.label || 'Thin');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  // Pricing calculations
  const sizeObj = sizes.find((s) => s.label === selectedSize) || sizes[0];
  const crustObj = crusts.find((c) => c.label === selectedCrust) || crusts[0];
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);

  const unitPrice =
    (pizza.basePrice || 0) + (sizeObj?.priceAdjustment || 0) + (crustObj?.priceAdjustment || 0) + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) =>
      prev.find((t) => t.name === topping.name)
        ? prev.filter((t) => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    addItem({
      pizzaId: pizza._id,
      pizzaName: pizza.name,
      pizzaImage: pizza.imageUrl || '',
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      quantity,
      specialInstructions: instructions,
      basePrice: pizza.basePrice || 0,
      sizeAdjustment: sizeObj?.priceAdjustment || 0,
      crustAdjustment: crustObj?.priceAdjustment || 0,
      toppingsTotal,
      unitPrice,
      itemTotal: totalPrice,
    });

    setCustomizing(false);
    setSelectedToppings([]);
    setQuantity(1);
    setInstructions('');
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      pizzaId: pizza._id,
      pizzaName: pizza.name,
      pizzaImage: pizza.imageUrl || '',
      size: selectedSize,
      crust: selectedCrust,
      toppings: [],
      quantity: 1,
      specialInstructions: '',
      basePrice: pizza.basePrice || 0,
      sizeAdjustment: sizeObj?.priceAdjustment || 0,
      crustAdjustment: crustObj?.priceAdjustment || 0,
      toppingsTotal: 0,
      unitPrice: (pizza.basePrice || 0) + (sizeObj?.priceAdjustment || 0) + (crustObj?.priceAdjustment || 0),
      itemTotal: (pizza.basePrice || 0) + (sizeObj?.priceAdjustment || 0) + (crustObj?.priceAdjustment || 0),
    });
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop';

  return (
    <article className={`pizza-card ${compact ? 'compact' : ''} ${!pizza.isAvailable ? 'unavailable' : ''}`}>
      {/* Image Banner */}
      <div className="pizza-card-img-wrapper">
        <img
          src={pizza.imageUrl || fallbackImage}
          alt={pizza.name}
          className="pizza-card-img"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImage; }}
        />
        <div className="pizza-badges">
          <span className={`badge ${pizza.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
            {pizza.isVeg ? '● Veg' : '▲ Non-Veg'}
          </span>
          {pizza.category && (
            <span className="badge badge-forest">{pizza.category}</span>
          )}
        </div>
        {!pizza.isAvailable && (
          <div className="pizza-sold-out-overlay">
            <span>Temporarily Sold Out</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="pizza-card-body">
        <div className="pizza-card-header">
          <h3 className="pizza-title">
            <Link to={`/menu/${pizza._id}`}>{pizza.name}</Link>
          </h3>
          <span className="pizza-price">{formatPrice(pizza.basePrice || 0)}</span>
        </div>

        <p className="pizza-desc">{truncate(pizza.description, compact ? 70 : 110)}</p>

        {/* Customization Toggle Section */}
        {customizing ? (
          <div className="pizza-customizer-drawer">
            {/* Size Selector */}
            <div className="customizer-group">
              <label className="customizer-label">Size</label>
              <div className="customizer-chips">
                {sizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className={`chip-btn ${selectedSize === s.label ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s.label)}
                  >
                    <span>{s.label}</span>
                    {s.priceAdjustment > 0 && <small>+{s.priceAdjustment}</small>}
                  </button>
                ))}
              </div>
            </div>

            {/* Crust Selector */}
            <div className="customizer-group">
              <label className="customizer-label">Crust</label>
              <div className="customizer-chips">
                {crusts.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={`chip-btn ${selectedCrust === c.label ? 'active' : ''}`}
                    onClick={() => setSelectedCrust(c.label)}
                  >
                    <span>{c.label}</span>
                    {c.priceAdjustment > 0 && <small>+{c.priceAdjustment}</small>}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings (if not compact) */}
            {!compact && toppingsList.length > 0 && (
              <div className="customizer-group">
                <label className="customizer-label">Extra Toppings</label>
                <div className="toppings-grid">
                  {toppingsList.slice(0, 6).map((t) => {
                    const isChecked = !!selectedToppings.find((item) => item.name === t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        className={`topping-chip ${isChecked ? 'active' : ''}`}
                        onClick={() => toggleTopping(t)}
                      >
                        <span>{t.name}</span>
                        <span className="topping-cost">+₹{t.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="customizer-footer-row">
              <div className="qty-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="total-display">
                <span className="total-label">Total:</span>
                <span className="total-amount">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="customizer-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCustomizing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm flex-1"
                onClick={handleAddToCart}
                disabled={!pizza.isAvailable}
              >
                Add {formatPrice(totalPrice)}
              </button>
            </div>
          </div>
        ) : (
          /* Default Card Actions */
          <div className="pizza-card-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCustomizing(true)}
              disabled={!pizza.isAvailable}
            >
              Customize
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex-1"
              onClick={handleQuickAdd}
              disabled={!pizza.isAvailable}
            >
              + Quick Add
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PizzaCard;
