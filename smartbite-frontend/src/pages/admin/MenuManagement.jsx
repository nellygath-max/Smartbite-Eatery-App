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
    const body = new FormData(event.target);
    try {
      await createMenuItem(body);
      event.target.reset();
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
        className="mt-7 rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-black">Add a new meal</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            required
            name="name"
            placeholder="Meal name"
            className="rounded-xl border p-3"
          />
          <input
            required
            name="price"
            type="number"
            min="0"
            placeholder="Price"
            className="rounded-xl border p-3"
          />
          <select required name="category" className="rounded-xl border p-3">
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
            defaultValue="1"
            className="rounded-xl border p-3"
          />
          <input
            required
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="rounded-xl border p-3"
          />
          <textarea
            required
            name="description"
            placeholder="Description"
            className="rounded-xl border p-3"
          />
        </div>
        <button className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">
          Create menu item
        </button>
        <Message error={error} success={success} />
      </form>
      <div className="mt-8 overflow-hidden rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-4">Meal</th>
              <th>Category</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr className="border-t" key={meal._id}>
                <td className="p-4 font-bold">{meal.name}</td>
                <td>{meal.category?.name || '—'}</td>
                <td>{money(meal.price)}</td>
                <td>
                  <button
                    onClick={() => remove(meal._id)}
                    className="p-2 font-bold text-red-600"
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
