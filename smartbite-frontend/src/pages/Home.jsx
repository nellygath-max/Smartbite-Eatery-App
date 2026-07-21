import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MealCard from '../components/MealCard';
import riceImage from '../assets/rice.jpg';
import { getMenuItems } from '../services/menuService';
import { extract } from './pageHelpers';

export default function Home() {
  const [meals, setMeals] = useState([]);
  const location = useLocation();

  // Handle hash navigation with smooth scroll
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const headerHeight = 88; // account for sticky header
          const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

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
            <h2 className="section-title max-w-xl">Your Next Favourite Meal.</h2>
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
          <p className="section-kicker">READY TO ORDER</p>
          <h2 className="section-title mt-3">Hungry? Let’s fix that.</h2>
          <Link
            to="/menu"
            className="cta-link mt-7 inline-block rounded-2xl bg-brand-primary px-14 py-3.25 font-bold text-white transition hover:bg-brand-primary-dark"
          >
            Explore the Menu
          </Link>
        </div>
      </section>
      {/* About / Our Story Section */}
      <section id="about" className="page-shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="section-kicker">About Us</p>
            <h2 className="section-title">Our Story</h2>
            <p className="mt-4 text-base leading-7 text-brand-muted">
              SmartBite Eatery started with a simple mission: to bring comforting, 
              thoughtfully prepared meals to your doorstep. We believe that good food 
              is more than just nourishment—it's an experience that brings joy to everyday moments.
            </p>
            <p className="mt-4 text-base leading-7 text-brand-muted">
              From our kitchen to your table, every meal is crafted with care using the 
              freshest ingredients and traditional Nigerian recipes with a modern twist.
            </p>
          </div>
          <img
            src={riceImage}
            alt="Rice meal with chicken and vegetables"
            className="mx-auto w-full max-w-xs rounded-3xl object-cover shadow-lg"
          />
        </div>
      </section>
    </>
  );
}
