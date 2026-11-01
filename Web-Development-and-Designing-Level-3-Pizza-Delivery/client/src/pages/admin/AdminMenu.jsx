import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { pizzaService } from '../../services';
import { formatPrice } from '../../utils/helpers';
import './AdminMenu.css';

const CATEGORIES = ['Classic', 'Veggie', 'Cheese Lovers', 'Spicy', 'Specialty', 'BBQ'];

const AdminMenu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Classic',
    imageUrl: '',
    basePrice: 199,
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      setError(null);
      // In admin mode, pass available=undefined to receive all pizzas
      const res = await pizzaService.getAll({ limit: 100, sort: 'name' });
      setPizzas(res.data?.data || []);
    } catch (err) {
      console.error('Fetch admin pizzas error:', err);
      setError('Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const handleOpenAdd = () => {
    setEditingPizza(null);
    setFormData({
      name: '',
      description: '',
      category: 'Classic',
      imageUrl: '',
      basePrice: 199,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pizza) => {
    setEditingPizza(pizza);
    setFormData({
      name: pizza.name,
      description: pizza.description,
      category: pizza.category,
      imageUrl: pizza.imageUrl || '',
      basePrice: pizza.basePrice,
      isVeg: pizza.isVeg,
      isFeatured: !!pizza.isFeatured,
      isAvailable: pizza.isAvailable !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      return toast.error('Name and description are required.');
    }
    if (formData.basePrice < 0) {
      return toast.error('Price cannot be negative.');
    }

    try {
      setSubmitting(true);
      if (editingPizza) {
        await pizzaService.update(editingPizza._id, formData);
        toast.success(`"${formData.name}" updated successfully!`);
      } else {
        await pizzaService.create(formData);
        toast.success(`"${formData.name}" added to menu!`);
      }
      setShowModal(false);
      fetchPizzas();
    } catch (err) {
      console.error('Save pizza error:', err);
      toast.error(err.response?.data?.message || 'Failed to save pizza.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailable = async (pizza) => {
    try {
      await pizzaService.update(pizza._id, { isAvailable: !pizza.isAvailable });
      toast.success(
        `"${pizza.name}" marked as ${!pizza.isAvailable ? 'Available' : 'Unavailable'}`
      );
      fetchPizzas();
    } catch (err) {
      console.error('Toggle availability error:', err);
      toast.error('Failed to change status.');
    }
  };

  const handleDelete = async (pizzaId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the menu?`)) {
      return;
    }
    try {
      await pizzaService.delete(pizzaId);
      toast.success(`"${name}" deleted from menu.`);
      fetchPizzas();
    } catch (err) {
      console.error('Delete pizza error:', err);
      toast.error('Failed to delete pizza.');
    }
  };

  return (
    <div className="admin-menu-page page-enter">
      <div className="admin-view-header">
        <div>
          <span className="micro-label">CATALOG CONTROL</span>
          <h1 className="admin-view-title font-display">MENU &amp; RECIPES</h1>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Create New Pizza
        </button>
      </div>

      {/* Pizzas List / Table */}
      <div className="card admin-menu-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner" style={{ width: 36, height: 36 }}></div>
            <p>Loading menu items...</p>
          </div>
        ) : error ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchPizzas}>Retry</button>
          </div>
        ) : pizzas.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pizza</th>
                  <th>Category</th>
                  <th>Dietary</th>
                  <th>Base Price</th>
                  <th>Featured</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pizzas.map((pizza) => (
                  <tr key={pizza._id} className={!pizza.isAvailable ? 'row-inactive' : ''}>
                    <td>
                      <div className="admin-pizza-cell">
                        <img
                          src={pizza.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop'}
                          alt={pizza.name}
                          className="admin-pizza-thumb"
                        />
                        <div>
                          <strong>{pizza.name}</strong>
                          <p className="text-muted admin-desc-snippet">{pizza.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-forest">{pizza.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${pizza.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                        {pizza.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="font-mono">{formatPrice(pizza.basePrice)}</td>
                    <td>
                      {pizza.isFeatured ? (
                        <span className="badge badge-primary">★ Featured</span>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`toggle-avail-btn ${pizza.isAvailable ? 'is-available' : 'is-unavailable'}`}
                        onClick={() => handleToggleAvailable(pizza)}
                      >
                        {pizza.isAvailable ? '● Available' : '○ Sold Out'}
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEdit(pizza)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(pizza._id, pizza.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <p>No menu items found. Click "+ Create New Pizza" to add one.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Pizza Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="card admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="modal-title font-display">
                {editingPizza ? 'Edit Menu Pizza' : 'Add New Artisan Pizza'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-pizza-form">
              <div className="form-group">
                <label className="form-label" htmlFor="m-name">Pizza Name *</label>
                <input
                  type="text"
                  id="m-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Truffle Mushroom & Ricotta"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="m-cat">Category *</label>
                  <select
                    id="m-cat"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="m-price">Base Price (INR) *</label>
                  <input
                    type="number"
                    id="m-price"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    min="0"
                    step="1"
                    className="form-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-desc">Description *</label>
                <textarea
                  id="m-desc"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the sauce, cheese, herbs and flavor profile..."
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-img">Image URL</label>
                <input
                  type="url"
                  id="m-img"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div className="form-checkboxes-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  <span>Vegetarian Recipe</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span>Active &amp; Available for Ordering</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingPizza ? 'Update Pizza' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;

