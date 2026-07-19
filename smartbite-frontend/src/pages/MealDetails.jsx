import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getMenuItem } from '../services/menuService';
import {
  createReview,
  getMyReviews,
  getReviewsByMenuItem,
  updateReview,
} from '../services/reviewService';
import { imageFor, money } from '../utils/format';
import { extract } from './pageHelpers';

export default function MealDetails() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReviewId, setMyReviewId] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();

  const fetchReviewBundle = useCallback(async () => {
    const [{ data: reviewsData }, myData] = await Promise.all([
      getReviewsByMenuItem(id),
      user ? getMyReviews() : Promise.resolve({ data: { reviews: [] } }),
    ]);
    const nextReviews = extract(reviewsData, 'reviews');
    const mine = user
      ? extract(myData.data, 'reviews').find(
          (item) => String(item?.menuItem?._id || item?.menuItem) === String(id)
        )
      : null;

    return { nextReviews, mine };
  }, [id, user]);

  useEffect(() => {
    getMenuItem(id)
      .then(({ data }) => setMeal(extract(data, 'menuItem')))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    let active = true;
    fetchReviewBundle()
      .then(({ nextReviews, mine }) => {
        if (!active) return;
        setReviews(nextReviews);
        if (mine) {
          setMyReviewId(mine.id);
          setRating(String(mine.rating));
          setReviewText(mine.review || '');
        } else {
          setMyReviewId('');
        }
      })
      .catch(() => {
        if (active) {
          setReviews([]);
          setMyReviewId('');
        }
      })
      .finally(() => {
        if (active) setLoadingReviews(false);
      });

    return () => {
      active = false;
    };
  }, [fetchReviewBundle]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) {
      setFeedback('Please log in before posting a review.');
      return;
    }

    const trimmed = reviewText.trim();
    if (!trimmed) {
      setFeedback('Please write a short review message.');
      return;
    }

    setSubmitting(true);
    setFeedback('');
    try {
      const payload = {
        menuItem: id,
        rating: Number(rating),
        review: trimmed,
      };

      if (myReviewId) {
        await updateReview(myReviewId, { rating: payload.rating, review: payload.review });
      } else {
        const { data } = await createReview(payload);
        const createdId = data?.review?.id;
        if (createdId) setMyReviewId(createdId);
      }

      setFeedback('Review saved successfully.');
      const { nextReviews, mine } = await fetchReviewBundle();
      setReviews(nextReviews);
      if (mine) {
        setMyReviewId(mine.id);
        setRating(String(mine.rating));
        setReviewText(mine.review || '');
      }
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Could not save review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!meal) return <div className="p-20 text-center">Loading your meal…</div>;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <img
          className="h-96 w-full rounded-[2rem] bg-brand-secondary-soft object-contain p-3"
          src={imageFor(meal)}
          alt={meal.name}
        />
        <div className="flex flex-col justify-center">
          <p className="font-bold uppercase tracking-widest text-brand-muted">
            {meal.category?.name || 'Fresh kitchen'}
          </p>
          <h1 className="mt-3 text-5xl font-black">{meal.name}</h1>
          <p className="mt-6 text-lg leading-8 text-brand-muted">
            {meal.description}
          </p>
          <p className="mt-7 text-3xl font-black text-brand-secondary-dark">
            {money(meal.price)}
          </p>
          <div className="mt-6 flex items-center gap-3 text-brand-muted">
            <span className="text-lg">{averageRating ? `★ ${averageRating}/5` : 'No ratings yet'}</span>
            <span className="text-sm">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
          </div>
          <button
            onClick={() => addItem(meal)}
            className="mt-7 w-fit rounded-2xl bg-brand-primary px-7 py-4 font-black text-white transition hover:bg-brand-primary-dark"
          >
            Add to cart +
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={submitReview}
          className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm"
        >
          <h2 className="text-2xl font-black">Rate and review this meal</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Rating and written feedback are submitted together.
          </p>
          <label className="mt-5 block text-sm font-bold text-brand-muted" htmlFor="meal-rating">
            Rating
          </label>
          <select
            id="meal-rating"
            className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            disabled={submitting}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>

          <label className="mt-5 block text-sm font-bold text-brand-muted" htmlFor="meal-review">
            Review
          </label>
          <textarea
            id="meal-review"
            className="mt-2 min-h-32 w-full rounded-xl border border-brand-border bg-white px-4 py-3"
            placeholder="Tell others what you liked or what could be better"
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            disabled={submitting}
          />

          {feedback ? <p className="mt-3 text-sm text-brand-muted">{feedback}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 rounded-xl bg-brand-primary px-6 py-3 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving…' : myReviewId ? 'Update review' : 'Post review'}
          </button>
        </form>

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
                    <p className="text-sm font-bold text-brand-muted">★ {item.rating}/5</p>
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
