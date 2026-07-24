import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';
import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import CartIcon from './CartIcon';
import { useCart } from '../../hooks/useCart';

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    </header>
  );
}
