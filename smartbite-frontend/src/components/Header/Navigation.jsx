import { NavLink, Link } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Menu', to: '/menu' },
  { label: 'Contact', to: '/contact' },
  { label: 'Checkout', to: '/checkout' },
  { label: 'My Orders', to: '/orders' },
];

export default function Navigation({ onLinkClick, isMobile }) {
  return (
    <nav className="header__navigation" aria-label="Main navigation">
      {links.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
          }
        >
          {label}
        </NavLink>
      ))}
      {isMobile && (
        <Link to="/login" onClick={onLinkClick} className="header__nav-link">
          Login
        </Link>
      )}
    </nav>
  );
}
