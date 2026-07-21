import { Link } from 'react-router-dom';
import smartbiteLogo from '../../assets/Smartbite logo.png';
import './Logo.css';

export default function Logo() {
  return (
    <Link to="/" className="header__logo" aria-label="SmartBite home">
      <img
        src={smartbiteLogo}
        alt="SmartBite logo"
        className="header__logo-mark"
      />
    </Link>
  );
}
