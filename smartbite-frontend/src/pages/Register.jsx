import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signIn, signUp } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';
import { isStrongPassword, isValidEmail } from '../utils/validation';
import { Field, Message } from './shared';

export default function Register({ login = false }) {
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const form = Object.fromEntries(new FormData(e.target));
    if (!isValidEmail(form.email))
      return setError('Enter a valid email address.');
    if (!isStrongPassword(form.password))
      return setError('Your password must be at least 8 characters.');
    try {
      const { data } = await (login ? signIn(form) : signUp(form));
      authenticate(data);
      navigate(data?.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Something went wrong. Please check your details.'
        )
      );
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-80px)] place-items-center bg-brand-secondary-soft px-5 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-4xl border border-brand-border bg-brand-surface p-8 shadow-xl shadow-brand-secondary/10"
      >
        <p className="text-sm font-black uppercase tracking-widest text-brand-muted">
          Welcome to SmartBite
        </p>
        <h1 className="mt-2 text-3xl font-black">
          {login ? 'Welcome back.' : 'Create your account.'}
        </h1>
        {!login && (
          <div className="mt-6">
            <Field label="Full name" name="name" required />
          </div>
        )}
        <div className="mt-4">
          <Field label="Email address" name="email" type="email" required />
        </div>
        {!login && (
          <div className="mt-4">
            <Field label="Phone number" name="phone" />
          </div>
        )}
        <div className="mt-4">
          <Field
            label="Password"
            name="password"
            type="password"
            minLength="8"
            required
          />
        </div>
        <button className="mt-6 w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark">
          {login ? 'Sign in' : 'Create account'}
        </button>
        <Message error={error} />
        <p className="mt-5 text-center text-sm text-brand-muted">
          {login ? 'New here?' : 'Already have an account?'}{' '}
          <Link
            className="font-bold text-brand-link hover:underline"
            to={login ? '/register' : '/login'}
          >
            {login ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </form>
    </section>
  );
}
