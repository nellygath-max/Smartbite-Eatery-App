import { Link } from 'react-router-dom';
import heroArtwork from '../assets/jollofrice.jpg';

export default function HeroBanner() {
  return (
    <section className="hero-banner overflow-hidden bg-brand-secondary-dark text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-18 md:grid-cols-2 md:py-24">
        <div className="hero-copy">
          <p className="hero-badge">Freshly made. Happily delivered.</p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
            Good food for your{' '}
            <span className="text-brand-primary-soft">good days.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-brand-secondary-soft">
            Your neighbourhood kitchen for vibrant Nigerian favourites, easy
            bites, and little moments of comfort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="rounded-2xl bg-brand-primary px-6 py-3.5 font-extrabold text-white shadow-lg shadow-brand-primary-dark/30 transition hover:bg-brand-primary-dark"
            >
              Explore the menu
            </Link>
            <Link
              to="/about"
              className="rounded-2xl border border-white/30 px-6 py-3.5 font-extrabold hover:bg-white/10"
            >
              Our story
            </Link>
          </div>
        </div>
        <div className="hero-artwork relative mx-auto grid h-80 w-full max-w-md place-items-center md:h-96">
          <div className="hero-orb absolute h-64 w-64 rounded-full bg-brand-primary/30 blur-3xl" />
          <img
            className="hero-image relative h-72 max-w-full object-contain drop-shadow-2xl md:h-96"
            src={heroArtwork}
            alt="A SmartBite jollof rice meal"
          />
          <div className="hero-rating absolute -bottom-2 -left-3 rounded-2xl bg-brand-surface p-4 text-brand-text shadow-xl">
            <b className="text-brand-primary">★ 4.9</b>
            <span className="ml-2 text-sm text-brand-muted">Loved locally</span>
          </div>
        </div>
      </div>
    </section>
  );
}
