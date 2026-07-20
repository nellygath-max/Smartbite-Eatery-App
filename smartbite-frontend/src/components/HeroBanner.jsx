import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="hero-banner overflow-hidden bg-[#2E2A26] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:py-24">
        <div className="hero-copy">
          <p className="hero-badge">Freshly made. Happily delivered.</p>
          <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl md:text-7xl">
            Good food for your{' '}
            <span className="text-brand-primary-soft">good days.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-brand-secondary-soft sm:text-lg sm:leading-8">
            Your neighbourhood kitchen for vibrant Nigerian favourites, easy
            bites, and little moments of comfort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="cta-link rounded-2xl bg-brand-primary px-6 py-3.5 font-extrabold text-white shadow-lg shadow-brand-primary-dark/30 transition hover:bg-brand-primary-dark"
            >
              Explore the menu
            </Link>
            <Link
              to="/about"
              className="cta-outline-link rounded-2xl border border-brand-secondary/70 px-6 py-3.5 font-extrabold text-brand-secondary-soft hover:bg-white/10"
            >
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
