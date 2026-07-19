/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { signOut } from '../services/authService';
import { getProfile } from '../services/userService';
import {
  getRawValue,
  getStoredValue,
  removeStoredValue,
  setRawValue,
  setStoredValue,
} from '../utils/storage';

export const AuthContext = createContext(null);
const storedUser = () => getStoredValue('smartbite_user');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(() =>
    Boolean(getRawValue('smartbite_token'))
  );
  useEffect(() => {
    const token = getRawValue('smartbite_token');
    if (!token) return;
    getProfile()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        removeStoredValue('smartbite_token');
        removeStoredValue('smartbite_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const authenticate = (data) => {
    const token = data.token || data.accessToken;
    const nextUser = data.user;
    if (token) setRawValue('smartbite_token', token);
    if (nextUser) setStoredValue('smartbite_user', nextUser);
    setUser(nextUser);
  };
  const logout = async () => {
    try {
      await signOut();
    } catch {
      /* Clear this device even if the server is unavailable. */
    }
    removeStoredValue('smartbite_token');
    removeStoredValue('smartbite_user');
    setUser(null);
  };
  const updateUser = (nextUser) => {
    setStoredValue('smartbite_user', nextUser);
    setUser(nextUser);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, authenticate, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
