import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const PizzaIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--color-crimson)' }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M12 6l1.5 3.5L17 10l-2.5 2.5.5 3.5L12 14.5l-3 1.5.5-3.5L7 10l3.5-.5L12 6z"/>
  </svg>
);

const CartIcon = ({ count }) => (
  <div className="cart-icon-wrapper" aria-label={`Cart, ${count} item${count !== 1 ? 's' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    {count > 0 && <span className="cart-badge" aria-hidden="true">{count > 9 ? '9+' : count}</span>}
  </div>
);

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <header className="navbar" role="banner">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu} aria-label="Crust & Craft Home">
          <PizzaIcon />
          <span className="navbar-brand-text font-display">Crust &amp; Craft</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Menu
          </NavLink>
          <a href="/#story" className="nav-link" onClick={() => closeMenu()}>
            Our Story
          </a>
          <a href="/#offers" className="nav-link" onClick={() => closeMenu()}>
            Offers
          </a>
          <a href="/#contact" className="nav-link" onClick={() => closeMenu()}>
            Contact
          </a>
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link admin-link active' : 'nav-link admin-link'}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Search Toggle */}
          <div className="navbar-search-wrapper">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <input
                  type="text"
                  placeholder="Search pizza..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                  autoFocus
                />
                <button type="submit" className="navbar-search-submit" aria-label="Submit search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
                <button type="button" className="navbar-search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
                  ✕
                </button>
              </form>
            ) : (
              <button
                className="navbar-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                title="Search menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="navbar-cart-btn" aria-label={`Shopping cart with ${itemCount} items`}>
            <CartIcon count={itemCount} />
          </Link>

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button
                className="user-menu-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className="user-avatar" aria-hidden="true">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown" role="menu" aria-label="Account options">
                  <Link to="/dashboard" className="dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/orders" className="dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    My Orders
                  </Link>
                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    Profile &amp; Address
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="dropdown-item admin" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      Admin Console
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" role="menuitem" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <input
              type="text"
              placeholder="Search pizzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>

          <NavLink to="/" end className="mobile-nav-link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/menu" className="mobile-nav-link" onClick={closeMenu}>Menu</NavLink>
          <a href="/#story" className="mobile-nav-link" onClick={closeMenu}>Our Story</a>
          <a href="/#offers" className="mobile-nav-link" onClick={closeMenu}>Offers</a>
          <a href="/#contact" className="mobile-nav-link" onClick={closeMenu}>Contact</a>
          <NavLink to="/cart" className="mobile-nav-link" onClick={closeMenu}>
            Shopping Cart ({itemCount})
          </NavLink>
          
          <div className="mobile-nav-divider"></div>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>My Dashboard</NavLink>
              <NavLink to="/orders" className="mobile-nav-link" onClick={closeMenu}>My Orders</NavLink>
              <NavLink to="/profile" className="mobile-nav-link" onClick={closeMenu}>Profile</NavLink>
              {isAdmin && (
                <NavLink to="/admin/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                  Admin Console
                </NavLink>
              )}
              <button className="mobile-nav-link mobile-logout" onClick={() => { handleLogout(); closeMenu(); }}>
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-btns">
              <Link to="/login" className="btn btn-secondary w-full" onClick={closeMenu}>Log In</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={closeMenu}>Sign Up</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
