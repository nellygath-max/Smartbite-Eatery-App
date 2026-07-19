export const orderStatusLabel = (status = 'pending') =>
  status.replaceAll('_', ' ');

export const orderStatusClass = (status = 'pending') =>
  ({
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-sky-100 text-sky-800',
    preparing: 'bg-violet-100 text-violet-800',
    ready: 'bg-emerald-100 text-emerald-800',
    out_for_delivery: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  })[status] || 'bg-stone-100 text-stone-700';
