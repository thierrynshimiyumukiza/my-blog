import { useState } from 'react';

const ADMIN_PASSWORD = "thierry"; // Change this to your own password

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(() => typeof window !== "undefined" && localStorage.getItem('isAdmin') === 'true');
  
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      if (typeof window !== "undefined") localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== "undefined") localStorage.removeItem('isAdmin');
  };
  
  return { isAdmin, login, logout };
}