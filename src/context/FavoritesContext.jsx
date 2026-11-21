import React, { createContext, useContext, useEffect, useReducer } from 'react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
export const WATCH_STATUSES = ['watchlist', 'watching', 'completed', 'on_hold', 'dropped'];

const initialState = {
  favorites: [],
  watchlist: [],
  watching: [],
  completed: [],
  on_hold: [],
  dropped: [],
};

function normalizeId(item) {
  if (item == null) return null;
  const raw = typeof item === 'object' ? item.id : item;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

function normalizeIdArray(arr) {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.map(normalizeId).filter((id) => id !== null)));
}

function clearMovieFromAllStatuses(state, movieId) {
  const next = { ...state };
  WATCH_STATUSES.forEach((key) => {
    next[key] = (next[key] || []).filter((id) => id !== movieId);
  });
  return next;
}

export function favoritesReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA': {
      const p = action.payload || {};
      return {
        favorites: p.favorites !== undefined ? normalizeIdArray(p.favorites) : state.favorites,
        watchlist: p.watchlist !== undefined ? normalizeIdArray(p.watchlist) : state.watchlist,
        watching: p.watching !== undefined ? normalizeIdArray(p.watching) : state.watching,
        completed: p.completed !== undefined ? normalizeIdArray(p.completed) : state.completed,
        on_hold: p.on_hold !== undefined ? normalizeIdArray(p.on_hold) : state.on_hold,
        dropped: p.dropped !== undefined ? normalizeIdArray(p.dropped) : state.dropped,
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

    case 'SET_STATUS': {
      const movieId = normalizeId(action.payload?.movieId);
      const status = action.payload?.status || 'none';
      if (movieId === null) return state;

      const cleared = clearMovieFromAllStatuses(state, movieId);
      if (status === 'none' || !WATCH_STATUSES.includes(status)) {
        return cleared;
      }

      return {
        ...cleared,
        [status]: [...cleared[status], movieId],
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
      dispatch({
        type: 'SET_DATA',
        payload: {
          favorites: [],
          watchlist: [],
          watching: [],
          completed: [],
          on_hold: [],
          dropped: [],
        },
      });
      return;
    }

    let isCancelled = false;

    const fetchListsFromDb = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [favRes, statusRes] = await Promise.all([
          fetch(`${API_URL}/favorites`, { headers }),
          fetch(`${API_URL}/statuses`, { headers }),
        ]);

        const favData = favRes.ok ? await favRes.json() : [];
        const statusData = statusRes.ok ? await statusRes.json() : {};

        if (!isCancelled) {
          dispatch({
            type: 'SET_DATA',
            payload: {
              favorites: favData,
              watchlist: statusData.watchlist || [],
              watching: statusData.watching || [],
              completed: statusData.completed || [],
              on_hold: statusData.on_hold || [],
              dropped: statusData.dropped || [],
            },
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

      if (action.type === 'ADD_FAVORITE' || action.type === 'REMOVE_FAVORITE') {
        const movieId = normalizeId(action.payload);
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

      if (action.type === 'SET_STATUS') {
        const movieId = normalizeId(action.payload?.movieId);
        const status = action.payload?.status || 'none';
        const res = await fetch(`${API_URL}/statuses`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ movieId, status }),
        });
        if (res.ok) {
          const updatedStatuses = await res.json();
          dispatch({ type: 'SET_DATA', payload: updatedStatuses });
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