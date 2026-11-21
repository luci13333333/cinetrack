import React from 'react';
import { MovieCard } from '../components/MovieCard';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export function HomePage() {
  const url = API_KEY
    ? `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`
    : null;

  const { data, loading, error } = useFetch(url);
  const movies = Array.isArray(data?.results) ? data.results : [];

  if (!API_KEY) {
    return (
      <div className="text-center py-12 text-amber-400">
        Не задан ключ VITE_TMDB_API_KEY в переменных окружения.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Загрузка популярных фильмов...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-400">Ошибка загрузки: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Популярные фильмы</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}