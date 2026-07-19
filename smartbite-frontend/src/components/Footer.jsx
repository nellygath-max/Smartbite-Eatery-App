import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-text text-brand-primary-soft">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-2xl font-black text-white">
            Smart<span className="text-brand-primary">Bite</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6">
            Comforting favourites and thoughtful delivery, made for your
            everyday moments.
          </p>
        </div>
        <div>
          <p className="font-bold text-white">Explore</p>
          <div className="mt-3 flex gap-4 text-sm">
            <Link to="/menu">Menu</Link>
            <Link to="/about">Story</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">Open daily</p>
          <p className="mt-3 text-sm">
            10:00 AM – 10:00 PM
            <br />
            Lagos, Nigeria
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs">
        © {new Date().getFullYear()} SmartBite Eatery. Made with care.
      </div>
    </footer>
  );
}
