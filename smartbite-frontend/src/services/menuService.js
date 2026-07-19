import api from './api';

export const getMenuItems = () => api.get('/menu');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const getMenuCategories = () => api.get('/menu-categories');
// FormData preserves the `image` field expected by Multer; Cloudinary then returns imageUrl.
export const createMenuItem = (formData) => api.post('/menu', formData);
export const updateMenuItem = (id, formData) =>
  api.put(`/menu/${id}`, formData);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
