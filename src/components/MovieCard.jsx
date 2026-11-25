import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites, WATCH_STATUSES } from '../context/FavoritesContext';
import { RatingBadge } from './RatingBadge';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function MovieCard({ movie, theme, t }) {
  const { state, dispatch } = useFavorites();

  const currentTheme = theme || {
    card: 'bg-gray-900 border-gray-800 text-white',
    input: 'bg-gray-950 border-gray-800 text-white',
  };

  const movieId = Number(movie.id);
  const isFavorite = (state?.favorites || []).includes(movieId);

  const currentStatus =
    WATCH_STATUSES.find((statusKey) => (state?.[statusKey] || []).includes(movieId)) || 'none';

  const posterUrl =
    movie.posterUrl ||
    (movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : FALLBACK_POSTER);

  const rawRating =
    movie.rating !== undefined
      ? movie.rating
      : typeof movie.vote_average === 'number'
      ? Number(movie.vote_average.toFixed(1))
      : '—';

  const year =
    movie.year ||
    (movie.release_date
      ? movie.release_date.slice(0, 4)
      : t?.unknownYear || 'Год неизвестен');

  const reviewsCount = Array.isArray(movie.reviews)
    ? movie.reviews.length
    : Number(movie.reviewsCount || 0);

  const favoriteButtonTitle = isFavorite
    ? t?.inFavorites || '♥ В избранном'
    : t?.addToFavorites || '♡ В избранное';

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({
      type: isFavorite ? 'REMOVE_FAVORITE' : 'ADD_FAVORITE',
      payload: movieId,
    });
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    dispatch({
      type: 'SET_STATUS',
      payload: { movieId, status: e.target.value },
    });
  };

  return (
    <div
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-blue-500/60 transition-colors min-w-0 ${currentTheme.card}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-950">
        <Link to={`/movie/${movie.id}`} className="block w-full h-full">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
          <RatingBadge rating={rawRating} />
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favoriteButtonTitle}
          title={favoriteButtonTitle}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full border backdrop-blur-md flex items-center justify-center text-xs sm:text-sm transition-all cursor-pointer shadow-lg ${
            isFavorite
              ? 'bg-rose-600/90 border-rose-400 text-white scale-105'
              : 'bg-black/65 border-white/15 text-gray-200 hover:bg-black/85 hover:text-rose-400'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3 min-w-0">
        <div className="min-w-0">
          <Link
            to={`/movie/${movie.id}`}
            className="font-semibold text-xs sm:text-sm hover:text-blue-400 line-clamp-1 transition-colors break-words"
          >
            {movie.title}
          </Link>
          <p className="text-[11px] sm:text-xs opacity-70 mt-0.5 sm:mt-1">{year}</p>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <Link
            to={`/movie/${movie.id}#reviews`}
            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-medium transition-colors flex items-center justify-center gap-1 ${currentTheme.input} opacity-90 hover:opacity-100 hover:border-blue-500/50`}
          >
            <span className="truncate">{t?.reviewsButton || '💬 Отзывы'}</span>
            {reviewsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold shrink-0">
                {reviewsCount}
              </span>
            )}
          </Link>

          <select
            value={currentStatus}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={t?.statusLabel || 'Статус просмотра'}
            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-medium outline-none transition-colors cursor-pointer ${
              currentStatus !== 'none'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : `${currentTheme.input} opacity-90 hover:opacity-100`
            }`}
          >
            <option value="none">{t?.statusNone || '+ Статус просмотра'}</option>
            <option value="watchlist">{t?.statusWatchlist || '📌 Хочу посмотреть'}</option>
            <option value="watching">{t?.statusWatching || '▶ Смотрю'}</option>
            <option value="completed">{t?.statusCompleted || '✅ Просмотрено'}</option>
            <option value="on_hold">{t?.statusOnHold || '⏸ Отложено'}</option>
            <option value="dropped">{t?.statusDropped || '✖ Бросил'}</option>
          </select>
        </div>
      </div>
    </div>
  );
}