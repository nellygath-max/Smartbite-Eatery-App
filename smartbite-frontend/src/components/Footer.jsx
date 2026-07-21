import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-text text-brand-primary-soft">
      <div className="page-shell py-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
          {/* Brand Column */}
          <div>
            <p className="text-2xl font-black text-white">
              Smart<span className="text-brand-primary">Bite</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-brand-primary-soft">
              Bringing your favourite meals to your doorstep—fresh, delicious, and made with care. 
              Every order is prepared to satisfy your cravings, any day, any time.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Explore</p>
            <ul className="footer-links mt-4 space-y-2 text-sm">
              <li>
                <Link className="footer-link" to="/menu">Menu</Link>
              </li>
              <li>
                <Link className="footer-link" to="/#about">Story</Link>
              </li>
              <li>
                <Link className="footer-link" to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Connect:{' '}
              <a
                href="https://www.smartbite.ng"
                target="_blank"
                rel="noreferrer"
                className="footer-contact-link text-sm font-normal normal-case tracking-normal"
              >
                www.smartbite.ng
              </a>
            </p>
            <div className="mt-4 flex flex-col items-start gap-2 text-sm">
              <a
                href="https://www.instagram.com/smartbite.ng"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/smartbite.ng"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                Facebook
              </a>
              <a
                href="https://wa.me/2348030922160"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Hours Column */}
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Open daily</p>
            <div className="mt-4">
              <p className="text-sm leading-6 text-brand-primary-soft">
                10:00 AM – 10:00 PM
                <br />
                Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/15 py-4 text-center text-sm text-brand-primary-soft/85">
        © {new Date().getFullYear()} SmartBite Eatery. Made with care.
      </div>
    </footer>
  );
}
