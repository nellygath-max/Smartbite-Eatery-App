import { Link } from 'react-router-dom';

export default function CartIcon({ count }) {
  return (
    <Link to="/cart" className="header__cart" aria-label={`Cart, ${count} items`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L20.5 8H6.2M9.5 20a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm8 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      </svg>
      <span className="header__cart-label">Cart</span>
      <span className="header__cart-count">{count}</span>
    </Link>
  );
}
