import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { imageFor, money } from '../utils/format';
export default function MealCard({ meal }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const stock = Number(meal.stock);
  const soldOut = !Number.isFinite(stock) || stock < 1 || meal.available === false;

  const addAndCheckout = () => {
    if (soldOut) return;
    addItem(meal);
    navigate('/checkout');
  };

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-brand-border/60 bg-brand-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-secondary/10">
      <Link to={`/menu/${meal._id}`} className="block">
        <div className="flex h-52 items-center justify-center px-4 py-3">
          <div className="flex h-full w-[68%] items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-brand-text/15 transition duration-500 group-hover:w-[72%]">
            <img
              className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-105"
              src={imageFor(meal)}
              alt={meal.name}
            />
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          {meal.category?.name || meal.category || 'Fresh kitchen'}
        </p>
        <Link
          to={`/menu/${meal._id}`}
          className="meal-card-title mt-2 block text-xl font-extrabold !text-brand-text transition"
        >
          {meal.name}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-brand-muted">
          {meal.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-lg font-black !text-brand-text">
            {money(meal.price)}
          </span>
          <button
            onClick={addAndCheckout}
            disabled={soldOut}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-brand-muted disabled:opacity-70"
          >
            {soldOut ? 'Out of stock' : 'Add +'}
          </button>
        </div>
      </div>
    </article>
  );
}
