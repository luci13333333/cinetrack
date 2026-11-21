import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RatingBadge } from './RatingBadge';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export function MovieCard({ movie, isFavorite, onToggleFavorite, onCardClick, theme }) {
  const [localLiked, setLocalLiked] = useState(false);

  const currentTheme = theme || {
    card: 'bg-gray-900 border-gray-800 text-white',
  };

  const posterUrl =
    movie.posterUrl ||
    (movie.poster_path
      ? `${IMG_BASE}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster');

  const rawRating =
    movie.rating !== undefined
      ? movie.rating
      : typeof movie.vote_average === 'number'
      ? Number(movie.vote_average.toFixed(1))
      : '—';

  const year =
    movie.year ||
    (movie.release_date ? movie.release_date.slice(0, 4) : 'Год неизвестен');

  const liked = typeof isFavorite === 'boolean' ? isFavorite : localLiked;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(movie.id);
    } else {
      setLocalLiked((prev) => !prev);
    }
  };

  return (
    <div
      onClick={onCardClick}
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-blue-500/60 transition-colors ${
        onCardClick ? 'cursor-pointer' : ''
      } ${currentTheme.card}`}
    >
      <Link
        to={`/movie/${movie.id}`}
        onClick={(e) => {
          if (onCardClick) e.stopPropagation();
        }}
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

      <div className="p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/movie/${movie.id}`}
            onClick={(e) => {
              if (onCardClick) e.stopPropagation();
            }}
            className="font-semibold text-sm hover:text-blue-400 line-clamp-1 transition-colors"
          >
            {movie.title}
          </Link>
          <p className="text-xs opacity-70 mt-1">{year}</p>
        </div>

        <button
          type="button"
          onClick={handleHeartClick}
          aria-label="Лайк"
          className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
            liked
              ? 'bg-rose-600/20 border-rose-500 text-rose-400'
              : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );
}