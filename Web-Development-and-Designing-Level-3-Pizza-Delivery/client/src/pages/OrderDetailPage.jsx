import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../utils/helpers';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
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
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container order-detail-loading">
        <div className="spinner" style={{ width: 44, height: 44 }}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container order-detail-error">
        <h2>Order Not Found</h2>
        <p>{error}</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-detail-page page-enter">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="detail-top-nav">
          <Link to="/orders" className="back-link">
            ← Back to Order History
          </Link>
          <span className="order-date-tag">Placed on {formatDate(order.createdAt)}</span>
        </div>

        {/* Title Bar */}
        <div className="order-title-bar">
          <div>
            <span className="micro-label">ORDER DETAILS</span>
            <h1 className="order-number-title font-mono">{order.orderNumber}</h1>
          </div>
          <div className="status-pills-row">
            <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
              Status: {humanizeStatus(order.orderStatus)}
            </span>
            <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
              Payment: {humanizeStatus(order.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Live Timeline Tracking */}
        <div className="card order-card timeline-card">
          <h2 className="card-title">Live Order Progress</h2>
          <OrderStatusTimeline currentStatus={order.orderStatus} />
        </div>

        {/* Two Column Layout */}
        <div className="order-info-layout">
          {/* Items Column */}
          <div className="card order-card">
            <h2 className="card-title">Items ({order.items?.length})</h2>
            <div className="items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="item-detail-row">
                  <div className="item-name-specs">
                    <strong>{item.pizzaName}</strong>
                    <span>{item.size} • {item.crust} Crust</span>
                    {item.toppings?.length > 0 && (
                      <small className="toppings-text">
                        Extra Toppings: {item.toppings.map((t) => t.name).join(', ')}
                      </small>
                    )}
                    {item.specialInstructions && (
                      <small className="instructions-text">Note: {item.specialInstructions}</small>
                    )}
                  </div>
                  <div className="item-price-side">
                    <span className="font-mono">Qty: {item.quantity}</span>
                    <strong className="font-mono">{formatPrice(item.itemTotal)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="order-breakdown-box">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-mono">−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Delivery Fee</span>
                <span className="font-mono">{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="breakdown-row">
                <span>Taxes (5%)</span>
                <span className="font-mono">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="breakdown-divider"></div>
              <div className="breakdown-row total-row">
                <strong>Grand Total</strong>
                <strong className="font-mono">{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Side */}
          <div className="order-side-info">
            <div className="card order-card">
              <h2 className="card-title">Delivery Information</h2>
              <address className="order-address">
                <p><strong>{order.deliveryAddress?.name}</strong></p>
                <p>📞 {order.deliveryAddress?.phone}</p>
                <p>{order.deliveryAddress?.street}</p>
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}</p>
                {order.deliveryAddress?.instructions && (
                  <p className="rider-note"><em>Rider Note:</em> {order.deliveryAddress.instructions}</p>
                )}
              </address>
            </div>

            <div className="card order-card">
              <h2 className="card-title">Payment Information</h2>
              <div className="payment-fields">
                <div className="p-field">
                  <span>Method:</span>
                  <strong>{order.paymentMethod === 'razorpay' ? 'Razorpay Test Gateway' : 'Cash on Delivery'}</strong>
                </div>
                <div className="p-field">
                  <span>Payment Status:</span>
                  <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
                    {humanizeStatus(order.paymentStatus)}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="p-field">
                    <span>Razorpay ID:</span>
                    <code className="font-mono">{order.razorpayPaymentId}</code>
                  </div>
                )}
              </div>
            </div>

            <Link to="/menu" className="btn btn-primary w-full">
              Order Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
