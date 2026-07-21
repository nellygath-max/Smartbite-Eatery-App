import { useState, useEffect } from 'react';
import { Field, Message } from './shared';
export default function Contact() {
  const [sent, setSent] = useState(false);
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <div className="grid overflow-hidden rounded-[2rem] bg-brand-secondary-dark md:grid-cols-2">
        <div className="rounded-t-[2rem] p-6 text-white sm:p-8 md:rounded-l-[2rem] md:rounded-tr-none md:p-12">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-primary-soft">
            Say hello
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            We’d love to hear from you.
          </h1>
          <div className="mt-10 space-y-5 text-brand-secondary-soft">
            <p>Have a question, feedback, or a special request? Send us a message—we're always happy to help.</p>
            <p>📍 Satellite Town, Lagos</p>
            <p>☎ +2348030922160</p>
            <p>✉ hello@smartbite.ng</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-b-[2rem] bg-brand-surface p-6 sm:p-8 md:rounded-l-none md:rounded-r-[2rem] md:p-12"
        >
          <Field label="Your name" required />
          <div className="mt-4">
            <Field label="Email address" type="email" required />
          </div>
          <label className="mt-4 block text-sm font-bold">
            Message
            <textarea
              required
              rows="4"
              className="mt-1.5 w-full rounded-xl border border-brand-border p-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
            />
          </label>
          <button className="mt-5 rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark">
            Send Message
          </button>
          <Message
            success={sent && 'Thanks — we’ll get back to you shortly.'}
          />
        </form>
      </div>
    </section>
  );
}
