export const orderStatusLabel = (status = 'pending') =>
  status.replaceAll('_', ' ');

export const orderStatusStages = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const orderStatusIndex = (status = 'pending') => {
  const index = orderStatusStages.indexOf(status);
  return index >= 0 ? index : 0;
};

export const orderStatusClass = (status = 'pending') =>
  ({
    pending: 'bg-brand-status-warning-soft text-brand-status-warning',
    confirmed: 'bg-brand-secondary-soft text-brand-secondary-dark',
    preparing: 'bg-brand-status-warning-soft text-brand-status-warning',
    ready: 'bg-brand-status-success-soft text-brand-status-success',
    out_for_delivery: 'bg-brand-status-info-soft text-brand-status-info',
    delivered: 'bg-brand-status-success-soft text-brand-status-success',
    cancelled: 'bg-brand-status-danger-soft text-brand-status-danger',
  })[status] || 'bg-brand-primary-soft text-brand-text';

export const orderStatusHint = (status = 'pending') =>
  ({
    pending: 'Your order is waiting to be confirmed.',
    confirmed: 'Your order has been confirmed and is queued for preparation.',
    preparing: 'The kitchen is preparing your order right now.',
    ready: 'Your order is ready for pickup or dispatch.',
    out_for_delivery: 'Your order is on the way to your address.',
    delivered: 'Your order has been delivered.',
    cancelled: 'This order was cancelled.',
  })[status] || 'Track the latest update for this order.';
