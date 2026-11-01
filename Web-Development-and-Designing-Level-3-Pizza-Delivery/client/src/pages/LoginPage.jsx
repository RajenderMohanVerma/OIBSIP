import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await login(email.trim(), password);
      toast.success('Welcome back to Crust & Craft!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCustomer = () => {
    setEmail('customer@demo.com');
    setPassword('Customer@123');
    setErrorMsg(null);
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@crustandcraft.dev');
    setPassword('Admin@123456');
    setErrorMsg(null);
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-card-header">
            <span className="micro-label">MEMBER ACCESS</span>
            <h1 className="auth-title font-display">WELCOME BACK</h1>
            <p className="auth-sub">Sign in to your Crust &amp; Craft account to place and track orders.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-banner" role="alert">
              <span>⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label className="form-label" htmlFor="password">Password</label>
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="demo-credentials-box">
            <span className="demo-hint-label">Quick Testing Credentials:</span>
            <div className="demo-buttons-row">
              <button type="button" onClick={handleFillDemoCustomer} className="btn-demo-quick">
                Fill Demo Customer
              </button>
              <button type="button" onClick={handleFillDemoAdmin} className="btn-demo-quick">
                Fill Demo Admin
              </button>
            </div>
          </div>

          <div className="auth-footer-link">
            <span>Don't have an account yet?</span>
            <Link to="/register" state={{ from: location.state?.from }} className="auth-link">
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
