import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboard();
      setDashboardData(res.data?.data);
    } catch (err) {
      console.error('Fetch admin stats error:', err);
      setError('Failed to fetch dashboard metrics. Check admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchStats();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="spinner" style={{ width: 44, height: 44 }}></div>
        <p>Crunching live kitchen statistics...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="admin-error-state">
        <h2>Dashboard Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  const {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalRevenue,
    popularPizzas = [],
    recentOrders = [],
  } = dashboardData;

  return (
    <div className="admin-dashboard-view page-enter">
      <div className="admin-view-header">
        <div>
          <span className="micro-label">ADMIN CONSOLE</span>
          <h1 className="admin-view-title font-display">EXECUTIVE DASHBOARD</h1>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
          ↻ Refresh Metrics
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="admin-stats-grid">
        <div className="card admin-stat-box">
          <span className="admin-stat-label">Total Revenue</span>
          <strong className="admin-stat-num font-mono">{formatPrice(totalRevenue)}</strong>
          <span className="admin-stat-sub">From delivered orders</span>
        </div>

        <div className="card admin-stat-box">
          <span className="admin-stat-label">Pending Orders</span>
          <strong className="admin-stat-num font-mono text-crimson">{pendingOrders}</strong>
          <span className="admin-stat-sub">Awaiting bake or dispatch</span>
        </div>

        <div className="card admin-stat-box">
          <span className="admin-stat-label">Delivered Orders</span>
          <strong className="admin-stat-num font-mono">{completedOrders}</strong>
          <span className="admin-stat-sub">Out of {totalOrders} total orders</span>
        </div>

        <div className="card admin-stat-box">
          <span className="admin-stat-label">Registered Customers</span>
          <strong className="admin-stat-num font-mono">{totalCustomers}</strong>
          <span className="admin-stat-sub">Verified customer accounts</span>
        </div>
      </div>

      {/* Popular Pizzas Section */}
      <div className="card admin-section-card">
        <h2 className="admin-section-heading">🔥 Most Popular Pizzas</h2>
        <div className="popular-pizzas-list">
          {popularPizzas.length > 0 ? (
            popularPizzas.map((p, idx) => (
              <div key={idx} className="popular-pizza-item">
                <span className="popular-rank font-mono">#{idx + 1}</span>
                <span className="popular-name">{p.name || 'Signature Pizza'}</span>
                <span className="popular-count font-mono">{p.totalOrdered} slices sold</span>
              </div>
            ))
          ) : (
            <p className="text-muted text-sm">No sales order data recorded yet.</p>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card admin-section-card">
        <div className="section-header-row">
          <h2 className="admin-section-heading">Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">
            Manage All Orders →
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="admin-order-link font-mono">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <strong>{ord.customer?.name || 'Customer'}</strong>
                        <small className="text-muted d-block">{ord.customer?.email}</small>
                      </div>
                    </td>
                    <td className="font-mono">{formatPrice(ord.totalAmount)}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(ord.paymentStatus)}`}>
                        {humanizeStatus(ord.paymentStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(ord.orderStatus)}`}>
                        {humanizeStatus(ord.orderStatus)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className="form-select status-select-sm"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
