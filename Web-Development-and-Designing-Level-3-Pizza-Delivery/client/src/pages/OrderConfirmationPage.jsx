import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../utils/helpers';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        setOrder(res.data?.data?.order);
      } catch (err) {
        console.error('Fetch order error:', err);
        setError('Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container confirmation-loading">
        <div className="spinner" style={{ width: 44, height: 44 }}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container confirmation-error">
        <h2>Order Not Found</h2>
        <p>{error || 'This order does not exist or access is unauthorized.'}</p>
        <Link to="/orders" className="btn btn-primary">My Orders</Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page page-enter">
      <div className="container">
        {/* Success Banner */}
        <div className="confirmation-banner">
          <div className="banner-icon-circle">✓</div>
          <span className="micro-label">ORDER PLACED SUCCESSFULLY</span>
          <h1 className="confirmation-title font-display">THE OVEN IS HEATING UP!</h1>
          <p className="confirmation-subtitle">
            Thank you for dining with Crust &amp; Craft. Your artisan order has been received and our pizzaiolos are preparing your pie.
          </p>
          <div className="confirmation-order-id">
            <span>Order Reference: </span>
            <strong className="font-mono">{order.orderNumber}</strong>
          </div>
        </div>

        {/* Live Timeline Card */}
        <div className="confirmation-card timeline-section-card">
          <div className="timeline-header-row">
            <div>
              <h2 className="card-heading">Order Preparation Timeline</h2>
              <p className="card-sub">Follow each craft stage as your pizza is hand-tossed and baked.</p>
            </div>
            <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
              {humanizeStatus(order.orderStatus)}
            </span>
          </div>

          <OrderStatusTimeline currentStatus={order.orderStatus} />
        </div>

        {/* Two-Column Details Breakdown */}
        <div className="confirmation-grid">
          {/* Left: Ordered Items */}
          <div className="confirmation-card">
            <h2 className="card-heading">Pizzas In This Order ({order.items?.length})</h2>

            <div className="confirmed-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="confirmed-item-row">
                  <div className="confirmed-item-main">
                    <h3 className="confirmed-item-name">{item.pizzaName}</h3>
                    <p className="confirmed-item-specs">
                      {item.size} • {item.crust} Crust
                      {item.toppings?.length > 0 && ` • +${item.toppings.map(t => t.name).join(', ')}`}
                    </p>
                    {item.specialInstructions && (
                      <p className="confirmed-item-note">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="confirmed-item-pricing">
                    <span className="qty-tag font-mono">Qty: {item.quantity}</span>
                    <span className="price-tag font-mono">{formatPrice(item.itemTotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="confirmed-totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="totals-row discount">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span className="font-mono">−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>Delivery Charge</span>
                <span className="font-mono">{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="totals-row">
                <span>Taxes &amp; GST</span>
                <span className="font-mono">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="totals-divider"></div>
              <div className="totals-row grand-total">
                <strong>Grand Total</strong>
                <strong className="font-mono">{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment Details */}
          <div className="confirmation-side-col">
            {/* Delivery Info */}
            <div className="confirmation-card">
              <h2 className="card-heading">Delivery Address</h2>
              <address className="confirmed-address">
                <p><strong>{order.deliveryAddress?.name}</strong></p>
                <p>📞 {order.deliveryAddress?.phone}</p>
                <p>{order.deliveryAddress?.street}</p>
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}</p>
                {order.deliveryAddress?.instructions && (
                  <p className="address-instr"><em>Rider Note:</em> {order.deliveryAddress.instructions}</p>
                )}
              </address>
            </div>

            {/* Payment Info */}
            <div className="confirmation-card">
              <h2 className="card-heading">Payment Overview</h2>
              <div className="payment-summary-rows">
                <div className="payment-row">
                  <span className="p-label">Method:</span>
                  <span className="p-val">
                    {order.paymentMethod === 'razorpay' ? '💳 Razorpay Online Gateway' : '💵 Cash on Delivery'}
                  </span>
                </div>
                <div className="payment-row">
                  <span className="p-label">Payment Status:</span>
                  <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
                    {humanizeStatus(order.paymentStatus)}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="payment-row">
                    <span className="p-label">Razorpay Reference:</span>
                    <span className="p-val font-mono">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="payment-row">
                  <span className="p-label">Ordered On:</span>
                  <span className="p-val">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <Link to="/orders" className="btn btn-secondary w-full">
                View My Orders History
              </Link>
              <Link to="/menu" className="btn btn-primary w-full">
                Order Another Pizza
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
