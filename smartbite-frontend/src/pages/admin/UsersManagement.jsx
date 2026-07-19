import { useEffect, useState } from 'react';
import {
  createAdminUser,
  getUsers,
  updateUserRole,
} from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/apiError';
import { shortDate } from '../../utils/format';
import { extract } from '../pageHelpers';
import { Message } from '../shared';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    getUsers().then(({ data }) => setUsers(extract(data, 'users')));

  useEffect(() => {
    load().catch(() => setError('Could not load users.'));
  }, []);

  const changeRole = async (id, role) => {
    setError('');
    setSuccess('');
    try {
      await updateUserRole(id, role);
      setSuccess('User role updated.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update this user role.'));
    }
  };

  const submitDeliveryStaff = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createAdminUser({ ...deliveryForm, role: 'delivery_staff' });
      setDeliveryForm({ name: '', email: '', phone: '', password: '' });
      setShowDeliveryForm(false);
      setSuccess('Delivery staff account created.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create delivery staff.'));
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-black">Manage users</h1>
      <p className="mt-2 text-brand-muted">
        Review customer accounts and assign administrator access when needed.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowDeliveryForm((current) => !current)}
          className="rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark"
        >
          Create Delivery Staff
        </button>
      </div>

      {showDeliveryForm && (
        <form
          onSubmit={submitDeliveryStaff}
          className="mt-5 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm"
        >
          <h2 className="text-xl font-black">Create delivery staff</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="Full name"
              value={deliveryForm.name}
              onChange={(event) => setDeliveryForm((current) => ({
                ...current,
                name: event.target.value,
              }))}
              className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
            />
            <input
              required
              name="email"
              type="email"
              placeholder="Email address"
              value={deliveryForm.email}
              onChange={(event) => setDeliveryForm((current) => ({
                ...current,
                email: event.target.value,
              }))}
              className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
            />
            <input
              name="phone"
              placeholder="Phone number"
              value={deliveryForm.phone}
              onChange={(event) => setDeliveryForm((current) => ({
                ...current,
                phone: event.target.value,
              }))}
              className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
            />
            <input
              required
              name="password"
              type="password"
              minLength={8}
              placeholder="Temporary password"
              value={deliveryForm.password}
              onChange={(event) => setDeliveryForm((current) => ({
                ...current,
                password: event.target.value,
              }))}
              className="rounded-xl border border-brand-border bg-brand-surface p-3 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark">
              Save delivery staff
            </button>
            <button
              type="button"
              onClick={() => setShowDeliveryForm(false)}
              className="rounded-xl border border-brand-border px-5 py-3 font-bold text-brand-text transition hover:bg-brand-secondary-soft"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <Message error={error} success={success} />

      <div className="mt-7 overflow-x-auto rounded-2xl bg-brand-surface shadow-sm">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead className="bg-brand-secondary-soft">
            <tr>
              <th className="p-4">User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th className="pr-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-t border-brand-border" key={user._id}>
                <td className="p-4 font-bold">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td>{shortDate(user.createdAt)}</td>
                <td className="pr-4">
                  <select
                    value={user.role}
                    onChange={(event) => changeRole(user._id, event.target.value)}
                    className="rounded-xl border border-brand-border bg-brand-surface p-2 font-bold capitalize outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="delivery_staff">Delivery Staff</option>
                  </select>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td className="p-6 text-brand-muted" colSpan="5">
                  No user accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
