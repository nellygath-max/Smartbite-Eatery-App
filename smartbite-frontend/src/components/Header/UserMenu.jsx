import { Link } from 'react-router-dom';

export default function UserMenu({ user, onLogout }) {
  if (!user)
    return (
      <div className="header__user-menu">
        <Link className="header__signup" to="/register">
          Sign up
        </Link>
        <Link className="header__login" to="/login">
          Login
        </Link>
      </div>
    );

  return (
    <div className="header__user-menu">
      {(user.role === 'admin' || user.role === 'delivery_staff') && (
        <Link className="header__greeting" to={user.role === 'delivery_staff' ? '/delivery/orders' : '/admin'}>
          {user.role === 'delivery_staff' ? 'Delivery' : 'Admin'}
        </Link>
      )}
      <Link className="header__greeting" to="/profile">
        Hi, {user.name?.split(' ')[0]}
      </Link>
      <button className="header__logout" onClick={onLogout} type="button">
        Log out
      </button>
    </div>
  );
}
