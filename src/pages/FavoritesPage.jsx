import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const STATUS_SECTIONS = [
  { key: 'watchlist', ruTitle: '📌 Хочу посмотреть', enTitle: '📌 Plan to Watch' },
  { key: 'watching', ruTitle: '▶ Смотрю', enTitle: '▶ Watching' },
  { key: 'completed', ruTitle: '✅ Просмотрено', enTitle: '✅ Completed' },
  { key: 'on_hold', ruTitle: '⏸ Отложено', enTitle: '⏸ On Hold' },
  { key: 'dropped', ruTitle: '✖ Бросил', enTitle: '✖ Dropped' },
];

export function FavoritesPage({ t, lang = 'ru', currentTheme, knownMovies = [] }) {
  const { state } = useFavorites();
  const [fetchedMap, setFetchedMap] = useState({});
  const [loading, setLoading] = useState(false);

  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';

  const allIds = Array.from(
    new Set([
      ...(state.favorites || []),
      ...(state.watchlist || []),
      ...(state.watching || []),
      ...(state.completed || []),
      ...(state.on_hold || []),
      ...(state.dropped || []),
    ])
  );

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
      title: lang === 'en' ? `Movie #${id}` : `Фильм #${id}`,
      poster_path: null,
      vote_average: 0,
      release_date: '',
    };

  const favoriteMovies = (state.favorites || []).map(resolveMovie);
  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const panelCls = currentTheme?.input || 'bg-gray-950/60 border-gray-800';

  if (loading && allIds.length === 0) {
    return (
      <div className="text-center py-12 opacity-70">
        {lang === 'en' ? 'Loading lists...' : 'Загрузка списков...'}
      </div>
    );
  }

  return (
    <div className={`border rounded-3xl p-6 space-y-8 shadow-xl ${cardCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{t?.listsTitle || 'Мои списки'}</h1>
          <p className="text-xs opacity-70 mt-1">
            {t?.listsSubtitle || 'Категории фильмов, сохранённые в вашем аккаунте'}
          </p>
        </div>
      </div>

      {allIds.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="opacity-70 text-sm">
            {t?.listsEmpty ||
              'Списки пока пусты. Добавьте фильмы на главной странице или в поиске.'}
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          >
            {t?.home || 'На главную'}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Плашка 1: Избранное */}
          <section className={`border rounded-2xl p-5 space-y-4 ${panelCls}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                ♥ {t?.favorites || 'Избранное'} ({favoriteMovies.length})
              </h2>
            </div>

            {favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoriteMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} theme={currentTheme} t={t} />
                ))}
              </div>
            ) : (
              <p className="opacity-60 text-xs py-4">
                {t?.favoritesEmpty || 'В избранном пока пусто.'}
              </p>
            )}
          </section>

          {/* Плашка 2: Категории просмотра */}
          <section className={`border rounded-2xl p-5 space-y-6 ${panelCls}`}>
            <h2 className="text-lg font-bold">
              {t?.statusCategoriesTitle || '📂 Категории просмотра'}
            </h2>

            <div className="space-y-6">
              {STATUS_SECTIONS.map((sec) => {
                const list = (state[sec.key] || []).map(resolveMovie);
                const sectionTitle = lang === 'en' ? sec.enTitle : sec.ruTitle;
                return (
                  <div
                    key={sec.key}
                    className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <h3 className="text-sm font-semibold">
                      {sectionTitle} ({list.length})
                    </h3>
                    {list.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {list.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} theme={currentTheme} t={t} />
                        ))}
                      </div>
                    ) : (
                      <p className="opacity-50 text-xs">
                        {t?.sectionEmpty || 'Пока пусто'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}