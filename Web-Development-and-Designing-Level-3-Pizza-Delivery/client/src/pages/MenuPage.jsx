import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pizzaService } from '../services';
import PizzaCard from '../components/common/PizzaCard';
import './MenuPage.css';

const CATEGORIES = ['All', 'Classic', 'Veggie', 'Cheese Lovers', 'Spicy', 'BBQ', 'Specialty'];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('-popularity');
  const [vegOnly, setVegOnly] = useState(false);

  // Sync debounced search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update query params when state changes
  useEffect(() => {
    const params = {};
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (debouncedSearch) params.search = debouncedSearch;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, debouncedSearch, setSearchParams]);

  // Fetch pizzas from backend
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          sort: sortBy,
        };
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (vegOnly) {
          params.isVeg = true;
        }

        const res = await pizzaService.getAll(params);
        setPizzas(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load menu pizzas:', err);
        setError('Failed to fetch the pizza menu. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [selectedCategory, debouncedSearch, sortBy, vegOnly]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setDebouncedSearch('');
    setVegOnly(false);
    setSortBy('-popularity');
  };

  return (
    <div className="menu-page page-enter">
      {/* ─── Menu Header ─── */}
      <section className="menu-header-section">
        <div className="container">
          <span className="micro-label">THE COMPLETE COLLECTION</span>
          <h1 className="menu-title font-display">THE ARTISAN REPERTOIRE</h1>
          <p className="menu-subtitle">
            Every pizza begins with slow-fermented Italian dough, fired at intense heat on stone hearths. Select a pie below or customise every layer to your palate.
          </p>
        </div>
      </section>

      {/* ─── Controls Bar ─── */}
      <section className="menu-controls-section">
        <div className="container">
          <div className="controls-grid">
            {/* Search Input */}
            <div className="search-control-wrapper">
              <input
                type="text"
                placeholder="Search pizzas by name or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-control-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select sort-select"
                aria-label="Sort menu items"
              >
                <option value="-popularity">Popularity (Most Ordered)</option>
                <option value="basePrice">Price: Low to High</option>
                <option value="-basePrice">Price: High to Low</option>
              </select>
            </div>

            {/* Veg Only Toggle */}
            <div className="veg-toggle-wrapper">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-custom"></span>
                <span className="toggle-text">Veg Only</span>
              </label>
            </div>
          </div>

          {/* Category Chips */}
          <div className="category-chips-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Menu Grid Content ─── */}
      <section className="menu-grid-section">
        <div className="container">
          {loading ? (
            <div className="pizzas-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="card skeleton-card">
                  <div className="skeleton" style={{ height: '220px' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '22px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '100%' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '85%' }}></div>
                    <div className="skeleton" style={{ height: '38px', marginTop: '16px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="menu-feedback-state error">
              <span className="feedback-icon">⚠️</span>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={clearFilters}>Reset Filters &amp; Retry</button>
            </div>
          ) : pizzas.length > 0 ? (
            <>
              <div className="menu-results-count">
                <span>Showing {pizzas.length} handcrafted {pizzas.length === 1 ? 'pizza' : 'pizzas'}</span>
              </div>
              <div className="pizzas-grid">
                {pizzas.map((pizza) => (
                  <PizzaCard key={pizza._id} pizza={pizza} />
                ))}
              </div>
            </>
          ) : (
            <div className="menu-feedback-state empty">
              <span className="feedback-icon">🍕</span>
              <h3>No pizzas found</h3>
              <p>We couldn't find any pizzas matching your current filters or search term.</p>
              <button className="btn btn-primary btn-sm" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MenuPage;
