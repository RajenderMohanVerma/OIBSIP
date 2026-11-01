import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import OrderStatusTimeline from '../../components/common/OrderStatusTimeline';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../../utils/helpers';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getOrderDetail(id);
      const ord = res.data?.data?.order;
      setOrder(ord);
      setNewStatus(ord?.orderStatus || 'placed');
    } catch (err) {
      console.error('Fetch admin order detail error:', err);
      setError('Unable to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(id, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      toast.success(`Order status updated to ${newStatus}`);
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="spinner" style={{ width: 44, height: 44 }}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-error-state">
        <h2>Order Not Found</h2>
        <p>{error}</p>
        <Link to="/admin/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="admin-order-detail-view page-enter">
      <div className="admin-view-header">
        <div>
          <Link to="/admin/orders" className="back-link">← All Orders</Link>
          <span className="micro-label" style={{ marginTop: '8px', display: 'block' }}>ORDER INSPECTION</span>
          <h1 className="admin-view-title font-mono">{order.orderNumber}</h1>
        </div>
        <div className="admin-order-badges">
          <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
            Order: {humanizeStatus(order.orderStatus)}
          </span>
          <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
            Payment: {humanizeStatus(order.paymentStatus)}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="card admin-detail-card">
        <h2 className="admin-card-title">Order Lifecycle Timeline</h2>
        <OrderStatusTimeline currentStatus={order.orderStatus} />
      </div>

      <div className="admin-detail-layout">
        {/* Left Column: Items & Pricing */}
        <div className="admin-detail-main">
          <div className="card admin-detail-card">
            <h2 className="admin-card-title">Ordered Pizzas &amp; Customizations</h2>

            <div className="admin-order-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="admin-order-item-row">
                  <div className="admin-item-info">
                    <strong>{item.pizzaName}</strong>
                    <span>{item.size} • {item.crust} Crust</span>
                    {item.toppings?.length > 0 && (
                      <small className="text-muted">
                        Toppings: {item.toppings.map(t => `${t.name} (₹${t.price})`).join(', ')}
                      </small>
                    )}
                    {item.specialInstructions && (
                      <p className="admin-item-note">Kitchen Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="admin-item-numbers font-mono">
                    <span>{item.quantity} x {formatPrice(item.unitPrice)}</span>
                    <strong>{formatPrice(item.itemTotal)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="admin-totals-box">
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
                <span>Delivery Fee</span>
                <span className="font-mono">{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="totals-row">
                <span>Taxes &amp; GST (5%)</span>
                <span className="font-mono">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="totals-divider"></div>
              <div className="totals-row grand-total">
                <strong>Grand Total</strong>
                <strong className="font-mono">{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Status Change Audit Log */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="card admin-detail-card">
              <h2 className="admin-card-title">Status Transition Audit Trail</h2>
              <div className="status-audit-list">
                {order.statusHistory.map((sh, idx) => (
                  <div key={idx} className="status-audit-row">
                    <span className="audit-dot"></span>
                    <div>
                      <strong>{humanizeStatus(sh.status)}</strong>
                      <span className="audit-time text-muted"> • {formatDate(sh.updatedAt)}</span>
                      {sh.note && <p className="audit-note">{sh.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Update Status & Customer Details */}
        <div className="admin-detail-side">
          {/* Status Update Control */}
          <div className="card admin-detail-card">
            <h2 className="admin-card-title">Update Order Workflow</h2>
            <form onSubmit={handleUpdateStatus} className="status-update-form">
              <div className="form-group">
                <label className="form-label" htmlFor="newStatus">New Stage *</label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="placed">Order Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">In the Oven (Preparing)</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="statusNote">Kitchen / Audit Note</label>
                <input
                  type="text"
                  id="statusNote"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched with rider Rahul..."
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm w-full"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Save Stage Transition'}
              </button>
            </form>
          </div>

          {/* Customer & Address Details */}
          <div className="card admin-detail-card">
            <h2 className="admin-card-title">Customer Information</h2>
            <div className="admin-customer-details">
              <p><strong>Name:</strong> {order.customer?.name || order.deliveryAddress?.name}</p>
              <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {order.deliveryAddress?.phone}</p>
            </div>

            <h3 className="admin-subheading">Delivery Destination</h3>
            <address className="admin-delivery-addr">
              <p>{order.deliveryAddress?.street}</p>
              <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}</p>
              {order.deliveryAddress?.instructions && (
                <p className="admin-rider-note"><em>Rider Note:</em> {order.deliveryAddress.instructions}</p>
              )}
            </address>
          </div>

          {/* Payment Technical Details */}
          <div className="card admin-detail-card">
            <h2 className="admin-card-title">Payment &amp; Gateway References</h2>
            <div className="admin-payment-info">
              <p><strong>Method:</strong> {order.paymentMethod === 'razorpay' ? 'Razorpay (Test Mode)' : 'Cash on Delivery'}</p>
              <p><strong>Payment Status:</strong> {humanizeStatus(order.paymentStatus)}</p>
              {order.razorpayOrderId && <p><strong>Razorpay Order:</strong> <code className="font-mono">{order.razorpayOrderId}</code></p>}
              {order.razorpayPaymentId && <p><strong>Razorpay Payment:</strong> <code className="font-mono">{order.razorpayPaymentId}</code></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
