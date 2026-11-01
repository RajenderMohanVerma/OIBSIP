import './OrderStatusTimeline.css';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'In the Oven', icon: '🔥' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🍕' },
];

const OrderStatusTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  if (isCancelled) {
    return (
      <div className="timeline-container cancelled">
        <div className="timeline-cancelled-notice">
          <span className="cancelled-icon">✕</span>
          <div>
            <strong>Order Cancelled</strong>
            <p>This order has been cancelled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-track">
        {STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isPending = currentIndex < index;

          let stepClass = 'pending';
          if (isCompleted) stepClass = 'completed';
          if (isCurrent) stepClass = 'current';

          return (
            <div key={step.key} className={`timeline-step ${stepClass}`}>
              <div className="timeline-node">
                <span className="timeline-icon">{step.icon}</span>
              </div>
              <div className="timeline-content">
                <span className="timeline-label">{step.label}</span>
                {isCurrent && <span className="timeline-status-badge">Current Status</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
