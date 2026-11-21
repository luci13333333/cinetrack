import React, { createContext, useContext, useEffect, useReducer } from 'react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const initialState = {
  favorites: [],
  watchlist: [],
};

function normalizeId(item) {
  if (item == null) return null;
  const raw = typeof item === 'object' ? item.id : item;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

export function favoritesReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA': {
      const favs = Array.isArray(action.payload?.favorites)
        ? action.payload.favorites.map(normalizeId).filter((id) => id !== null)
        : state.favorites;
      const watch = Array.isArray(action.payload?.watchlist)
        ? action.payload.watchlist.map(normalizeId).filter((id) => id !== null)
        : state.watchlist;

      return {
        favorites: favs,
        watchlist: watch,
      };
    }

    case 'ADD_FAVORITE': {
      const id = normalizeId(action.payload);
      if (id === null || state.favorites.includes(id)) return state;
      return {
        ...state,
        favorites: [...state.favorites, id],
      };
    }

    case 'REMOVE_FAVORITE': {
      const id = normalizeId(action.payload);
      return {
        ...state,
        favorites: state.favorites.filter((itemId) => itemId !== id),
      };
    }

    case 'ADD_WATCHLIST': {
      const id = normalizeId(action.payload);
      if (id === null || state.watchlist.includes(id)) return state;
      return {
        ...state,
        watchlist: [...state.watchlist, id],
      };
    }

    case 'REMOVE_WATCHLIST': {
      const id = normalizeId(action.payload);
      return {
        ...state,
        watchlist: state.watchlist.filter((itemId) => itemId !== id),
      };
    }

    default:
      return state;
  }
}

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children, token, onRequireAuth, onNotify }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  useEffect(() => {
    if (!token) {
      dispatch({ type: 'SET_DATA', payload: { favorites: [], watchlist: [] } });
      return;
    }

    let isCancelled = false;

    const fetchListsFromDb = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [favRes, watchRes] = await Promise.all([
          fetch(`${API_URL}/favorites`, { headers }),
          fetch(`${API_URL}/watchlist`, { headers }),
        ]);

        const favData = favRes.ok ? await favRes.json() : [];
        const watchData = watchRes.ok ? await watchRes.json() : [];

        if (!isCancelled) {
          dispatch({
            type: 'SET_DATA',
            payload: { favorites: favData, watchlist: watchData },
          });
        }
      } catch (err) {
        console.error('Ошибка загрузки списков из БД:', err);
      }
    };

    fetchListsFromDb();
    return () => {
      isCancelled = true;
    };
  }, [token]);

  const dispatchWithSync = async (action) => {
    if (!token && action.type !== 'SET_DATA') {
      if (onNotify) onNotify('Войдите в аккаунт, чтобы сохранять фильмы');
      if (onRequireAuth) onRequireAuth();
      return;
    }

    dispatch(action);

    if (!token) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const movieId = normalizeId(action.payload);

      if (action.type === 'ADD_FAVORITE' || action.type === 'REMOVE_FAVORITE') {
        const res = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ movieId }),
        });
        if (res.ok) {
          const updatedFavs = await res.json();
          dispatch({ type: 'SET_DATA', payload: { favorites: updatedFavs } });
        }
      }

      if (action.type === 'ADD_WATCHLIST' || action.type === 'REMOVE_WATCHLIST') {
        const res = await fetch(`${API_URL}/watchlist`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ movieId }),
        });
        if (res.ok) {
          const updatedWatch = await res.json();
          dispatch({ type: 'SET_DATA', payload: { watchlist: updatedWatch } });
        }
      }
    } catch (err) {
      console.error('Ошибка синхронизации с БД:', err);
    }
  };

  return (
    <FavoritesContext.Provider value={{ state, dispatch: dispatchWithSync }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites должен использоваться внутри FavoritesProvider');
  }
  return context;
}