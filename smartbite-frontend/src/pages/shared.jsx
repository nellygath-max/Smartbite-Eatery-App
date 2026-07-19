export const Message = ({ error, success }) =>
  (error || success) && (
    <p
      className={`mt-4 rounded-xl p-3 text-sm font-semibold ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}
    >
      {error || success}
    </p>
  );

export const Field = ({ label, ...props }) => (
  <label className="block text-sm font-bold text-stone-700">
    {label}
    <input
      {...props}
      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
    />
  </label>
);
