import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const LIST_TABS = [
  {
    key: 'favorites',
    ruTitle: '♥ Избранное',
    enTitle: '♥ Favorites',
    emptyTextKey: 'favoritesEmpty',
  },
  {
    key: 'watchlist',
    ruTitle: '📌 Хочу посмотреть',
    enTitle: '📌 Plan to Watch',
    emptyTextKey: 'sectionEmpty',
  },
  {
    key: 'watching',
    ruTitle: '▶ Смотрю',
    enTitle: '▶ Watching',
    emptyTextKey: 'sectionEmpty',
  },
  {
    key: 'completed',
    ruTitle: '✅ Просмотрено',
    enTitle: '✅ Completed',
    emptyTextKey: 'sectionEmpty',
  },
  {
    key: 'on_hold',
    ruTitle: '⏸ Отложено',
    enTitle: '⏸ On Hold',
    emptyTextKey: 'sectionEmpty',
  },
  {
    key: 'dropped',
    ruTitle: '✖ Бросил',
    enTitle: '✖ Dropped',
    emptyTextKey: 'sectionEmpty',
  },
];

export function FavoritesPage({ t, lang = 'ru', currentTheme, knownMovies = [] }) {
  const { state } = useFavorites();
  const [activeTab, setActiveTab] = useState('favorites');
  const [fetchedMap, setFetchedMap] = useState({});
  const [loading, setLoading] = useState(false);

  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';

  const allIds = Array.from(
    new Set(LIST_TABS.flatMap((tab) => state[tab.key] || []))
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

  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const panelCls = currentTheme?.input || 'bg-gray-950/60 border-gray-800';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';

  const currentTabConfig =
    LIST_TABS.find((tab) => tab.key === activeTab) || LIST_TABS[0];
  const currentTabTitle =
    lang === 'en' ? currentTabConfig.enTitle : currentTabConfig.ruTitle;
  const currentTabMovies = (state[currentTabConfig.key] || []).map(resolveMovie);
  const currentTabEmptyText =
    t?.[currentTabConfig.emptyTextKey] ||
    (currentTabConfig.key === 'favorites'
      ? 'В избранном пока пусто.'
      : 'Пока пусто');

  if (loading && allIds.length === 0) {
    return (
      <div className="text-center py-12 opacity-70">
        {lang === 'en' ? 'Loading lists...' : 'Загрузка списков...'}
      </div>
    );
  }

  return (
    <div className={`border rounded-3xl p-6 space-y-6 shadow-xl ${cardCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{t?.listsTitle || 'Мои списки'}</h1>
          <p className="text-xs opacity-70 mt-1">
            {t?.listsSubtitle || 'Категории фильмов, сохранённые в вашем аккаунте'}
          </p>
        </div>
      </div>

      {/* Панель вкладок-переключателей между списками */}
      <div
        role="tablist"
        aria-label={t?.listsTitle || 'Мои списки'}
        className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
      >
        {LIST_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = (state[tab.key] || []).length;
          const label = lang === 'en' ? tab.enTitle : tab.ruTitle;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all inline-flex items-center gap-2 cursor-pointer ${
                isActive
                  ? `${accentBgCls} border-transparent text-white shadow-md`
                  : `${panelCls} opacity-80 hover:opacity-100`
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-black/25' : 'bg-black/30 opacity-85'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
        <section className={`border rounded-2xl p-5 space-y-4 ${panelCls}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {currentTabTitle} ({currentTabMovies.length})
            </h2>
          </div>

          {currentTabMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentTabMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} theme={currentTheme} t={t} />
              ))}
            </div>
          ) : (
            <p className="opacity-60 text-sm py-6 text-center">{currentTabEmptyText}</p>
          )}
        </section>
      )}
    </div>
  );
}