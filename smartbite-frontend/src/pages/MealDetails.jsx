import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getMenuItem } from '../services/menuService';
import { getReviewsByMenuItem } from '../services/reviewService';
import { imageFor, money } from '../utils/format';
import { extract } from './pageHelpers';

export default function MealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const { addItem } = useCart();
  const soldOut = !meal || Number(meal.stock) < 1 || meal.available === false;

  useEffect(() => {
    getMenuItem(id)
      .then(({ data }) => setMeal(extract(data, 'menuItem')))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    let active = true;
    getReviewsByMenuItem(id)
      .then(({ data }) => {
        if (!active) return;
        setReviews(extract(data, 'reviews'));
      })
      .catch(() => {
        if (active) {
          setReviews([]);
        }
      })
      .finally(() => {
        if (active) setLoadingReviews(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const addAndCheckout = () => {
    if (soldOut) return;
    addItem(meal);
    navigate('/checkout');
  };

  if (!meal) return <div className="p-20 text-center">Loading your meal…</div>;
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <img
          className="h-64 w-full rounded-[2rem] bg-brand-secondary-soft object-contain p-3 sm:h-80 md:h-96"
          src={imageFor(meal)}
          alt={meal.name}
        />
        <div className="flex flex-col justify-center">
          <p className="font-bold uppercase tracking-widest text-brand-muted">
            {meal.category?.name || 'Fresh kitchen'}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">{meal.name}</h1>
          <p className="mt-6 text-lg leading-8 text-brand-muted">
            {meal.description}
          </p>
          <p className="mt-7 text-3xl font-black text-brand-secondary-dark">
            {money(meal.price)}
          </p>
          <div className="mt-6 flex items-center gap-3 text-brand-muted">
            <span className="text-lg text-brand-rating">{averageRating ? `★ ${averageRating}/5` : 'No ratings yet'}</span>
            <span className="text-sm">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
          </div>
          <button
            onClick={addAndCheckout}
            disabled={soldOut}
            className="mt-7 w-full rounded-2xl bg-brand-primary px-7 py-4 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-brand-muted disabled:opacity-70 sm:w-fit"
          >
            {soldOut ? 'Out of stock' : 'Add to cart +'}
          </button>
        </div>
      </div>

      <div className="mt-14">
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Customer reviews</h2>
          {loadingReviews ? (
            <p className="mt-4 text-brand-muted">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="mt-4 text-brand-muted">No reviews yet. Be the first to leave one.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {reviews.map((item) => (
                <li key={item.id} className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-brand-secondary-dark">{item.user?.name || 'Customer'}</p>
                    <p className="text-sm font-bold text-brand-rating">★ {item.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-brand-text">{item.review}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
