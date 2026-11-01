import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../utils/helpers';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await orderService.getMyOrders(params);
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="orders-history-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="history-header">
          <div>
            <span className="micro-label">ACCOUNT ACTIVITY</span>
            <h1 className="history-title font-display">YOUR ORDER HISTORY</h1>
          </div>

          {/* Status Filter */}
          <div className="history-filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select filter-select"
              aria-label="Filter orders by status"
            >
              <option value="">All Orders</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="orders-list-loading">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card order-history-skeleton">
                <div className="skeleton" style={{ height: '30px', width: '40%' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '70%' }}></div>
                <div className="skeleton" style={{ height: '40px', marginTop: '12px' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="history-feedback-state error">
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={() => setStatusFilter('')}>Reset</button>
          </div>
        ) : orders.length > 0 ? (
          <div className="orders-history-list">
            {orders.map((order) => (
              <div key={order._id} className="card order-history-card">
                <div className="history-card-header">
                  <div>
                    <span className="order-number font-mono">{order.orderNumber}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="history-status-pills">
                    <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
                      {humanizeStatus(order.orderStatus)}
                    </span>
                    <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
                      {humanizeStatus(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="history-card-items">
                  {order.items?.map((item, idx) => (
                    <span key={idx} className="item-summary-pill">
                      {item.quantity}x {item.pizzaName} ({item.size})
                    </span>
                  ))}
                </div>

                <div className="history-card-footer">
                  <div className="history-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-val font-mono">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                    View Details &amp; Tracking →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-feedback-state empty">
            <span className="empty-icon">📦</span>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet, or no orders match the selected filter.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu &amp; Order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

