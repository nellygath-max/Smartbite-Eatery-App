import { toneSoft } from '../utils/statusStyles';
import { useState } from 'react';

export const Message = ({ error, success }) =>
  (error || success) && (
    <p
      className={`alert ${error ? `alert-danger ${toneSoft('danger')}` : `alert-success ${toneSoft('success')}`}`}
    >
      {error || success}
    </p>
  );

export const Field = ({ label, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = props.type === 'password';

  return (
    <label className="block text-sm font-bold text-brand-text">
      {label}
      <div className="relative mt-1.5">
        <input
          {...props}
          type={isPasswordField && showPassword ? 'text' : props.type}
          className={`w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 ${isPasswordField ? 'pr-12' : ''}`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-secondary-soft hover:text-brand-text"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6A2 2 0 0 0 12 16a2 2 0 0 0 1.4-.6" />
                <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c4.8 0 8.8 2.8 10 8-0.4 1.7-1.2 3.2-2.4 4.4" />
                <path d="M6.2 6.2C4.5 7.5 3.3 9.4 2 12c1.2 5.2 5.2 8 10 8 1.9 0 3.7-.4 5.2-1.3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M2 12c1.2-5.2 5.2-8 10-8s8.8 2.8 10 8c-1.2 5.2-5.2 8-10 8S3.2 17.2 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
};
