import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MealCard from '../components/MealCard';
import { getMenuItems } from '../services/menuService';
import { Message } from './shared';
import { extract } from './pageHelpers';
export default function Menu() {
  const [meals, setMeals] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const searchQuery = searchParams.get('search') || '';
  const setSearch = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('search', value);
    else nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };
  useEffect(() => {
    getMenuItems()
      .then(({ data }) => setMeals(extract(data, 'menuItems')))
      .catch(() =>
        setError(
          'Could not load the menu. Please make sure the API is running.'
        )
      );
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  const categoryOf = (meal) =>
    meal.category?.name || meal.category || 'Kitchen favourites';
  const categories = ['All', ...new Set(meals.map(categoryOf).filter(Boolean))];
  const filtered = meals.filter(
    (m) =>
      `${m.name} ${m.description}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
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
  const categoryOrder = ['Nigerian Dishes', 'Soups', 'Salads', 'Quick Bites', 'Drinks', 'Desserts'];
  const sortedGrouped = Object.entries(grouped).sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  return (
    <section className="page-shell py-14">
      <p className="section-kicker">Kitchen menu</p>
      <h1 className="section-title">Find your next favourite.</h1>
      <div className="mt-9 content-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals, flavours..."
            className="flex-1 rounded-xl border border-brand-border bg-brand-surface px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="cursor-pointer rounded-xl border border-brand-border bg-brand-surface px-4 py-3 font-semibold text-brand-muted outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
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
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${category === c ? 'bg-brand-secondary text-white' : 'bg-brand-surface text-brand-muted hover:bg-brand-secondary-soft hover:text-brand-text'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Message error={error} />
      {sortedGrouped.map(([name, group]) => (
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
        <p className="py-16 text-center text-brand-muted">
          No meals match your search and filters.
        </p>
      )}
    </section>
  );
}
