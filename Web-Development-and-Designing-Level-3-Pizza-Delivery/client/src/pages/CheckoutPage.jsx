import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services';
import { formatPrice } from '../utils/helpers';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, clearCart, estimatedSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || '');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [validatedData, setValidatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  // If user has saved addresses, prefill the first one
  useEffect(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0) {
      const addr = user.savedAddresses[0];
      setFormData((prev) => ({
        ...prev,
        street: addr.street || '',
        city: addr.city || 'Mumbai',
        state: addr.state || 'Maharashtra',
        postalCode: addr.postalCode || '',
        phone: addr.phone || prev.phone,
      }));
    }
  }, [user]);

  // Server-side validation of cart items
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const validate = async () => {
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
        }
      } catch (err) {
        console.error('Server validation error:', err);
        toast.error('Unable to validate cart with server. Check items availability.');
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [items, appliedCoupon, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleApplyCoupon = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!couponInput.trim()) return;
    setAppliedCoupon(couponInput.trim().toUpperCase());
    toast.success(`Checking coupon: ${couponInput.trim().toUpperCase()}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    setCouponMsg(null);
    toast('Coupon removed', { icon: 'ℹ️' });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Field validation
    if (!formData.name.trim()) return toast.error('Please enter your full name.');
    if (!formData.phone.trim()) return toast.error('Please enter your contact phone number.');
    if (!formData.street.trim()) return toast.error('Please enter your delivery street address.');
    if (!formData.postalCode.trim()) return toast.error('Please enter your postal code.');

    try {
      setLoading(true);

      const orderPayload = {
        items: items.map((i) => ({
          pizzaId: i.pizzaId,
          size: i.size,
          crust: i.crust,
          toppings: i.toppings,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions || '',
        })),
        deliveryAddress: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          instructions: formData.instructions.trim(),
        },
        paymentMethod,
        couponCode: appliedCoupon || undefined,
      };

      // 1. Create order on the server
      const orderRes = await orderService.create(orderPayload);
      const createdOrder = orderRes.data?.data?.order;
      if (!createdOrder) throw new Error('Order creation failed on server');

      // 2. Handle payment method
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully! Pay on delivery.');
        navigate(`/order/confirmation/${createdOrder._id}`);
        return;
      }

      // Online payment via Razorpay Test Mode
      if (paymentMethod === 'razorpay') {
        try {
          const paymentOrderRes = await paymentService.createOrder({
            orderId: createdOrder._id,
          });

          const { razorpayOrderId, amount, currency, keyId } = paymentOrderRes.data.data;

          if (!window.Razorpay) {
            toast.error('Razorpay SDK failed to load. Please verify your connection.');
            setLoading(false);
            return;
          }

          const options = {
            key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount,
            currency: currency || 'INR',
            name: 'Crust & Craft Pizza',
            description: `Order ${createdOrder.orderNumber} (Test Payment)`,
            image: '/favicon.svg',
            order_id: razorpayOrderId,
            handler: async (response) => {
              try {
                toast.loading('Verifying payment signature with server...', { id: 'verify-toast' });
                // Verify signature on the server
                const verifyRes = await paymentService.verify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: createdOrder._id,
                });

                toast.dismiss('verify-toast');
                toast.success('Payment verified successfully!');
                clearCart();
                navigate(`/order/confirmation/${createdOrder._id}`);
              } catch (verifyErr) {
                toast.dismiss('verify-toast');
                toast.error(
                  verifyErr.response?.data?.message || 'Payment signature verification failed.'
                );
                navigate(`/orders/${createdOrder._id}`);
              }
            },
            prefill: {
              name: formData.name,
              email: user?.email || '',
              contact: formData.phone,
            },
            theme: {
              color: '#A31C18',
            },
            modal: {
              ondismiss: () => {
                toast('Payment cancelled or window closed.', { icon: 'ℹ️' });
                setLoading(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (failedRes) => {
            toast.error(`Payment failed: ${failedRes.error.description}`);
            setLoading(false);
          });
          rzp.open();
        } catch (payOrderErr) {
          const errMsg = payOrderErr.response?.data?.message || payOrderErr.message;
          if (errMsg.includes('not configured')) {
            toast.error('Razorpay is not yet configured on the server. Falling back to COD order confirmation.', { duration: 6000 });
            clearCart();
            navigate(`/order/confirmation/${createdOrder._id}`);
          } else {
            toast.error(errMsg);
            setLoading(false);
          }
        }
      }
    } catch (err) {
      console.error('Order placement error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please review your details.');
      setLoading(false);
    }
  };

  const subtotal = validatedData?.subtotal ?? estimatedSubtotal;
  const discount = validatedData?.discountAmount ?? 0;
  const delivery = validatedData?.deliveryFee ?? (subtotal >= 500 ? 0 : 40);
  const taxes = validatedData?.taxAmount ?? parseFloat(((subtotal - discount) * 0.05).toFixed(2));
  const finalTotal = validatedData?.totalAmount ?? (subtotal - discount + delivery + taxes);

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <div className="checkout-header">
          <span className="micro-label">FINAL STEP</span>
          <h1 className="checkout-title font-display">CHECKOUT &amp; DISPATCH</h1>
          <div className="demo-notice-banner">
            <span className="demo-notice-dot"></span>
            <span>
              <strong>Internship Demo Environment:</strong> Razorpay runs in <strong>TEST MODE</strong>. No actual money will be charged.
            </span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          {/* Left Column: Delivery & Payment Details */}
          <div className="checkout-form-col">
            {/* 1. Contact Information */}
            <div className="checkout-card">
              <h2 className="card-section-title">
                <span className="step-num">1</span>
                <span>Contact Details</span>
              </h2>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="checkout-card">
              <h2 className="card-section-title">
                <span className="step-num">2</span>
                <span>Delivery Address</span>
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="street">Street Address &amp; Flat / House No. *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Flat 402, Green Heights, Linking Road"
                  required
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="postalCode">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="400001"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="instructions">Delivery Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows="2"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="e.g. Leave with security, call upon arrival, landmark opposite church..."
                ></textarea>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="checkout-card">
              <h2 className="card-section-title">
                <span className="step-num">3</span>
                <span>Payment Method</span>
              </h2>

              <div className="payment-options">
                <label className={`payment-option-card ${paymentMethod === 'razorpay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <div className="payment-option-content">
                    <div className="payment-option-header">
                      <strong>Razorpay Online Payment (Test Mode)</strong>
                      <span className="badge badge-primary">Recommended</span>
                    </div>
                    <p className="payment-option-desc">
                      UPI, Credit/Debit Cards, NetBanking via Razorpay official sandbox simulator.
                    </p>
                  </div>
                </label>

                <label className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option-content">
                    <div className="payment-option-header">
                      <strong>Cash on Delivery (COD)</strong>
                    </div>
                    <p className="payment-option-desc">
                      Pay cash or scan QR code when your hot order is handed over by the delivery rider.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Placement */}
          <div className="checkout-summary-col">
            <div className="checkout-summary-card">
              <h2 className="summary-title">Order Breakdown</h2>

              {/* Items Snapshot */}
              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={item.cartId} className="checkout-item-row">
                    <div className="checkout-item-title-col">
                      <span className="checkout-item-name">{item.pizzaName}</span>
                      <span className="checkout-item-meta">
                        {item.size} • {item.crust} Crust {item.toppings?.length > 0 && `• +${item.toppings.length} toppings`}
                      </span>
                    </div>
                    <span className="checkout-item-qty font-mono">x{item.quantity}</span>
                    <span className="checkout-item-cost font-mono">
                      {formatPrice(((item.basePrice || 0) + (item.sizeAdjustment || 0) + (item.crustAdjustment || 0) + (item.toppings?.reduce((s, t) => s + (t.price || 0), 0) || 0)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

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
                  <span className="row-label">Delivery Charges</span>
                  <span className="row-val font-mono">
                    {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="row-label">GST / Government Taxes (5%)</span>
                  <span className="row-val font-mono">{formatPrice(taxes)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span className="total-label">Payable Amount</span>
                  <span className="total-val font-mono">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-xl w-full place-order-btn"
                disabled={loading || validating}
              >
                {loading
                  ? 'Processing Order...'
                  : paymentMethod === 'razorpay'
                    ? `Pay ${formatPrice(finalTotal)} via Razorpay`
                    : `Place COD Order • ${formatPrice(finalTotal)}`}
              </button>

              <div className="checkout-security-footnote">
                <span>🛡️ 256-Bit SSL Encrypted &amp; HMAC Signature Verified</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

