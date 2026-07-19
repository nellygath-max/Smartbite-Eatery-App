export const extract = (data, key) =>
  data?.[key] ||
  data?.items ||
  data?.item ||
  data?.data?.[key] ||
  data?.data ||
  [];
