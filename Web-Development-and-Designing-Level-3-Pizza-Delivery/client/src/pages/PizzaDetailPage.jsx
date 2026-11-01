import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { pizzaService } from '../services';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import './PizzaDetailPage.css';

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

const PizzaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Customization state
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedCrust, setSelectedCrust] = useState('Thin');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await pizzaService.getById(id);
        const pizzaData = res.data?.data?.pizza;
        if (!pizzaData) throw new Error('Pizza not found');

        setPizza(pizzaData);
        // Default size & crust selections from pizza data if available
        if (pizzaData.sizes && pizzaData.sizes.length > 0) {
          setSelectedSize(pizzaData.sizes[1]?.label || pizzaData.sizes[0]?.label);
        }
        if (pizzaData.crusts && pizzaData.crusts.length > 0) {
          setSelectedCrust(pizzaData.crusts[0]?.label);
        }
      } catch (err) {
        console.error('Error fetching pizza details:', err);
        setError('Pizza not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchPizza();
  }, [id]);

  if (loading) {
    return (
      <div className="container pizza-detail-loading">
        <div className="spinner" style={{ width: 44, height: 44 }}></div>
        <p>Loading chef creation...</p>
      </div>
    );
  }

  if (error || !pizza) {
    return (
      <div className="container pizza-detail-error">
        <h2>Pie Not Found</h2>
        <p>{error || 'This pizza is currently off the menu.'}</p>
        <Link to="/menu" className="btn btn-primary">Return to Menu</Link>
      </div>
    );
  }

  const sizes = (pizza.sizes && pizza.sizes.length > 0) ? pizza.sizes : DEFAULT_SIZES;
  const crusts = (pizza.crusts && pizza.crusts.length > 0) ? pizza.crusts : DEFAULT_CRUSTS;
  const toppingsList = pizza.availableToppings || [];

  const sizeObj = sizes.find((s) => s.label === selectedSize) || sizes[0];
  const crustObj = crusts.find((c) => c.label === selectedCrust) || crusts[0];
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);

  const unitPrice = (pizza.basePrice || 0) + (sizeObj?.priceAdjustment || 0) + (crustObj?.priceAdjustment || 0) + toppingsTotal;
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

    navigate('/cart');
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop';

  return (
    <div className="pizza-detail-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/menu">Menu</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{pizza.name}</span>
        </nav>

        <div className="pizza-detail-layout">
          {/* Left Column: Visual Showcase */}
          <div className="detail-visual-col">
            <div className="detail-image-card">
              <img
                src={pizza.imageUrl || fallbackImage}
                alt={pizza.name}
                className="detail-main-img"
                onError={(e) => { e.target.src = fallbackImage; }}
              />
              <div className="detail-badges">
                <span className={`badge ${pizza.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                  {pizza.isVeg ? '● Pure Vegetarian' : '▲ Gourmet Non-Vegetarian'}
                </span>
                <span className="badge badge-forest">{pizza.category}</span>
              </div>
            </div>

            <div className="detail-craft-notes">
              <h4 className="craft-notes-title">Chef's Quality Guarantee</h4>
              <ul className="craft-notes-list">
                <li>✨ Hand-tossed Neapolitan dough recipe</li>
                <li>🍅 Sun-ripened San Marzano plum tomatoes</li>
                <li>🧀 100% whole milk mozzarella with zero artificial additives</li>
                <li>🔥 Baked in artisanal high-temperature deck ovens</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Customization & Add to Cart */}
          <div className="detail-config-col">
            <div className="detail-header">
              <span className="micro-label">{pizza.category} PIE</span>
              <h1 className="detail-pizza-title font-display">{pizza.name}</h1>
              <p className="detail-pizza-desc">{pizza.description}</p>
              <div className="detail-base-price">
                <span className="price-label">Starting From:</span>
                <span className="price-val font-mono">{formatPrice(pizza.basePrice || 0)}</span>
              </div>
            </div>

            <div className="customizer-options-panel">
              {/* 1. Size Selection */}
              <div className="config-section">
                <div className="config-section-header">
                  <span className="config-step-num">1</span>
                  <div>
                    <h3 className="config-heading">Choose Size</h3>
                    <p className="config-sub">Select your desired portion size</p>
                  </div>
                </div>
                <div className="config-options-grid">
                  {sizes.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className={`option-card ${selectedSize === s.label ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s.label)}
                    >
                      <span className="option-name">{s.label}</span>
                      <span className="option-delta">
                        {s.priceAdjustment > 0 ? `+${formatPrice(s.priceAdjustment)}` : 'Standard'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Crust Selection */}
              <div className="config-section">
                <div className="config-section-header">
                  <span className="config-step-num">2</span>
                  <div>
                    <h3 className="config-heading">Select Crust</h3>
                    <p className="config-sub">The foundation of every great pizza</p>
                  </div>
                </div>
                <div className="config-options-grid">
                  {crusts.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      className={`option-card ${selectedCrust === c.label ? 'active' : ''}`}
                      onClick={() => setSelectedCrust(c.label)}
                    >
                      <span className="option-name">{c.label} Crust</span>
                      <span className="option-delta">
                        {c.priceAdjustment > 0 ? `+${formatPrice(c.priceAdjustment)}` : 'Standard'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Extra Toppings */}
              {toppingsList.length > 0 && (
                <div className="config-section">
                  <div className="config-section-header">
                    <span className="config-step-num">3</span>
                    <div>
                      <h3 className="config-heading">Add Extra Toppings</h3>
                      <p className="config-sub">Elevate your pie with gourmet additions</p>
                    </div>
                  </div>
                  <div className="toppings-selection-grid">
                    {toppingsList.map((t) => {
                      const isSelected = !!selectedToppings.find((item) => item.name === t.name);
                      return (
                        <button
                          key={t.name}
                          type="button"
                          className={`topping-select-card ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleTopping(t)}
                        >
                          <div className="topping-info">
                            <span className="topping-title">{t.name}</span>
                            <span className="topping-price">+{formatPrice(t.price)}</span>
                          </div>
                          <span className="topping-checkbox">{isSelected ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Special Instructions */}
              <div className="config-section">
                <label className="form-label" htmlFor="instructions">
                  Kitchen Notes &amp; Dietary Requests
                </label>
                <textarea
                  id="instructions"
                  rows="2"
                  placeholder="e.g. Well-done crust, extra crispy, less sauce, cut into 8 slices..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="form-textarea"
                  maxLength="200"
                ></textarea>
              </div>

              {/* 5. Sticky Action Footer */}
              <div className="detail-checkout-action-card">
                <div className="detail-qty-group">
                  <span className="qty-label">Quantity:</span>
                  <div className="qty-counter">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="qty-val font-mono">{quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="detail-final-total">
                  <span className="final-label">Subtotal</span>
                  <span className="final-price font-mono">{formatPrice(totalPrice)}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleAddToCart}
                  disabled={!pizza.isAvailable}
                >
                  {pizza.isAvailable ? `Add ${quantity} to Cart • ${formatPrice(totalPrice)}` : 'Temporarily Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetailPage;
