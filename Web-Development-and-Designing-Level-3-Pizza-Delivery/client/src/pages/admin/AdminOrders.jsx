import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { formatPrice, formatDate, humanizeStatus, getStatusClass } from '../../utils/helpers';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (paymentStatus) params.paymentStatus = paymentStatus;

      const res = await adminService.getOrders(params);
      setOrders(res.data?.data || []);
      setPagination(res.data?.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      setError('Failed to fetch orders. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrders();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update order status.');
    }
  };

  return (
    <div className="admin-orders-page page-enter">
      <div className="admin-view-header">
        <div>
          <span className="micro-label">ADMINISTRATION</span>
          <h1 className="admin-view-title font-display">LIVE ORDER MANAGEMENT</h1>
        </div>
        <span className="admin-order-count font-mono">
          Total: {pagination.total} Orders
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card admin-orders-controls">
        <form onSubmit={handleSearchSubmit} className="order-search-form">
          <input
            type="text"
            placeholder="Search order reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input search-input-admin"
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); fetchOrders(); }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="order-filters-group">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="form-select filter-select-admin"
            aria-label="Filter by order status"
          >
            <option value="">All Order Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            className="form-select filter-select-admin"
            aria-label="Filter by payment status"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="not_applicable">Cash on Delivery</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card admin-orders-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner" style={{ width: 36, height: 36 }}></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchOrders}>Retry</button>
          </div>
        ) : orders.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Placed Date</th>
                  <th>Status Workflow</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="admin-order-link font-mono">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <strong>{ord.customer?.name || 'Customer'}</strong>
                        <small className="text-muted d-block">{ord.customer?.phone || ord.customer?.email}</small>
                      </div>
                    </td>
                    <td>{ord.items?.length} items</td>
                    <td className="font-mono">{formatPrice(ord.totalAmount)}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(ord.paymentStatus)}`}>
                        {humanizeStatus(ord.paymentStatus)}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(ord.createdAt)}</td>
                    <td>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
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
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="btn btn-ghost btn-sm">
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <p>No orders match the current search or filters.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination-bar">
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <span className="page-indicator font-mono">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
