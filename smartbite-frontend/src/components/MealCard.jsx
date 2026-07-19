import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { imageFor, money } from '../utils/format';
export default function MealCard({ meal }) {
  const { addItem } = useCart();
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-stone-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10">
      <Link to={`/menu/${meal._id}`}>
        <img
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          src={imageFor(meal)}
          alt={meal.name}
        />
      </Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
          {meal.category?.name || meal.category || 'Fresh kitchen'}
        </p>
        <Link
          to={`/menu/${meal._id}`}
          className="mt-2 block text-xl font-extrabold text-stone-900 hover:text-emerald-700"
        >
          {meal.name}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-stone-500">
          {meal.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-lg font-black text-emerald-800">
            {money(meal.price)}
          </span>
          <button
            onClick={() => addItem(meal)}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Add +
          </button>
        </div>
      </div>
    </article>
  );
}
