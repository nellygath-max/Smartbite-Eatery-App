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
  const { addItem } = useCart();
  const soldOut = !meal || Number(meal.stock) < 1 || meal.available === false;

  useEffect(() => {
    getMenuItem(id)
      .then(({ data }) => setMeal(extract(data, 'menuItem')))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    getReviewsByMenuItem(id)
      .then(({ data }) => setReviews(extract(data, 'reviews')))
      .catch(() => setReviews([]));
  }, [id]);

  const addAndCheckout = () => {
    if (soldOut) return;
    addItem(meal);
    navigate('/checkout');
  };

  if (!meal) return <div className="p-20 text-center">Loading your meal...</div>;
  const reviewCount = Number(meal.reviewCount || reviews.length || 0);
  const averageRating = Number(meal.averageRating || 0);

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
          <p className="mt-4 text-sm font-bold text-brand-muted">
            <span className="text-brand-rating">★★★★★</span>{' '}
            {reviewCount ? `${averageRating.toFixed(1)} (${reviewCount} Review${reviewCount === 1 ? '' : 's'})` : 'No reviews yet'}
          </p>
          <button
            onClick={addAndCheckout}
            disabled={soldOut}
            className="mt-7 w-full rounded-2xl bg-brand-primary px-7 py-4 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-brand-muted disabled:opacity-70 sm:w-fit"
          >
            {soldOut ? 'Out of stock' : 'Add to cart +'}
          </button>
        </div>
      </div>
      <section className="mt-12 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
        <h2 className="text-2xl font-black">Customer reviews</h2>
        <div className="mt-5 grid gap-4">
          {reviews.length ? reviews.map((item) => (
            <article key={item.id} className="rounded-2xl bg-brand-secondary-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-black text-brand-secondary-dark">{item.user?.name || 'Customer'}</p>
                <p className="font-bold text-brand-rating">★★★★★ {item.rating}/5</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-brand-text">{item.review}</p>
            </article>
          )) : (
            <p className="text-brand-muted">No customer reviews yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}
