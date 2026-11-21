import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '2630a76d06d771cee9916d7510de9cfc';

export function FavoritesPage({ lang = 'ru', currentTheme, knownMovies = [] }) {
  const { state } = useFavorites();
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
  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const panelCls = currentTheme?.input || 'bg-gray-950/60 border-gray-800';

  if (loading && favoriteMovies.length === 0 && watchlistMovies.length === 0) {
    return <div className="text-center py-12 opacity-70">Загрузка списков...</div>;
  }

  return (
    <div className={`border rounded-3xl p-6 space-y-8 shadow-xl ${cardCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Мои списки</h1>
          <p className="text-xs opacity-70 mt-1">
            Категории фильмов, сохранённые в вашем аккаунте
          </p>
        </div>
      </div>

      {favoriteMovies.length === 0 && watchlistMovies.length === 0 ? (
        <div className="text-center py-12 space-y-4">
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
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Плашка 1: Избранное */}
          <section className={`border rounded-2xl p-5 space-y-4 ${panelCls}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">♥ Избранное ({favoriteMovies.length})</h2>
            </div>

            {favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favoriteMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} theme={currentTheme} />
                ))}
              </div>
            ) : (
              <p className="opacity-60 text-xs py-6 text-center">В избранном пока пусто.</p>
            )}
          </section>

          {/* Плашка 2: Хочу посмотреть */}
          <section className={`border rounded-2xl p-5 space-y-4 ${panelCls}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">📌 Хочу посмотреть ({watchlistMovies.length})</h2>
            </div>

            {watchlistMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {watchlistMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} theme={currentTheme} />
                ))}
              </div>
            ) : (
              <p className="opacity-60 text-xs py-6 text-center">
                Список «Хочу посмотреть» пока пуст.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}