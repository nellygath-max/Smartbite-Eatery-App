import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getMenuItem } from '../services/menuService';
import { imageFor, money } from '../utils/format';
import { extract } from './pageHelpers';
export default function MealDetails() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const { addItem } = useCart();
  useEffect(() => {
    getMenuItem(id)
      .then(({ data }) => setMeal(extract(data, 'menuItem')))
      .catch(() => {});
  }, [id]);
  if (!meal) return <div className="p-20 text-center">Loading your meal…</div>;
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
      <img
        className="h-96 w-full rounded-[2rem] object-cover"
        src={imageFor(meal)}
        alt={meal.name}
      />
      <div className="flex flex-col justify-center">
        <p className="font-bold uppercase tracking-widest text-orange-600">
          {meal.category?.name || 'Fresh kitchen'}
        </p>
        <h1 className="mt-3 text-5xl font-black">{meal.name}</h1>
        <p className="mt-6 text-lg leading-8 text-stone-600">
          {meal.description}
        </p>
        <p className="mt-7 text-3xl font-black text-emerald-800">
          {money(meal.price)}
        </p>
        <button
          onClick={() => addItem(meal)}
          className="mt-7 w-fit rounded-2xl bg-emerald-700 px-7 py-4 font-black text-white"
        >
          Add to cart +
        </button>
      </div>
    </section>
  );
}
