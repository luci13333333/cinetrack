import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { RatingBadge } from './RatingBadge';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function MovieCard({ movie, theme }) {
  const { state, dispatch } = useFavorites();

  const currentTheme = theme || {
    card: 'bg-gray-900 border-gray-800 text-white',
    input: 'bg-gray-950 border-gray-800 text-white',
  };

  const movieId = Number(movie.id);
  const isFavorite = state.favorites.includes(movieId);
  const isInWatchlist = state.watchlist.includes(movieId);

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
    movie.year || (movie.release_date ? movie.release_date.slice(0, 4) : 'Год неизвестен');

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
    const selectedStatus = e.target.value;

    if (selectedStatus === 'watchlist' && !isInWatchlist) {
      dispatch({ type: 'ADD_WATCHLIST', payload: movieId });
    } else if (selectedStatus !== 'watchlist' && isInWatchlist) {
      dispatch({ type: 'REMOVE_WATCHLIST', payload: movieId });
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-blue-500/60 transition-colors ${currentTheme.card}`}
    >
      <Link
        to={`/movie/${movie.id}`}
        className="block relative aspect-[2/3] overflow-hidden bg-gray-950"
      >
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <RatingBadge rating={rawRating} />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3">
        <div className="min-w-0">
          <Link
            to={`/movie/${movie.id}`}
            className="font-semibold text-sm hover:text-blue-400 line-clamp-1 transition-colors"
          >
            {movie.title}
          </Link>
          <p className="text-xs opacity-70 mt-1">{year}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-rose-600/20 border-rose-500 text-rose-300 hover:bg-rose-600/30'
                : `${currentTheme.input} opacity-85 hover:opacity-100`
            }`}
          >
            {isFavorite ? '♥ В избранном' : '♡ В избранное'}
          </button>

          <select
            value={isInWatchlist ? 'watchlist' : 'none'}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            aria-label="Статус просмотра"
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-colors cursor-pointer ${
              isInWatchlist
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : `${currentTheme.input} opacity-90 hover:opacity-100`
            }`}
          >
            <option value="none">+ Статус просмотра</option>
            <option value="watchlist">📌 Хочу посмотреть</option>
            <option value="watching" disabled>
              ▶ Смотрю (скоро)
            </option>
            <option value="completed" disabled>
              ✅ Просмотрено (скоро)
            </option>
            <option value="on_hold" disabled>
              ⏸ Отложено (скоро)
            </option>
            <option value="dropped" disabled>
              ✖ Бросил (скоро)
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}