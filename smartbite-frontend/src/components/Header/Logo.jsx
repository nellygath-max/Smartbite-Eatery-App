import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="header__logo" aria-label="SmartBite home">
      <span className="header__logo-mark" aria-hidden="true">
        S
      </span>
      <span>SmartBite</span>
    </Link>
  );
}
