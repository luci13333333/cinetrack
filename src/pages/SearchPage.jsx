import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function SearchPage({
  t,
  lang = 'ru',
  currentTheme,
  movieReviewsMap = {},
  onOpenMovieModal,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const paramQ = searchParams.get('q') || '';
    setQuery((prev) => (prev !== paramQ ? paramQ : prev));
  }, [searchParams]);

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setQuery(nextValue);

    const trimmed = nextValue.trim();
    if (trimmed) {
      setSearchParams({ q: nextValue }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const debouncedQuery = useDebounce(query.trim(), 400);
  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';

  const searchUrl =
    API_KEY && debouncedQuery
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=${apiLang}&query=${encodeURIComponent(
          debouncedQuery
        )}&page=1`
      : null;

  const { data, loading, error } = useFetch(searchUrl);

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const tempInput = document.createElement('input');
      tempInput.value = window.location.href;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputCls = currentTheme?.input || 'bg-gray-900 border-gray-800 text-white';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t?.searchPageTitle || 'Поиск фильмов'}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={t?.searchPlaceholder || 'Введите название фильма...'}
          className={`flex-1 border focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors ${inputCls}`}
        />

        <button
          type="button"
          onClick={handleShare}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl text-sm font-medium text-white transition-colors shrink-0 cursor-pointer"
        >
          {copied
            ? t?.copied || '✓ Ссылка скопирована'
            : t?.share || 'Поделиться'}
        </button>
      </div>

      {!debouncedQuery && (
        <p className="opacity-70 text-sm">
          {t?.searchHint || 'Введите название фильма, чтобы начать поиск.'}
        </p>
      )}

      {loading && (
        <div className="opacity-70 py-8">
          {t?.searching || 'Ищем фильмы...'}
        </div>
      )}
      {error && (
        <div className="text-red-400 py-8">
          {lang === 'en' ? `Search error: ${error}` : `Ошибка поиска: ${error}`}
        </div>
      )}

      {debouncedQuery && !loading && !error && movies.length === 0 && (
        <p className="opacity-70 py-8">
          {t?.noResults || `По запросу «${debouncedQuery}» ничего не найдено.`}
        </p>
      )}

      {movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              t={t}
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
      )}
    </div>
  );
}