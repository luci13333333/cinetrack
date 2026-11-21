import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const movieUrl =
    API_KEY && id
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ru-RU`
      : null;

  const creditsUrl =
    API_KEY && id
      ? `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=ru-RU`
      : null;

  const { data: movie, loading, error } = useFetch(movieUrl);
  const { data: credits } = useFetch(creditsUrl);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Загрузка карточки фильма...</div>;
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">
          {error ? `Ошибка загрузки: ${error}` : 'Фильм не найден.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm"
        >
          ← Назад
        </button>
      </div>
    );
  }

  const posterUrl = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const castList = Array.isArray(credits?.cast) ? credits.cast.slice(0, 8) : [];

  return (
    <div>
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-200 transition-colors"
      >
        ← Назад
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
        <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 self-start">
          <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-gray-400 italic text-sm mt-1">«{movie.tagline}»</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="bg-amber-500/15 text-amber-400 px-3 py-1 rounded-lg font-semibold">
              ★ {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}
            </span>
            <span>Год: {movie.release_date ? movie.release_date.slice(0, 4) : '—'}</span>
            {movie.runtime > 0 && <span>Длительность: {movie.runtime} мин.</span>}
          </div>

          {Array.isArray(movie.genres) && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-gray-900 border border-gray-800 text-gray-200 px-3 py-1 rounded-full text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Описание</h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              {movie.overview || 'Описание отсутствует.'}
            </p>
          </div>

          {castList.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">В главных ролях</h2>
              <div className="flex flex-wrap gap-2">
                {castList.map((actor) => (
                  <span
                    key={`${actor.id}-${actor.credit_id || actor.name}`}
                    className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-gray-200"
                  >
                    {actor.name}
                    {actor.character ? ` — ${actor.character}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}