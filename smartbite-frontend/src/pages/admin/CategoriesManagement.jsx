import { useEffect, useState } from 'react';
import {
  createMenuCategory,
  deleteMenuCategory,
  getMenuCategories,
  updateMenuCategory,
} from '../../services/menuService';
import { getApiErrorMessage } from '../../utils/apiError';
import { toneSoft } from '../../utils/statusStyles';
import { extract } from '../pageHelpers';
import { Message } from '../shared';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategoryId('');
  };

  const load = () =>
    getMenuCategories().then(({ data }) =>
      setCategories(extract(data, 'categories'))
    );

  useEffect(() => {
    load().catch(() => setError('Could not load menu categories.'));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingCategoryId) {
        await updateMenuCategory(editingCategoryId, categoryForm);
        setSuccess('Category updated.');
      } else {
        await createMenuCategory(categoryForm);
        setSuccess('Category created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(
        err,
        editingCategoryId
          ? 'Unable to update this category.'
          : 'Unable to create this category.'
      ));
    }
  };

  const startEdit = (category) => {
    setError('');
    setSuccess('');
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this category?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteMenuCategory(id);
      setSuccess('Category removed.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to remove this category.'));
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-black">Manage categories</h1>
      <p className="mt-2 text-brand-muted">
        Keep the menu organized into clear customer-facing groups.
      </p>

      <form
        onSubmit={submit}
        className="mt-7 rounded-3xl bg-brand-surface p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-black">
            {editingCategoryId ? 'Edit category' : 'Add a category'}
          </h2>
          {editingCategoryId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-bold text-brand-muted"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_2fr_auto]">
          <input
            required
            name="name"
            placeholder="Category name"
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((current) => ({
              ...current,
              name: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <input
            name="description"
            placeholder="Short description (optional)"
            value={categoryForm.description}
            onChange={(event) => setCategoryForm((current) => ({
              ...current,
              description: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <button className="rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark md:col-span-2 lg:col-span-1">
            {editingCategoryId ? 'Save changes' : 'Add category'}
          </button>
        </div>
        <Message error={error} success={success} />
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl bg-brand-surface shadow-sm">
        <div className="border-b border-brand-border bg-brand-secondary-soft px-5 py-4">
          <h2 className="font-black">Current categories</h2>
        </div>
        <div className="divide-y divide-brand-border">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="font-bold">{category.name}</p>
                {category.description && (
                  <p className="mt-1 text-sm text-brand-muted">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEdit(category)}
                  className="rounded-xl bg-brand-primary px-4 py-2 font-bold text-white transition hover:bg-brand-primary-dark"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(category._id)}
                  className={`rounded-xl border border-brand-status-danger/30 px-4 py-2 font-bold transition hover:bg-brand-status-danger/15 ${toneSoft('danger')}`}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <p className="px-5 py-8 text-brand-muted">No categories yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
