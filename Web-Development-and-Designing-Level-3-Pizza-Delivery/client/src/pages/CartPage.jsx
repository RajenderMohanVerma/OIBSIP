import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';
import { formatPrice } from '../utils/helpers';
import './CartPage.css';

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, estimatedSubtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [validatedData, setValidatedData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);

  // Validate cart with server whenever items change or a coupon is applied
  useEffect(() => {
    if (items.length === 0) {
      setValidatedData(null);
      return;
    }

    const validate = async () => {
      // If user is not authenticated, validateCart endpoint requires auth,
      // so fallback to client-side estimates gracefully.
      if (!isAuthenticated) {
        const sub = estimatedSubtotal;
        const delFee = sub >= 500 ? 0 : 40;
        const tax = parseFloat((sub * 0.05).toFixed(2));
        setValidatedData({
          subtotal: sub,
          discountAmount: 0,
          deliveryFee: delFee,
          taxAmount: tax,
          totalAmount: sub + delFee + tax,
        });
        return;
      }

      try {
        setValidating(true);
        const payload = {
          items: items.map((i) => ({
            pizzaId: i.pizzaId,
            size: i.size,
            crust: i.crust,
            toppings: i.toppings,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon || undefined,
        };

        const res = await orderService.validateCart(payload);
        if (res.data?.success) {
          setValidatedData(res.data.data);
          if (res.data.data.couponMessage) {
            setCouponMsg(res.data.data.couponMessage);
          }
        }
      } catch (err) {
        console.warn('Cart revalidation with server note:', err?.response?.data?.message || err.message);
        // Fallback to client calculations
        const sub = estimatedSubtotal;
        const delFee = sub >= 500 ? 0 : 40;
        const tax = parseFloat((sub * 0.05).toFixed(2));
        setValidatedData({
          subtotal: sub,
          discountAmount: 0,
          deliveryFee: delFee,
          taxAmount: tax,
          totalAmount: sub + delFee + tax,
        });
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [items, appliedCoupon, estimatedSubtotal, isAuthenticated]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!isAuthenticated) {
      toast('Please log in to apply discount coupons.', { icon: 'ℹ️' });
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setAppliedCoupon(couponCode.trim().toUpperCase());
    toast.success(`Checking coupon: ${couponCode.trim().toUpperCase()}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
    setCouponMsg(null);
    toast('Coupon removed.');
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!isAuthenticated) {
      toast('Please sign in or create an account to proceed.', { icon: '🔐' });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout', { state: { appliedCoupon } });
  };

  if (items.length === 0) {
    return (
      <div className="cart-page page-enter">
        <div className="container cart-empty-container">
          <div className="cart-empty-card">
            <span className="cart-empty-icon">🍕</span>
            <h1 className="cart-empty-title font-display">YOUR CART IS HUNGRY</h1>
            <p className="cart-empty-desc">
              You haven't added any artisanal pizzas to your cart yet. Explore our handcrafted menu to discover your new favourite slice.
            </p>
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Our Menu →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Use server validated numbers when available, fallback to client estimates
  const subtotal = validatedData?.subtotal ?? estimatedSubtotal;
  const discount = validatedData?.discountAmount ?? 0;
  const delivery = validatedData?.deliveryFee ?? (subtotal >= 500 ? 0 : 40);
  const taxes = validatedData?.taxAmount ?? parseFloat(((subtotal - discount) * 0.05).toFixed(2));
  const finalTotal = validatedData?.totalAmount ?? (subtotal - discount + delivery + taxes);

  return (
    <div className="cart-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <span className="micro-label">REVIEW YOUR SELECTION</span>
            <h1 className="cart-title font-display">YOUR PIZZA CART</h1>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-col">
            <div className="cart-items-list">
              {items.map((item) => {
                const toppingsTotal = item.toppings?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
                const unitPrice = (item.basePrice || 0) + (item.sizeAdjustment || 0) + (item.crustAdjustment || 0) + toppingsTotal;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div key={item.cartId} className="cart-item-card">
                    <img
                      src={item.pizzaImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop'}
                      alt={item.pizzaName}
                      className="cart-item-img"
                    />

                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h3 className="cart-item-name">{item.pizzaName}</h3>
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeItem(item.cartId)}
                          aria-label={`Remove ${item.pizzaName}`}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="cart-item-specs">
                        <span className="spec-pill">{item.size}</span>
                        <span className="spec-pill">{item.crust} Crust</span>
                        {item.toppings && item.toppings.length > 0 && (
                          <span className="spec-pill toppings-pill">
                            +{item.toppings.map((t) => t.name).join(', ')}
                          </span>
                        )}
                      </div>

                      {item.specialInstructions && (
                        <p className="cart-item-notes">
                          <em>Note:</em> {item.specialInstructions}
                        </p>
                      )}

                      <div className="cart-item-footer">
                        <div className="cart-qty-ctrl">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="qty-val font-mono">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-pricing">
                          <span className="item-unit-price font-mono">{formatPrice(unitPrice)} ea</span>
                          <span className="item-total-price font-mono">{formatPrice(itemTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-continue-row">
              <Link to="/menu" className="btn btn-secondary btn-sm">
                ← Add More Pizzas
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <div className="coupon-input-wrapper">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="form-input coupon-input"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Apply
                    </button>
                  )}
                </div>
                {couponMsg && (
                  <p className="coupon-msg-active">
                    ✓ {couponMsg}
                  </p>
                )}
                <div className="coupon-suggestions">
                  <small>Available demo codes: </small>
                  <button type="button" onClick={() => setCouponCode('WELCOME20')} className="code-pill">WELCOME20</button>
                  <button type="button" onClick={() => setCouponCode('FLAT50')} className="code-pill">FLAT50</button>
                </div>
              </form>

              {/* Price Breakdown */}
              <div className="summary-rows">
                <div className="summary-row">
                  <span className="row-label">Subtotal</span>
                  <span className="row-val font-mono">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span className="row-label">Promo Discount ({appliedCoupon})</span>
                    <span className="row-val font-mono">−{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span className="row-label">
                    Delivery Charges
                    {delivery === 0 && <span className="free-badge">FREE</span>}
                  </span>
                  <span className="row-val font-mono">
                    {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                  </span>
                </div>

                {delivery > 0 && subtotal < 500 && (
                  <div className="free-delivery-hint">
                    Add {formatPrice(500 - subtotal)} more for <strong>FREE Delivery</strong>!
                  </div>
                )}

                <div className="summary-row">
                  <span className="row-label">GST / Taxes (5%)</span>
                  <span className="row-val font-mono">{formatPrice(taxes)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span className="total-label">Grand Total</span>
                  <span className="total-val font-mono">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <p className="server-validation-note">
                🔒 Prices are validated &amp; finalized by the server at checkout.
              </p>

              <button
                type="button"
                className="btn btn-primary btn-lg w-full checkout-cta"
                onClick={handleProceedToCheckout}
                disabled={validating}
              >
                {validating ? 'Verifying with Server...' : `Proceed to Checkout • ${formatPrice(finalTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

