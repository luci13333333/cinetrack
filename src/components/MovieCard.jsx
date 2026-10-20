import React from 'react';

export function MovieCard({ movie, isFavorite, onToggleFavorite, onCardClick, theme }) {
  const currentTheme = theme || {
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    accentText: 'text-indigo-400',
  };

  return (
    <div 
      onClick={onCardClick}
      className={`group relative rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col ${currentTheme.card}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie.id); }}
          className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-xl text-lg hover:scale-110 transition-transform cursor-pointer"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400">
          ★ {movie.rating}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-sm line-clamp-1 mb-1">{movie.title}</h3>
          <p className="text-xs opacity-70">{movie.year}</p>
        </div>
      </div>
    </div>
  );
}