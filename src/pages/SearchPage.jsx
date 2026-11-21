import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export function SearchPage() {
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

  const searchUrl =
    API_KEY && debouncedQuery
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(
          debouncedQuery
        )}&page=1`
      : null;

  const { data, loading, error } = useFetch(searchUrl);
  const movies = Array.isArray(data?.results) ? data.results : [];

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Поиск фильмов</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Введите название фильма..."
          className="flex-1 bg-gray-900 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
        />

        <button
          type="button"
          onClick={handleShare}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl text-sm font-medium text-white transition-colors shrink-0"
        >
          {copied ? '✓ Ссылка скопирована' : 'Поделиться'}
        </button>
      </div>

      {!debouncedQuery && (
        <p className="text-gray-400 text-sm">Введите название фильма, чтобы начать поиск.</p>
      )}

      {loading && <div className="text-gray-400 py-8">Ищем фильмы...</div>}
      {error && <div className="text-red-400 py-8">Ошибка поиска: {error}</div>}

      {debouncedQuery && !loading && !error && movies.length === 0 && (
        <p className="text-gray-400 py-8">По запросу «{debouncedQuery}» ничего не найдено.</p>
      )}

      {movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}