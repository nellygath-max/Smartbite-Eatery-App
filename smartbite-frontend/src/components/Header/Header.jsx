import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';
import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import CartIcon from './CartIcon';
import { useCart } from '../../hooks/useCart';
import { getPendingReviewNotifications } from '../../services/reviewService';
import ReviewModal from '../ReviewModal';

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  const loadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    getPendingReviewNotifications()
      .then(({ data }) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => setNotifications([]));
      return;
    }
    getPendingReviewNotifications()
      .then(({ data }) => setNotifications(data?.notifications || []))
      .catch(() => setNotifications([]));
  }, [user]);

  const leave = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />
        <button
          className="header__mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="header__actions">
          {user && (
            <div className="header__notifications">
              <button
                type="button"
                className="header__notification-button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label={`Notifications (${notifications.length})`}
              >
                <span aria-hidden="true">🔔</span>
                {notifications.length > 0 && (
                  <span className="header__notification-count">{notifications.length}</span>
                )}
              </button>
              {notificationsOpen && (
                <div className="header__notification-panel">
                  <p className="header__notification-title">Notifications ({notifications.length})</p>
                  {notifications.length ? (
                    notifications.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="header__notification-item"
                        onClick={() => {
                          setSelectedReview(item);
                          setNotificationsOpen(false);
                        }}
                      >
                        <b>How was your meal?</b>
                        <span>{item.message}</span>
                        <strong>Rate Now</strong>
                      </button>
                    ))
                  ) : (
                    <p className="header__notification-empty">No pending reviews.</p>
                  )}
                </div>
              )}
            </div>
          )}
          <CartIcon count={count} />
          <UserMenu user={user} onLogout={leave} />
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="header__mobile-menu">
          <Navigation isMobile onLinkClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
      <div className="header__secondary">
        <div className="header__secondary-inner">
          <Navigation />
          <SearchBar />
        </div>
      </div>
      <ReviewModal
        notification={selectedReview}
        onClose={() => setSelectedReview(null)}
        onSubmitted={loadNotifications}
      />
    </header>
  );
}
