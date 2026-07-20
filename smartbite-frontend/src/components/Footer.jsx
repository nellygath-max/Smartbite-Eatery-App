import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-text text-brand-primary-soft">
      <div className="page-shell grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="min-w-0 self-start">
          <p className="text-2xl font-black text-white">
            Smart<span className="text-brand-primary">Bite</span>
          </p>
          <p className="mt-3 text-sm leading-6">
            Comforting favourites and thoughtful delivery, made for your
            everyday moments.
          </p>
        </div>
        <div className="min-w-0 self-start">
          <p className="font-bold text-white">Explore</p>
          <ul className="footer-links mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>
              <Link className="footer-link" to="/menu">Menu</Link>
            </li>
            <li>
              <Link className="footer-link" to="/about">Story</Link>
            </li>
            <li>
              <Link className="footer-link" to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="min-w-0 self-start">
          <p className="font-bold text-white">Contact</p>
          <div className="mt-3 space-y-2 text-sm">
            <a
              href="tel:08030922160"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="Call SmartBite: 08030922160"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.77 19.77 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.77 19.77 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              <span>08030922160</span>
            </a>
            <a
              href="https://wa.me/2348030922160"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="Chat with SmartBite on WhatsApp: 08030922160"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M20.5 3.5A11 11 0 0 0 3.1 16.3L2 22l5.9-1.1A11 11 0 1 0 20.5 3.5ZM12 20a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-3.5.7.7-3.4-.2-.3A8.9 8.9 0 1 1 12 20Zm4.8-6.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.8.2-.9 1-1.1 1.2-.4.2-.7.1a7.2 7.2 0 0 1-3.6-3.1c-.2-.3 0-.5.1-.7s.3-.4.5-.6.2-.4.3-.6 0-.4 0-.6-.8-1.9-1.1-2.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.1 3.2 1.2 3.4a12.2 12.2 0 0 0 4.7 4.2c.6.3 1 .5 1.4.6.6.2 1.2.2 1.7.1.5-.1 1.8-.7 2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4Z" />
              </svg>
              <span>08030922160</span>
            </a>
            <a
              href="https://www.smiteback.com"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="Visit website www.smiteback.com"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
              </svg>
              <span>www.smiteback.com</span>
            </a>
            <a
              href="https://www.facebook.com/smartbite.ng"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="SmartBite Facebook smartbite.ng"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.1c0-.9.3-1.6 1.7-1.6h1.6V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.6v8h2.9Z" />
              </svg>
              <span>smartbite.ng</span>
            </a>
            <a
              href="https://www.instagram.com/smartbite.ng"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="SmartBite Instagram smartbite.ng"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-0" />
              </svg>
              <span>smartbite.ng</span>
            </a>
            <a
              href="https://www.tiktok.com/@smartbite.ng"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-link inline-flex items-center gap-2"
              aria-label="SmartBite TikTok smartbite.ng"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M14.5 3c.4 1.8 1.4 3 3.2 3.7.8.3 1.6.4 2.3.4v3.1c-1 0-2.1-.2-3-.6-.8-.3-1.6-.8-2.2-1.4v7.5a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.2a2.7 2.7 0 1 0 1.8 2.5V3h2.8Z" />
              </svg>
              <span>smartbite.ng</span>
            </a>
          </div>
        </div>
        <div className="min-w-0 self-start">
          <p className="font-bold text-white">Open daily</p>
          <p className="mt-3 text-sm leading-7">
            10:00 AM – 10:00 PM
            <br />
            Lagos, Nigeria
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-brand-primary-soft/85">
        © {new Date().getFullYear()} SmartBite Eatery. Made with care.
      </div>
    </footer>
  );
}
