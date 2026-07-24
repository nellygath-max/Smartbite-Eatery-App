import { useEffect, useRef, useState } from 'react';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuCategories,
  getMenuItems,
  restockMenuItem,
  updateMenuItem,
} from '../../services/menuService';
import { money } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { toneSoft } from '../../utils/statusStyles';
import { Message } from '../shared';
import { extract } from '../pageHelpers';
export default function MenuManagement() {
  const formRef = useRef(null);
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
  const [editingMealId, setEditingMealId] = useState('');
  const [formResetKey, setFormResetKey] = useState(0);
  const [restockAmounts, setRestockAmounts] = useState({});
  const [restockingId, setRestockingId] = useState('');
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
      if (editingMealId) {
        await updateMenuItem(editingMealId, body);
      } else {
        await createMenuItem(body);
      }
      setMenuForm({
        name: '',
        price: '',
        category: '',
        stock: '1',
        image: null,
        description: '',
      });
      setEditingMealId('');
      setFormResetKey((current) => current + 1);
      setSuccess(editingMealId ? 'Menu item updated.' : 'Meal added to the menu.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save this menu item.'));
    }
  };
  const editMeal = (meal) => {
    setError('');
    setSuccess('');
    setEditingMealId(meal._id);
    setMenuForm({
      name: meal.name || '',
      price: meal.price != null ? String(meal.price) : '',
      category: meal.category?._id || meal.category || '',
      stock: meal.stock != null ? String(meal.stock) : '0',
      image: null,
      description: meal.description || '',
    });
    setFormResetKey((current) => current + 1);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      formRef.current?.querySelector('input[name="name"]')?.focus();
    });
  };

  const cancelEdit = () => {
    setEditingMealId('');
    setMenuForm({
      name: '',
      price: '',
      category: '',
      stock: '1',
      image: null,
      description: '',
    });
    setFormResetKey((current) => current + 1);
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

  const restock = async (meal) => {
    const quantity = Number(restockAmounts[meal._id]);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Enter a whole number of meals to add to stock.');
      return;
    }

    setError('');
    setSuccess('');
    setRestockingId(meal._id);
    try {
      await restockMenuItem(meal._id, quantity);
      setRestockAmounts((current) => ({ ...current, [meal._id]: '' }));
      setSuccess(`${meal.name} restocked by ${quantity}.`);
      await load();
    } catch (restockError) {
      setError(getApiErrorMessage(restockError, 'Unable to add stock for this meal.'));
    } finally {
      setRestockingId('');
    }
  };
  return (
    <>
      <h1 className="text-3xl font-black">Manage menu</h1>
      <form
        ref={formRef}
        onSubmit={submit}
        className="mt-7 rounded-3xl bg-brand-surface p-6 shadow-sm"
      >
        <h2 className="text-xl font-black">
          {editingMealId ? 'Edit menu item' : 'Add a new meal'}
        </h2>
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
            required={!editingMealId}
            key={`menu-image-${formResetKey}`}
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
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={!categories.length} className="rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
            {editingMealId ? 'Update menu item' : 'Create menu item'}
          </button>
          {editingMealId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-brand-border px-5 py-3 font-bold text-brand-muted transition hover:bg-brand-secondary-soft"
            >
              Cancel edit
            </button>
          )}
        </div>
        <Message error={error} success={success} />
      </form>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-brand-surface">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead className="bg-brand-secondary-soft">
            <tr>
              <th className="p-4">Meal</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th className="pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr className="border-t border-brand-border" key={meal._id}>
                <td className="p-4 font-bold">{meal.name}</td>
                <td>{meal.category?.name || '—'}</td>
                <td>{money(meal.price)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${Number(meal.stock) === 0 ? 'text-brand-status-danger' : 'text-brand-secondary-dark'}`}>
                      {meal.stock}
                    </span>
                    <input
                      aria-label={`Number of ${meal.name} portions to add`}
                      type="number"
                      min="1"
                      placeholder="Add"
                      value={restockAmounts[meal._id] || ''}
                      onChange={(event) => setRestockAmounts((current) => ({
                        ...current,
                        [meal._id]: event.target.value,
                      }))}
                      className="w-18 rounded-lg border border-brand-border bg-brand-surface px-2 py-1.5 text-center outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={() => restock(meal)}
                      disabled={restockingId === meal._id}
                      className="rounded-lg border border-brand-primary/30 px-2 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {restockingId === meal._id ? 'Adding...' : 'Restock'}
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => editMeal(meal)}
                    className="rounded-xl bg-brand-primary px-4 py-2 font-bold text-white transition hover:bg-brand-primary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(meal._id)}
                    className={`rounded-xl border border-brand-status-danger/30 px-4 py-2 font-bold transition hover:bg-brand-status-danger/15 ${toneSoft('danger')}`}
                  >
                    Delete
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
