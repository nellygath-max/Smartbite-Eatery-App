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
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-orange-600">
              The favourites
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">
              Made with heart.
            </h2>
          </div>
          <Link className="font-bold text-emerald-700" to="/menu">
            See all meals →
          </Link>
        </div>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {meals.length
            ? meals.map((meal) => <MealCard key={meal._id} meal={meal} />)
            : ['Smoky Jollof', 'SmartBite Burger', 'Garden Fresh Bowl'].map(
                (name, i) => (
                  <div key={name} className="rounded-3xl bg-emerald-50 p-7">
                    <p className="text-5xl">{['🍛', '🍔', '🥗'][i]}</p>
                    <h3 className="mt-5 text-xl font-black">{name}</h3>
                    <p className="mt-2 text-stone-500">
                      Kitchen favourites are loading for you.
                    </p>
                  </div>
                )
              )}
        </div>
      </section>
      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-orange-600">
            Your table is ready
          </p>
          <h2 className="mt-3 text-4xl font-black">Hungry? Let’s fix that.</h2>
          <Link
            to="/menu"
            className="mt-7 inline-block rounded-2xl bg-stone-950 px-6 py-3.5 font-bold text-white"
          >
            Order something delicious
          </Link>
        </div>
      </section>
    </>
  );
}
