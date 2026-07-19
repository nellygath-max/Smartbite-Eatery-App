import { useEffect, useState } from 'react';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuCategories,
  getMenuItems,
} from '../../services/menuService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { Message } from '../shared';
import { extract } from '../pageHelpers';
export default function MenuManagement() {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '1',
    image: null,
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const load = async () => {
    const [menu, cats] = await Promise.all([
      getMenuItems(),
      getMenuCategories(),
    ]);
    setMeals(extract(menu.data, 'menuItems'));
    setCategories(extract(cats.data, 'categories'));
  };
  useEffect(() => {
    Promise.all([getMenuItems(), getMenuCategories()])
      .then(([menu, cats]) => {
        setMeals(extract(menu.data, 'menuItems'));
        setCategories(extract(cats.data, 'categories'));
      })
      .catch(() => setError('Could not load menu management data.'));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const body = new FormData();
    body.append('name', menuForm.name);
    body.append('price', menuForm.price);
    body.append('category', menuForm.category);
    body.append('stock', menuForm.stock);
    body.append('description', menuForm.description);
    if (menuForm.image) {
      body.append('image', menuForm.image);
    }
    try {
      await createMenuItem(body);
      setMenuForm({
        name: '',
        price: '',
        category: '',
        stock: '1',
        image: null,
        description: '',
      });
      setSuccess('Meal added to the menu.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save this menu item.'));
    }
  };
  const remove = async (id) => {
    if (!window.confirm('Remove this menu item?')) return;
    try {
      await deleteMenuItem(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to remove this menu item.'));
    }
  };
  return (
    <>
      <h1 className="text-3xl font-black">Manage menu</h1>
      <form
        onSubmit={submit}
        className="mt-7 rounded-3xl bg-brand-surface p-6 shadow-sm"
      >
        <h2 className="text-xl font-black">Add a new meal</h2>
        {!categories.length && (
          <p className="mt-3 rounded-2xl bg-brand-secondary-soft px-4 py-3 text-sm text-brand-muted">
            Create a menu category first, then assign the new meal to it.
          </p>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            required
            name="name"
            placeholder="Meal name"
            value={menuForm.name}
            onChange={(event) => setMenuForm((current) => ({
              ...current,
              name: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <input
            required
            name="price"
            type="number"
            min="0"
            placeholder="Price"
            value={menuForm.price}
            onChange={(event) => setMenuForm((current) => ({
              ...current,
              price: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <select required name="category" value={menuForm.category} onChange={(event) => setMenuForm((current) => ({
            ...current,
            category: event.target.value,
          }))} className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15">
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option value={category._id} key={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            required
            name="stock"
            type="number"
            min="0"
            value={menuForm.stock}
            onChange={(event) => setMenuForm((current) => ({
              ...current,
              stock: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <input
            required
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setMenuForm((current) => ({
              ...current,
              image: event.target.files?.[0] || null,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <textarea
            required
            name="description"
            placeholder="Description"
            value={menuForm.description}
            onChange={(event) => setMenuForm((current) => ({
              ...current,
              description: event.target.value,
            }))}
            className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
        </div>
        <button disabled={!categories.length} className="mt-5 rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          Create menu item
        </button>
        <Message error={error} success={success} />
      </form>
      <div className="mt-8 overflow-hidden rounded-2xl bg-brand-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-secondary-soft">
            <tr>
              <th className="p-4">Meal</th>
              <th>Category</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr className="border-t border-brand-border" key={meal._id}>
                <td className="p-4 font-bold">{meal.name}</td>
                <td>{meal.category?.name || '—'}</td>
                <td>{money(meal.price)}</td>
                <td>
                  <button
                    onClick={() => remove(meal._id)}
                    className="p-2 font-bold text-brand-status-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
