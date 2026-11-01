import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pizzaService } from '../services';
import PizzaCard from '../components/common/PizzaCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Classic', desc: 'Neapolitan foundations & Italian tradition', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop' },
  { name: 'Veggie', desc: 'Fresh crisp produce & roasted vegetables', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop' },
  { name: 'Cheese Lovers', desc: 'Four-cheese & truffle infused blends', img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=500&auto=format&fit=crop' },
  { name: 'Spicy', desc: 'Chilli crunch, ghost pepper & hot honey', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop' },
  { name: 'BBQ', desc: 'Smokestack slow-roasted chicken & bacon', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop' },
  { name: 'Specialty', desc: 'Desi paneer tikka & Mediterranean flair', img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop' },
];

const REVIEWS = [
  {
    name: 'Aarav Sharma',
    role: 'Verified Customer (Demo)',
    rating: 5,
    comment: 'The crust fermentation is phenomenal — crisp on the outside and airy inside. The Pepperoni Perfection is unmatched!',
  },
  {
    name: 'Priya Mehra',
    role: 'Food Blogger (Demo)',
    rating: 5,
    comment: 'Cheese Nirvana lived up to its name. Five artisanal cheeses and real truffle aroma delivered piping hot in 30 minutes.',
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Weekend Regular (Demo)',
    rating: 5,
    comment: 'Flawless checkout experience with Razorpay test mode. The order tracking timeline kept me updated every minute.',
  },
];

const HomePage = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await pizzaService.getFeatured();
        setFeaturedPizzas(res.data?.data?.pizzas || []);
      } catch (err) {
        console.error('Failed to load featured pizzas:', err);
        setError('Could not load featured pizzas. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page page-enter">
      {/* ─── Hero Section ─── */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="micro-label hero-eyebrow">CRAFTED FRESH. SERVED HOT.</span>
            <h1 className="hero-title font-display">
              A SLICE OF <br />
              <span className="hero-title-accent">SOMETHING</span> <br />
              DIFFERENT.
            </h1>
            <p className="hero-subtitle">
              Handcrafted pizzas, bold flavours, and fresh ingredients. Your next favourite slice is only a few clicks away.
            </p>

            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-xl">
                ORDER YOUR PIZZA
              </Link>
              <Link to="/menu" className="btn btn-secondary btn-xl">
                EXPLORE THE MENU
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="stat-number">48h</span>
                <span className="stat-desc">Slow Dough Ferment</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="stat-number">450°C</span>
                <span className="stat-desc">Stone Hearth Bake</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-desc">Fresh Mozzarella</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop"
                alt="Signature Artisan Handcrafted Pizza"
                className="hero-main-img"
              />
              <div className="hero-floating-pill">
                <span className="pill-dot"></span>
                <span>🔥 Oven fresh in under 30 mins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Promo Banner (Special Offers) ─── */}
      <section className="promo-banner" id="offers">
        <div className="container promo-banner-inner">
          <div className="promo-content">
            <span className="micro-label">LIMITED TIME PROMOTIONS</span>
            <h2 className="promo-title">Handmade Flavours. Honest Deals.</h2>
            <p className="promo-desc">Use our test discount coupons during checkout to enjoy authentic savings.</p>
          </div>
          <div className="promo-coupons">
            <div className="coupon-chip">
              <span className="coupon-code">WELCOME20</span>
              <span className="coupon-details">20% OFF up to ₹100 (Min. ₹299)</span>
            </div>
            <div className="coupon-chip">
              <span className="coupon-code">FLAT50</span>
              <span className="coupon-details">Flat ₹50 OFF (Min. ₹499)</span>
            </div>
            <div className="coupon-chip">
              <span className="coupon-code">CRAFTDAY</span>
              <span className="coupon-details">15% OFF up to ₹80 (Min. ₹399)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Pizzas Section ─── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="micro-label">CURATED SELECTION</span>
              <h2 className="section-title font-display">MADE TO BE REMEMBERED.</h2>
            </div>
            <Link to="/menu" className="btn btn-secondary btn-sm">
              View Complete Menu →
            </Link>
          </div>

          {loading ? (
            <div className="pizzas-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card skeleton-card">
                  <div className="skeleton" style={{ height: '200px' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '20px', width: '70%' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '100%' }}></div>
                    <div className="skeleton" style={{ height: '36px', marginTop: '12px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="section-error">
              <p>{error}</p>
              <Link to="/menu" className="btn btn-primary btn-sm">Go to Menu</Link>
            </div>
          ) : featuredPizzas.length > 0 ? (
            <div className="pizzas-grid">
              {featuredPizzas.map((pizza) => (
                <PizzaCard key={pizza._id} pizza={pizza} compact={true} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured pizzas available at this moment.</p>
              <Link to="/menu" className="btn btn-primary">Browse All Pizzas</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Categories Section ─── */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header text-center flex-col items-center">
            <span className="micro-label">DISCOVER YOUR CRAFT</span>
            <h2 className="section-title font-display">EXPLORE BY CATEGORY</h2>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <img src={cat.img} alt={cat.name} className="category-img" />
                <div className="category-overlay">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.desc}</p>
                  <span className="category-action">Explore Collection →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How Ordering Works ─── */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center flex-col items-center">
            <span className="micro-label">SEAMLESS EXPERIENCE</span>
            <h2 className="section-title font-display">HOW ORDERING WORKS</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Choose Your Pie</h3>
              <p className="step-desc">
                Browse our chef-crafted menu featuring traditional Neapolitan bases, bold tandoor spices, and fresh herbs.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Customise Freely</h3>
              <p className="step-desc">
                Tailor size, select stuffed or thin crusts, and layer premium extra toppings with dynamic server-verified pricing.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Fast, Safe Delivery</h3>
              <p className="step-desc">
                Pay securely via Razorpay test mode or COD, then watch your order move through real-time preparation states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Story Section ─── */}
      <section className="story-section" id="story">
        <div className="container story-inner">
          <div className="story-image-col">
            <img
              src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop"
              alt="Artisan Pizza Making Process"
              className="story-img"
            />
          </div>
          <div className="story-content-col">
            <span className="micro-label">THE CRUST &amp; CRAFT PHILOSOPHY</span>
            <h2 className="story-title font-display">BORN FROM OBSESSION WITH THE PERFECT CRUST.</h2>
            <p className="story-text">
              We started with a simple belief: pizza shouldn’t be fast-food compromise. We slow-ferment our dough for 48 hours to create a crust that is airy, digestible, and packed with complex sourdough character.
            </p>
            <p className="story-text">
              From hand-crushed tomatoes from organic growers to genuine Fior di Latte mozzarella, every ingredient is selected with artistic intention.
            </p>
            <div className="story-cta">
              <Link to="/menu" className="btn btn-primary">Taste The Difference</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Customer Reviews Section (Demo Identified) ─── */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header text-center flex-col items-center">
            <span className="micro-label">COMMUNITY LOVE</span>
            <h2 className="section-title font-display">WHAT PIZZA LOVERS SAY</h2>
            <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
              Sample customer testimonials for demonstration purposes.
            </p>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div className="review-rating">
                  {'★'.repeat(rev.rating)}
                </div>
                <p className="review-comment">"{rev.comment}"</p>
                <div className="review-author">
                  <strong>{rev.name}</strong>
                  <span>{rev.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
