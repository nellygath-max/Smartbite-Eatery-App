import { useEffect, useState } from 'react';
import { getGreeting } from '../utils/greeting';

export default function Greeting({ userName }) {
  const [greeting, setGreeting] = useState(() => getGreeting(userName));

  useEffect(() => {
    const refreshGreeting = () => setGreeting(getGreeting(userName));

    refreshGreeting();
    window.addEventListener('focus', refreshGreeting);
    window.addEventListener('pageshow', refreshGreeting);
    document.addEventListener('visibilitychange', refreshGreeting);

    return () => {
      window.removeEventListener('focus', refreshGreeting);
      window.removeEventListener('pageshow', refreshGreeting);
      document.removeEventListener('visibilitychange', refreshGreeting);
    };
  }, [userName]);

  return (
    <section className="page-shell pt-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-secondary-soft p-5 shadow-sm sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-surface text-3xl shadow-sm"
        >
          {greeting.emoji}
        </span>
        <div>
          <h2 className="text-2xl font-black text-brand-text">
            {greeting.title}
          </h2>
          <p className="mt-1 text-brand-muted">{greeting.message}</p>
        </div>
      </div>
    </section>
  );
}
