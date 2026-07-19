import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import { Field, Message } from './shared';
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const details = Object.fromEntries(new FormData(e.target));
    try {
      const { data } = await updateProfile(details);
      updateUser(data.user);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Profile update is not available on this API yet.'
        )
      );
    }
  };
  return (
    <section className="mx-auto max-w-xl px-5 py-14">
      <p className="font-bold uppercase tracking-widest text-brand-muted">
        Your account
      </p>
      <h1 className="mt-2 text-4xl font-black">Profile details</h1>
      <form
        onSubmit={submit}
        className="mt-8 rounded-3xl bg-brand-surface p-7 shadow-sm"
      >
        <Field label="Full name" name="name" defaultValue={user?.name} />
        <div className="mt-4">
          <Field
            label="Email address"
            name="email"
            type="email"
            defaultValue={user?.email}
          />
        </div>
        <div className="mt-4">
          <Field label="Phone number" name="phone" defaultValue={user?.phone} />
        </div>
        <button className="mt-6 rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark">
          Save changes
        </button>
        <Message error={error} />
      </form>
    </section>
  );
}
