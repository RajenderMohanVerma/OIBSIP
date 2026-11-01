import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
        backgroundColor: '#171717',
        color: '#F5F1E9',
      }}
      className="page-enter"
    >
      <div style={{ fontSize: '5rem', marginBottom: '8px' }}>🍕</div>
      <span className="micro-label" style={{ marginBottom: '8px' }}>404 ERROR</span>
      <h1 className="font-display" style={{ fontSize: '3rem', marginBottom: '16px' }}>
        OUT OF THE OVEN
      </h1>
      <p style={{ maxWidth: '420px', color: '#89928B', marginBottom: '28px', fontSize: '15px' }}>
        We searched high and low, but the slice you're looking for doesn't seem to exist. It might have been eaten or moved to another link.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Return to Home Page
      </Link>
    </div>
  );
};

export default NotFoundPage;

