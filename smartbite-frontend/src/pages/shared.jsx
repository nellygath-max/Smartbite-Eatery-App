export const Message = ({ error, success }) =>
  (error || success) && (
    <p
      className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
        error
          ? 'bg-brand-status-danger-soft text-brand-status-danger'
          : 'bg-brand-status-success-soft text-brand-status-success'
      }`}
    >
      {error || success}
    </p>
  );

export const Field = ({ label, ...props }) => (
  <label className="block text-sm font-bold text-brand-text">
    {label}
    <input
      {...props}
      className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
    />
  </label>
);
