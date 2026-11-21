import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export function MovieCard({ movie }) {
  const [liked, setLiked] = useState(false);

  const posterUrl = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-blue-500/60 transition-colors">
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
        <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400">
          ★ {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}
        </span>
      </Link>

      <div className="p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/movie/${movie.id}`}
            className="font-semibold text-sm text-white hover:text-blue-400 line-clamp-1 transition-colors"
          >
            {movie.title}
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            {movie.release_date ? movie.release_date.slice(0, 4) : 'Год неизвестен'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLiked((prev) => !prev)}
          aria-label="Лайк"
          className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
            liked
              ? 'bg-rose-600/20 border-rose-500 text-rose-400'
              : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );
}