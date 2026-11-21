import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function HomePage({
  t,
  lang = 'ru',
  genres = [],
  currentTheme,
  favorites = [],
  movieReviewsMap = {},
  onToggleFavorite,
  onOpenMovieModal,
  onMoviesLoaded,
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState(0);

  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';
  const hasFilters = Boolean(selectedGenre || selectedYear || minRating > 0);

  let url = null;
  if (API_KEY) {
    if (hasFilters) {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=${apiLang}&page=${page}&sort_by=popularity.desc`;
      if (selectedGenre) url += `&with_genres=${selectedGenre}`;
      if (selectedYear) url += `&primary_release_year=${selectedYear}`;
      if (minRating > 0) url += `&vote_average.gte=${minRating}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=${apiLang}&page=${page}`;
    }
  }

  const { data, loading, error } = useFetch(url);

  const movies = (Array.isArray(data?.results) ? data.results : []).map((item) => {
    const savedData = movieReviewsMap[item.id];
    const posterUrl = item.poster_path ? `${IMG_BASE}${item.poster_path}` : FALLBACK_POSTER;
    return {
      ...item,
      posterUrl,
      rating: savedData
        ? savedData.rating
        : typeof item.vote_average === 'number'
        ? Number(item.vote_average.toFixed(1))
        : 0,
      year: item.release_date ? item.release_date.slice(0, 4) : '2024',
      reviews: savedData ? savedData.reviews : [],
    };
  });

  useEffect(() => {
    if (movies.length > 0 && onMoviesLoaded) {
      onMoviesLoaded(movies);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, selectedGenre, selectedYear, minRating, lang, data]);

  if (!API_KEY) {
    return (
      <div className="text-center py-12 text-amber-400">
        Не задан ключ VITE_TMDB_API_KEY в переменных окружения.
      </div>
    );
  }

  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setMinRating(0);
    setPage(1);
  };

  const totalPages = data?.total_pages > 500 ? 500 : data?.total_pages || 1;
  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const inputCls = currentTheme?.input || 'bg-gray-950 border-gray-800 text-white';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';
  const accentTextCls = currentTheme?.accentText || 'text-blue-400';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t?.catalog || 'Популярные фильмы'}</h1>

      <section className={`border p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between mb-8 ${cardCls}`}>
        <div className="flex flex-wrap gap-3 items-center flex-grow">
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            className={`border px-3 py-2 rounded-xl text-sm outline-none cursor-pointer ${inputCls}`}
          >
            <option value="">{t?.allGenres || 'Все жанры'}</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className={`border px-3 py-2 rounded-xl text-sm outline-none cursor-pointer ${inputCls}`}
          >
            <option value="">{t?.allYears || 'Все года'}</option>
            {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${inputCls}`}>
            <span className="text-xs opacity-80">
              {t?.minRatingLabel || 'Мин. рейтинг:'} <strong className="text-yellow-400">{minRating}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="9"
              step="1"
              value={minRating}
              onChange={(e) => {
                setMinRating(Number(e.target.value));
                setPage(1);
              }}
              className="accent-blue-500 cursor-pointer w-20"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="bg-black/20 hover:bg-black/40 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {t?.reset || 'Сбросить'}
          </button>
        )}
      </section>

      {loading && <div className="text-center py-12 text-gray-400">Загрузка фильмов...</div>}
      {error && <div className="text-center py-12 text-red-400">Ошибка загрузки: {error}</div>}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.includes(movie.id)}
                onToggleFavorite={onToggleFavorite}
                onCardClick={() => {
                  if (onOpenMovieModal) {
                    onOpenMovieModal(movie);
                  } else {
                    navigate(`/movie/${movie.id}`);
                  }
                }}
                theme={currentTheme}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-40 cursor-pointer ${cardCls}`}
              >
                ← Назад
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                let pageNum = index + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + index;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - index);
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                      page === pageNum
                        ? `${accentBgCls} border-transparent text-white shadow-lg`
                        : cardCls
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-40 cursor-pointer ${cardCls}`}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className={`text-center py-16 border rounded-2xl ${cardCls}`}>
          <p className="opacity-70 mb-2">{t?.noResults || 'По запросу ничего не найдено'}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className={`${accentTextCls} text-sm hover:underline cursor-pointer`}
            >
              {t?.reset || 'Сбросить'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}