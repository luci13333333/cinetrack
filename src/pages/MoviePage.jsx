import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RatingBadge } from '../components/RatingBadge';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export function MoviePage({
  lang = 'ru',
  currentTheme,
  favorites = [],
  movieReviewsMap = {},
  onToggleFavorite,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';

  const movieUrl =
    API_KEY && id
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=${apiLang}`
      : null;

  const creditsUrl =
    API_KEY && id
      ? `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=${apiLang}`
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
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm cursor-pointer"
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
  const savedReviews = movieReviewsMap[movie.id]?.reviews || [];
  const ratingValue =
    movieReviewsMap[movie.id]?.rating ??
    (typeof movie.vote_average === 'number' ? Number(movie.vote_average.toFixed(1)) : '—');
  const isFav = favorites.includes(Number(id));
  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';

  return (
    <div>
      <button
        type="button"
        onClick={handleBack}
        className={`mb-6 border px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${cardCls}`}
      >
        ← Назад
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
        <div className={`rounded-2xl overflow-hidden border self-start ${cardCls}`}>
          <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              {movie.tagline && (
                <p className="opacity-70 italic text-sm mt-1">«{movie.tagline}»</p>
              )}
            </div>
            <RatingBadge rating={ratingValue} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm opacity-85">
            <span>Год: {movie.release_date ? movie.release_date.slice(0, 4) : '—'}</span>
            {movie.runtime > 0 && <span>Длительность: {movie.runtime} мин.</span>}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(Number(id))}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardCls}`}
              >
                {isFav ? '❤️ В избранном' : '🤍 В избранное'}
              </button>
            )}
          </div>

          {Array.isArray(movie.genres) && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className={`border px-3 py-1 rounded-full text-xs ${cardCls}`}
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Описание</h2>
            <p className="opacity-85 leading-relaxed text-sm">
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
                    className={`border px-3 py-1.5 rounded-xl text-xs ${cardCls}`}
                  >
                    {actor.name}
                    {actor.character ? ` — ${actor.character}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {savedReviews.length > 0 && (
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <h2 className="text-lg font-semibold">Отзывы ({savedReviews.length})</h2>
              {savedReviews.map((rev) => (
                <div key={rev.id || rev.date} className={`p-4 rounded-2xl border ${cardCls}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold">{rev.author}</span>
                    <span className="text-yellow-400 font-bold">★ {rev.rating} / 10</span>
                  </div>
                  <p className="text-xs opacity-85">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}