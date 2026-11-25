import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites, WATCH_STATUSES } from '../context/FavoritesContext';
import { RatingBadge } from './RatingBadge';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

const providersCache = new Map();

function extractProviders(regionData) {
  if (!regionData) return { link: null, list: [] };

  const merged = [
    ...(regionData.flatrate || []),
    ...(regionData.free || []),
    ...(regionData.ads || []),
    ...(regionData.rent || []),
    ...(regionData.buy || []),
  ];

  const uniqueMap = new Map();
  merged.forEach((p) => {
    if (p?.provider_id && !uniqueMap.has(p.provider_id)) {
      uniqueMap.set(p.provider_id, p);
    }
  });

  return {
    link: regionData.link || null,
    list: Array.from(uniqueMap.values()).slice(0, 4),
  };
}

export function MovieCard({ movie, theme, t, lang = 'ru' }) {
  const { state, dispatch } = useFavorites();

  const movieId = Number(movie.id);
  const preferredRegion = lang === 'en' ? 'US' : 'RU';
  const cacheKey = `${movieId}_${preferredRegion}`;

  const [providersData, setProvidersData] = useState(() => {
    return providersCache.get(cacheKey) || { link: null, list: [] };
  });

  const currentTheme = theme || {
    card: 'bg-gray-900 border-gray-800 text-white',
    input: 'bg-gray-950 border-gray-800 text-white',
  };

  const isFavorite = state.favorites.includes(movieId);

  const currentStatus =
    WATCH_STATUSES.find((statusKey) => (state[statusKey] || []).includes(movieId)) || 'none';

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

  useEffect(() => {
    if (!API_KEY || !movieId) return;

    if (providersCache.has(cacheKey)) {
      setProvidersData(providersCache.get(cacheKey));
      return;
    }

    let cancelled = false;

    fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const results = json?.results || {};
        const selectedRegion =
          results[preferredRegion] ||
          results.RU ||
          results.US ||
          results.GB ||
          Object.values(results)[0] ||
          null;

        const parsed = extractProviders(selectedRegion);
        providersCache.set(cacheKey, parsed);
        setProvidersData(parsed);
      })
      .catch(() => {
        // Игнорируем сетевые ошибки
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, movieId, preferredRegion]);

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
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-blue-500/60 transition-colors ${currentTheme.card}`}
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

        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <RatingBadge rating={rawRating} />
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favoriteButtonTitle}
          title={favoriteButtonTitle}
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center text-sm transition-all cursor-pointer shadow-lg ${
            isFavorite
              ? 'bg-rose-600/90 border-rose-400 text-white scale-105'
              : 'bg-black/65 border-white/15 text-gray-200 hover:bg-black/85 hover:text-rose-400'
          }`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

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

        {/* Значки площадок для просмотра */}
        <div className="flex items-center justify-between gap-2 min-h-7">
          <span className="text-[11px] opacity-65">
            {lang === 'en' ? 'Where to watch:' : 'Где смотреть:'}
          </span>

          {providersData.list.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {providersData.list.map((provider) => {
                const targetUrl =
                  providersData.link ||
                  `https://www.themoviedb.org/movie/${movieId}/watch`;

                return (
                  <a
                    key={provider.provider_id}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={provider.provider_name}
                    aria-label={provider.provider_name}
                    className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-black/50 hover:scale-110 hover:border-blue-400 transition-transform shrink-0"
                  >
                    {provider.logo_path ? (
                      <img
                        src={`${LOGO_BASE}${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                        ▶
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          ) : (
            <a
              href={`https://www.themoviedb.org/movie/${movieId}/watch`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="TMDB Watch Providers"
              className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-[10px] font-extrabold tracking-tight text-blue-400 shrink-0"
            >
              TMDB
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to={`/movie/${movie.id}#reviews`}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${currentTheme.input} opacity-90 hover:opacity-100 hover:border-blue-500/50`}
          >
            <span>{t?.reviewsButton || '💬 Отзывы'}</span>
            {reviewsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[11px] font-bold">
                {reviewsCount}
              </span>
            )}
          </Link>

          <select
            value={currentStatus}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={t?.statusLabel || 'Статус просмотра'}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-colors cursor-pointer ${
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