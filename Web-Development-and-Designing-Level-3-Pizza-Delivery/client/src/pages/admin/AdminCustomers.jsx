import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { formatDate } from '../../utils/helpers';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getCustomers(params);
      setCustomers(res.data?.data || []);
      setPagination(res.data?.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Fetch customers error:', err);
      setError('Failed to fetch customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="admin-customers-page page-enter">
      <div className="admin-view-header">
        <div>
          <span className="micro-label">CUSTOMER DIRECTORY</span>
          <h1 className="admin-view-title font-display">REGISTERED MEMBERS</h1>
        </div>
        <span className="admin-order-count font-mono">
          Total: {pagination.total} Registered Accounts
        </span>
      </div>

      {/* Search Header */}
      <div className="card admin-search-card">
        <form onSubmit={handleSearchSubmit} className="order-search-form">
          <input
            type="text"
            placeholder="Search by customer name or email..."
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
              onClick={() => { setSearch(''); setPage(1); fetchCustomers(); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Customers Table */}
      <div className="card admin-customers-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner" style={{ width: 36, height: 36 }}></div>
            <p>Loading member directory...</p>
          </div>
        ) : error ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchCustomers}>Retry</button>
          </div>
        ) : customers.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Joined Date</th>
                  <th>Total Orders Placed</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="cust-avatar">
                          {c.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span className="text-muted">—</span>}</td>
                    <td className="text-muted">{formatDate(c.createdAt)}</td>
                    <td>
                      <span className="order-count-badge font-mono">
                        {c.orderCount || 0} orders
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${c.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <p>No customers match the search criteria.</p>
          </div>
        )}

        {/* Pagination */}
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

export default AdminCustomers;
