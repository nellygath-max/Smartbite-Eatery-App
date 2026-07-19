export const isValidEmail = (email = '') => /^\S+@\S+\.\S+$/.test(email);
export const isStrongPassword = (password = '') => password.length >= 8;
export const isRequired = (value) => String(value || '').trim().length > 0;

const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSize = 5 * 1024 * 1024;

export const validateMenuImage = (file) => {
  if (!file) return '';
  if (!supportedImageTypes.includes(file.type))
    return 'Use a JPEG, PNG, or WebP image.';
  if (file.size > maxImageSize) return 'Image must be 5 MB or smaller.';
  return '';
};
