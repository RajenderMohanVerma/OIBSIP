import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../utils/helpers';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders({ limit: 5 });
        const orders = res.data?.data || [];
        setRecentOrders(orders);

        // Compute client stats
        const active = orders.filter((o) =>
          ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.orderStatus)
        ).length;

        const spent = orders.reduce((sum, o) => {
          return o.paymentStatus === 'paid' ? sum + o.totalAmount : sum;
        }, 0);

        setStats({
          totalOrders: res.data?.pagination?.total || orders.length,
          activeOrders: active,
          totalSpent: spent,
        });
      } catch (err) {
        console.error('Error fetching dashboard orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-page page-enter">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-welcome-banner">
          <div>
            <span className="micro-label">CUSTOMER DASHBOARD</span>
            <h1 className="welcome-name font-display">
              WELCOME BACK, {user?.name?.toUpperCase() || 'FRIEND'}
            </h1>
            <p className="welcome-sub">
              Manage your pizza orders, tracked deliveries, and saved artisan preferences.
            </p>
          </div>
          <Link to="/menu" className="btn btn-primary">
            + Order Fresh Pizza
          </Link>
        </div>

        {/* Stats Row */}
        <div className="dashboard-stats-grid">
          <div className="card stat-card">
            <span className="stat-label">Total Pizzas Ordered</span>
            <strong className="stat-value font-mono">{stats.totalOrders}</strong>
            <span className="stat-sub">Lifetime orders with us</span>
          </div>

          <div className="card stat-card">
            <span className="stat-label">Active Orders</span>
            <strong className="stat-value font-mono" style={{ color: '#f28b87' }}>
              {stats.activeOrders}
            </strong>
            <span className="stat-sub">Currently baking or en route</span>
          </div>

          <div className="card stat-card">
            <span className="stat-label">Total Paid Spend</span>
            <strong className="stat-value font-mono">{formatPrice(stats.totalSpent)}</strong>
            <span className="stat-sub">Verified payments</span>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="dashboard-shortcuts-row">
          <Link to="/menu" className="shortcut-card">
            <span className="shortcut-icon">🍕</span>
            <div>
              <strong>Explore Full Menu</strong>
              <p>Browse Neapolitan and gourmet creations</p>
            </div>
          </Link>
          <Link to="/orders" className="shortcut-card">
            <span className="shortcut-icon">📦</span>
            <div>
              <strong>Order History</strong>
              <p>View past receipts and reorder items</p>
            </div>
          </Link>
          <Link to="/profile" className="shortcut-card">
            <span className="shortcut-icon">⚙️</span>
            <div>
              <strong>Account &amp; Addresses</strong>
              <p>Manage phone number and delivery addresses</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="dashboard-recent-section">
          <div className="section-header">
            <div>
              <span className="micro-label">RECENT PURCHASES</span>
              <h2 className="section-title font-display">LATEST ORDERS</h2>
            </div>
            <Link to="/orders" className="btn btn-ghost btn-sm">
              All Orders →
            </Link>
          </div>

          {loading ? (
            <div className="recent-orders-skeleton">
              <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '80px' }}></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="recent-orders-list">
              {recentOrders.map((order) => (
                <div key={order._id} className="card recent-order-item">
                  <div className="recent-order-info">
                    <span className="recent-order-num font-mono">{order.orderNumber}</span>
                    <span className="recent-order-date">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="recent-order-pills">
                    <span className={`status-pill ${getStatusClass(order.orderStatus)}`}>
                      {humanizeStatus(order.orderStatus)}
                    </span>
                    <span className={`status-pill ${getStatusClass(order.paymentStatus)}`}>
                      {humanizeStatus(order.paymentStatus)}
                    </span>
                  </div>

                  <div className="recent-order-amount font-mono">
                    {formatPrice(order.totalAmount)}
                  </div>

                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-orders">
              <p>You haven't placed an order yet.</p>
              <Link to="/menu" className="btn btn-primary btn-sm">Order Your First Pizza</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
