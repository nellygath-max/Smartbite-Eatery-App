import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyContactMessages } from '../services/contactService';
import { getApiErrorMessage } from '../utils/apiError';
import { dateTime } from '../utils/format';
import { Message } from './shared';

const statusFor = (message) => (message.reply || message.status === 'Replied' ? 'Replied' : 'Pending');

const statusClass = (status) =>
  status === 'Replied'
    ? 'bg-brand-status-success-soft text-brand-status-success'
    : 'bg-brand-status-warning-soft text-brand-status-warning';

const SupportSkeleton = () => (
  <div className="grid gap-4" aria-label="Loading support messages">
    {[1, 2, 3].map((item) => (
      <div key={item} className="animate-pulse rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
        <div className="h-5 w-2/5 rounded bg-brand-border" />
        <div className="mt-4 h-3 w-full rounded bg-brand-border" />
        <div className="mt-2 h-3 w-4/5 rounded bg-brand-border" />
        <div className="mt-5 h-10 w-full rounded-xl bg-brand-secondary-soft" />
      </div>
    ))}
  </div>
);

export default function MySupportMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyContactMessages()
      .then(({ data }) => {
        setMessages(data?.messages || []);
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load your support messages.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-shell py-14 md:py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Support</p>
          <h1 className="section-title">My Support Messages</h1>
          <p className="section-subtitle">
            Track your contact messages and replies from the SmartBite team.
          </p>
        </div>
        <Link
          to="/contact"
          className="rounded-xl bg-brand-primary px-5 py-3 text-center font-bold text-white transition hover:bg-brand-primary-dark"
        >
          Contact Support
        </Link>
      </div>

      <Message error={error} />

      <div className="mt-8">
        {loading ? (
          <SupportSkeleton />
        ) : messages.length ? (
          <div className="grid gap-4">
            {messages.map((message) => {
              const status = statusFor(message);

              return (
                <article
                  key={message._id}
                  className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-brand-text">
                        {message.subject || 'Support message'}
                      </h2>
                      <p className="mt-1 text-sm font-bold text-brand-muted">
                        Sent {dateTime(message.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${statusClass(status)}`}>
                      {status}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-brand-secondary-soft p-4 leading-7 text-brand-text">
                    {message.message}
                  </p>

                  <div className="mt-4 rounded-2xl bg-brand-primary-soft p-4">
                    <p className="text-sm font-black uppercase tracking-widest text-brand-secondary-dark">
                      Admin reply
                    </p>
                    {message.reply ? (
                      <>
                        <p className="mt-2 whitespace-pre-wrap leading-7 text-brand-text">
                          {message.reply}
                        </p>
                        <p className="mt-3 text-sm font-bold text-brand-muted">
                          Replied {dateTime(message.repliedAt)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-brand-body">
                        Our support team is reviewing your message.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-center shadow-sm">
            <p className="text-5xl" aria-hidden="true">✉️</p>
            <h2 className="mt-4 text-2xl font-black text-brand-text">
              You haven't contacted support yet.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-brand-muted">
              Send us a message whenever you need help with an order, payment, or meal.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-block rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
