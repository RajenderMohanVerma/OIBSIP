import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg('Full Name must be at least 2 characters.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Valid email is required.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setErrorMsg('Password must include at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setErrorMsg('Password must include at least one number.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.phone.trim()
      );
      toast.success('Registration successful! Welcome to Crust & Craft.');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-card-header">
            <span className="micro-label">NEW MEMBERSHIP</span>
            <h1 className="auth-title font-display">CREATE AN ACCOUNT</h1>
            <p className="auth-sub">Join Crust &amp; Craft for fast ordering, custom saved pies, and special offers.</p>
          </div>

          {errorMsg && (
            <div className="auth-error-banner" role="alert">
              <span>⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="aarav@example.com"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label className="form-label" htmlFor="password">Password *</label>
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className="form-input"
                autoComplete="new-password"
                required
              />
              <span className="form-hint">Must contain at least 8 characters, an uppercase letter &amp; a number.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="form-input"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Registering Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="auth-footer-link">
            <span>Already have an account?</span>
            <Link to="/login" state={{ from: location.state?.from }} className="auth-link">
              Sign In here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
