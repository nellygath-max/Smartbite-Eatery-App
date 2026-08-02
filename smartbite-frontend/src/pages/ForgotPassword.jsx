import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';
import { isStrongPassword, isValidEmail } from '../utils/validation';
import { Field, Message } from './shared';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);
    const nextEmail = String(formData.get('email') || '').trim().toLowerCase();

    if (!isValidEmail(nextEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await requestPasswordResetOtp({ email: nextEmail });
      setEmail(nextEmail);
      setStep('reset');
      setSuccess(data?.message || 'OTP sent. Check your inbox.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send OTP right now.'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);
    const otp = String(formData.get('otp') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP code from your email.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPasswordWithOtp({
        email,
        otp,
        password,
      });
      setSuccess(data?.message || 'Password reset successful.');
      event.currentTarget.reset();
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-80px)] place-items-center bg-brand-secondary-soft px-5 py-12">
      <div className="w-full max-w-md rounded-4xl border border-brand-border bg-brand-surface p-8 shadow-xl shadow-brand-secondary/10">
        <p className="text-sm font-black uppercase tracking-widest text-brand-muted">
          Account recovery
        </p>
        <h1 className="mt-2 text-3xl font-black">Reset your password.</h1>

        {step === 'request' ? (
          <form onSubmit={requestOtp} className="mt-6">
            <Field label="Email address" name="email" type="email" required />
            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending code...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="mt-6">
            <div>
              <Field
                label="Email address"
                name="email"
                type="email"
                value={email}
                readOnly
                required
              />
            </div>
            <div className="mt-4">
              <Field
                label="OTP code"
                name="otp"
                inputMode="numeric"
                pattern="\\d{6}"
                maxLength="6"
                required
              />
            </div>
            <div className="mt-4">
              <Field
                label="New password"
                name="password"
                type="password"
                minLength="8"
                required
              />
            </div>
            <div className="mt-4">
              <Field
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                minLength="8"
                required
              />
            </div>
            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-brand-primary py-3.5 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError('');
                setSuccess('');
              }}
              className="mt-3 w-full rounded-xl border border-brand-border py-3 font-bold text-brand-text transition hover:bg-brand-secondary-soft"
            >
              Request a new OTP
            </button>
          </form>
        )}

        <Message error={error} success={success} />

        <p className="mt-5 text-center text-sm text-brand-muted">
          Remembered your password?{' '}
          <Link className="font-bold text-brand-link hover:underline" to="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
