import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MealCard from '../components/MealCard';
import { getMenuItems } from '../services/menuService';
import { extract } from './pageHelpers';

export default function Home() {
  const [meals, setMeals] = useState([]);
  useEffect(() => {
    getMenuItems()
      .then(({ data }) => setMeals(extract(data, 'menuItems').slice(0, 3)))
      .catch(() => {});
  }, []);
  return (
    <>
      <HeroBanner />
      <section className="page-shell py-14 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">The favourites</p>
            <h2 className="section-title max-w-xl">Made with heart.</h2>
          </div>
          <Link className="font-bold text-brand-link hover:underline" to="/menu">
            See all meals →
          </Link>
        </div>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {meals.length
            ? meals.map((meal) => <MealCard key={meal._id} meal={meal} />)
            : ['Smoky Jollof', 'SmartBite Burger', 'Garden Fresh Bowl'].map(
                (name, i) => (
                  <div key={name} className="content-card p-6 md:p-7">
                    <p className="text-4xl sm:text-5xl">{['🍛', '🍔', '🥗'][i]}</p>
                    <h3 className="mt-5 text-xl font-black">{name}</h3>
                    <p className="mt-2 text-brand-muted">
                      Kitchen favourites are loading for you.
                    </p>
                  </div>
                )
              )}
        </div>
      </section>
      <section className="bg-brand-primary-soft">
        <div className="page-shell py-16 text-center">
          <p className="section-kicker">Your table is ready</p>
          <h2 className="section-title mt-3">Hungry? Let’s fix that.</h2>
          <Link
            to="/menu"
            className="cta-link mt-7 inline-block rounded-2xl bg-brand-primary px-6 py-3.5 font-bold text-white transition hover:bg-brand-primary-dark"
          >
            Order something delicious
          </Link>
        </div>
      </section>
    </>
  );
}
