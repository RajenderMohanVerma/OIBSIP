import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--color-crimson)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6l1.5 3.5L17 10l-2.5 2.5.5 3.5L12 14.5l-3 1.5.5-3.5L7 10l3.5-.5L12 6z"/>
              </svg>
              <span className="font-display footer-brand-name">Crust &amp; Craft</span>
            </div>
            <p className="footer-tagline">Good Pizza. Great Moments.</p>
            <p className="footer-bio">
              Artisan hand-stretched dough, San Marzano tomato reduction, and fresh seasonal ingredients baked to crisp perfection.
            </p>
            <div className="footer-demo-badge">
              <span className="demo-indicator"></span>
              <span>Oasis Infobyte Internship — Level 3 Project (Test Mode)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Full Menu</Link></li>
              <li><a href="/#story">Our Story</a></li>
              <li><a href="/#offers">Special Offers</a></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h3 className="footer-heading">Pizza Styles</h3>
            <ul className="footer-links">
              <li><Link to="/menu?category=Classic">Classic Neapolitan</Link></li>
              <li><Link to="/menu?category=Veggie">Garden Harvest</Link></li>
              <li><Link to="/menu?category=Cheese+Lovers">Cheese Lovers</Link></li>
              <li><Link to="/menu?category=Spicy">The Inferno (Spicy)</Link></li>
              <li><Link to="/menu?category=BBQ">Smokestack BBQ</Link></li>
              <li><Link to="/menu?category=Specialty">Artisanal Specialty</Link></li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="footer-col" id="contact">
            <h3 className="footer-heading">Kitchen &amp; Contact</h3>
            <address className="footer-contact">
              <p>📍 42 Artisan Way, Culinary District, Mumbai</p>
              <p>📞 +91 (022) 5550-PIZZA <span className="text-muted">(Demo)</span></p>
              <p>✉️ orders@crustandcraft.dev <span className="text-muted">(Demo)</span></p>
              <p>🕒 Mon – Sun: 11:00 AM – 11:30 PM</p>
              <p className="footer-payment-note">💳 Razorpay Test Mode &amp; Cash on Delivery</p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Crust &amp; Craft. Developed by <strong>Rajender Mohan</strong> for <strong>Oasis Infobyte Internship Level 3</strong>.
          </p>
          <div className="footer-legal">
            <a href="#terms">Terms &amp; Conditions</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#testmode">Payment Test Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
