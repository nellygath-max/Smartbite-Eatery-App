import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
const navClass = ({ isActive }) =>
  `transition ${isActive ? 'text-emerald-700' : 'text-stone-600 hover:text-emerald-700'}`;
export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const leave = async () => {
    await logout();
    navigate('/');
  };
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fffdf9]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-emerald-800"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-lg text-white shadow-lg shadow-emerald-200">
            S
          </span>
          SmartBite
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <NavLink className={navClass} to="/">
            Home
          </NavLink>
          <NavLink className={navClass} to="/menu">
            Menu
          </NavLink>
          <NavLink className={navClass} to="/about">
            Our story
          </NavLink>
          <NavLink className={navClass} to="/contact">
            Contact
          </NavLink>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"
          >
            Cart{' '}
            <span className="ml-1 rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs text-white">
              {count}
            </span>
          </Link>
          {user ? (
            <>
              <Link
                className="hidden rounded-xl px-3 py-2 text-sm font-bold text-stone-700 sm:block"
                to="/profile"
              >
                Hi, {user.name?.split(' ')[0]}
              </Link>
              <button
                onClick={leave}
                className="rounded-xl bg-stone-900 px-3 py-2 text-sm font-bold text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
