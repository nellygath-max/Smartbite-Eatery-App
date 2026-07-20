const statusTone = {
  success: {
    soft: 'bg-brand-status-success-soft text-brand-status-success',
    solid: 'bg-brand-status-success text-white',
  },
  warning: {
    soft: 'bg-brand-status-warning-soft text-brand-status-warning',
    solid: 'bg-brand-status-warning text-white',
  },
  danger: {
    soft: 'bg-brand-status-danger-soft text-brand-status-danger',
    solid: 'bg-brand-status-danger text-white',
  },
  info: {
    soft: 'bg-brand-status-info-soft text-brand-status-info',
    solid: 'bg-brand-status-info text-white',
  },
  neutral: {
    soft: 'bg-brand-primary-soft text-brand-text',
    solid: 'bg-brand-primary text-white',
  },
};

export const toneSoft = (tone = 'neutral') =>
  statusTone[tone]?.soft || statusTone.neutral.soft;

export const toneSolid = (tone = 'neutral') =>
  statusTone[tone]?.solid || statusTone.neutral.solid;
