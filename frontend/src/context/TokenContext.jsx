import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const TokenContext = createContext(null);

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null); // null = not loaded yet

  const fetchTokens = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setTokens(null); return; }
    try {
      const res = await axios.get(`${API_URL}/tokens/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTokens(res.data.tokens);
    } catch {
      // silently fail (e.g. expired JWT)
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTokens();
  }, [fetchTokens]);

  /** Called after a successful scan to instantly update the badge */
  const updateTokens = (newCount) => setTokens(newCount);

  /** Called after a successful payment to refresh the balance from the server */
  const refreshTokens = () => fetchTokens();

  return (
    <TokenContext.Provider value={{ tokens, fetchTokens, updateTokens, refreshTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTokens = () => useContext(TokenContext);
