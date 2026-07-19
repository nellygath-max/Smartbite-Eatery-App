import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';
import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const leave = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />
        <div className="header__actions">
          <UserMenu user={user} onLogout={leave} />
        </div>
      </div>
      <div className="header__secondary">
        <div className="header__secondary-inner">
          <Navigation />
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
