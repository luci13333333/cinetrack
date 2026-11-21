import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '2630a76d06d771cee9916d7510de9cfc';

export function FavoritesPage({ lang = 'ru', currentTheme, knownMovies = [] }) {
  const { state, dispatch } = useFavorites();
  const [fetchedMap, setFetchedMap] = useState({});
  const [loading, setLoading] = useState(false);

  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';
  const allIds = Array.from(new Set([...state.favorites, ...state.watchlist]));

  useEffect(() => {
    const missingIds = allIds.filter(
      (id) => !knownMovies.some((m) => m.id === id) && !fetchedMap[id]
    );

    if (missingIds.length === 0 || !API_KEY) return;

    let cancelled = false;
    setLoading(true);

    Promise.all(
      missingIds.map((id) =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=${apiLang}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setFetchedMap((prev) => {
        const next = { ...prev };
        results.forEach((item) => {
          if (item && item.id) next[item.id] = item;
        });
        return next;
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [allIds.join(','), apiLang]);

  const resolveMovie = (id) =>
    knownMovies.find((m) => m.id === id) ||
    fetchedMap[id] || {
      id,
      title: `Фильм #${id}`,
      poster_path: null,
      vote_average: 0,
      release_date: '',
    };

  const favoriteMovies = state.favorites.map(resolveMovie);
  const watchlistMovies = state.watchlist.map(resolveMovie);

  if (loading && favoriteMovies.length === 0 && watchlistMovies.length === 0) {
    return <div className="text-center py-12 opacity-70">Загрузка списков...</div>;
  }

  if (favoriteMovies.length === 0 && watchlistMovies.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold">Избранное и «Хочу посмотреть»</h1>
        <p className="opacity-70 text-sm">
          Списки пока пусты. Добавьте фильмы на главной странице или в поиске.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <h1 className="text-2xl font-bold">❤️ Избранное ({favoriteMovies.length})</h1>
        {favoriteMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {favoriteMovies.map((movie) => (
              <div key={movie.id} className="flex flex-col gap-2">
                <MovieCard movie={movie} theme={currentTheme} />
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REMOVE_FAVORITE', payload: movie.id })}
                  className="w-full px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Удалить из избранного
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="opacity-60 text-sm">В избранном пока нет фильмов.</p>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold">📌 Хочу посмотреть ({watchlistMovies.length})</h2>
        {watchlistMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} className="flex flex-col gap-2">
                <MovieCard movie={movie} theme={currentTheme} />
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REMOVE_WATCHLIST', payload: movie.id })}
                  className="w-full px-3 py-2 rounded-xl border border-blue-500/40 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Убрать из «Хочу посмотреть»
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="opacity-60 text-sm">Список «Хочу посмотреть» пока пуст.</p>
        )}
      </section>
    </div>
  );
}