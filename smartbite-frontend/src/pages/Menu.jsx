import { useEffect, useState } from 'react';
import MealCard from '../components/MealCard';
import { getMenuItems } from '../services/menuService';
import { Message } from './shared';
import { extract } from './pageHelpers';
export default function Menu() {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    getMenuItems()
      .then(({ data }) => setMeals(extract(data, 'menuItems')))
      .catch(() =>
        setError(
          'Could not load the menu. Please make sure the API is running.'
        )
      );
  }, []);
  const categoryOf = (meal) =>
    meal.category?.name || meal.category || 'Kitchen favourites';
  const categories = ['All', ...new Set(meals.map(categoryOf).filter(Boolean))];
  const filtered = meals.filter(
    (m) =>
      `${m.name} ${m.description}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === 'All' || categoryOf(m) === category) &&
      (!price || Number(m.price) <= Number(price))
  );
  const grouped = filtered.reduce(
    (groups, meal) => ({
      ...groups,
      [categoryOf(meal)]: [...(groups[categoryOf(meal)] || []), meal],
    }),
    {}
  );
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <p className="text-sm font-black uppercase tracking-widest text-orange-600">
        Kitchen menu
      </p>
      <h1 className="mt-2 text-5xl font-black">Find your next favourite.</h1>
      <div className="mt-9 rounded-2xl bg-emerald-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals, flavours..."
            className="flex-1 rounded-xl border-0 bg-white px-4 py-3 outline-none ring-1 ring-emerald-100 focus:ring-2 focus:ring-emerald-600"
          />
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl bg-white px-4 py-3 font-semibold text-stone-600 outline-none ring-1 ring-emerald-100"
          >
            <option value="">Any price</option>
            <option value="2500">Up to ₦2,500</option>
            <option value="5000">Up to ₦5,000</option>
            <option value="10000">Up to ₦10,000</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              onClick={() => setCategory(c)}
              key={c}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${category === c ? 'bg-emerald-700 text-white' : 'bg-white text-stone-600'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Message error={error} />
      {Object.entries(grouped).map(([name, group]) => (
        <div key={name} className="mt-10">
          <h2 className="text-2xl font-black">{name}</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        </div>
      ))}
      {!error && !filtered.length && (
        <p className="py-16 text-center text-stone-500">
          No meals match your search and filters.
        </p>
      )}
    </section>
  );
}
