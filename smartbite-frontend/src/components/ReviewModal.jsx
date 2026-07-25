import { useState } from 'react';
import { createReview } from '../services/reviewService';

export default function ReviewModal({ notification, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!notification) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createReview({
        orderId: notification.orderId,
        menuItem: notification.menuItemId,
        rating,
        review,
      });
      setReview('');
      onSubmitted?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit this review right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6">
      <form
        onSubmit={submit}
        className="w-full max-w-lg animate-[modalIn_180ms_ease-out] rounded-3xl bg-brand-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">
              Order #{notification.orderNumber}
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-text">How was your meal?</h2>
            <p className="mt-1 text-brand-muted">
              Rate and review {notification.foodName} to help other customers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl bg-brand-secondary-soft text-xl font-black text-brand-text"
            aria-label="Close review form"
          >
            x
          </button>
        </div>

        <div className="mt-6 flex gap-1" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              className={`text-4xl transition ${value <= rating ? 'text-brand-rating' : 'text-brand-border'}`}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          required
          minLength={5}
          maxLength={1000}
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows="5"
          placeholder="Share your experience..."
          className="mt-5 w-full rounded-2xl border border-brand-border p-4 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
        />

        {error && <p className="mt-3 text-sm font-bold text-brand-status-danger">{error}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-primary px-5 py-3 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-brand-surface px-5 py-3 font-black text-brand-text transition hover:bg-brand-secondary-soft"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
