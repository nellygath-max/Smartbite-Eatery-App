import api from './api';

export const getMenuItems = () => api.get('/menu');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const getMenuCategories = () => api.get('/menu-categories');
export const createMenuCategory = (category) =>
  api.post('/menu-categories', category);
export const updateMenuCategory = (id, category) =>
  api.patch(`/menu-categories/${id}`, category);
export const deleteMenuCategory = (id) => api.delete(`/menu-categories/${id}`);
// FormData preserves the `image` field expected by Multer; Cloudinary then returns imageUrl.
export const createMenuItem = (formData) => api.post('/menu', formData);
export const updateMenuItem = (id, formData) =>
  api.put(`/menu/${id}`, formData);
export const restockMenuItem = (id, quantity) =>
  api.patch(`/menu/${id}/restock`, { quantity });
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
