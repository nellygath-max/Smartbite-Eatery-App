export const getApiErrorMessage = (
  error,
  fallback = 'Something went wrong. Please try again.'
) => {
  const fieldError = error?.response?.data?.errors?.[0];
  if (fieldError?.message) {
    return fieldError.field
      ? `${fieldError.field}: ${fieldError.message}`
      : fieldError.message;
  }

  return error?.response?.data?.message || error?.message || fallback;
};
