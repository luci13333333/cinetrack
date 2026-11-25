import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { RatingBadge } from '../components/RatingBadge';
import { useFavorites } from '../context/FavoritesContext';
import { useFetch } from '../hooks/useFetch';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

function buildProviderUrl(providerName, movieTitle, fallbackLink) {
  const encodedTitle = encodeURIComponent(movieTitle || '');
  const lower = (providerName || '').toLowerCase();

  if (lower.includes('netflix')) {
    return `https://www.netflix.com/search?q=${encodedTitle}`;
  }
  if (lower.includes('prime video') || lower.includes('amazon')) {
    return `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`;
  }
  if (lower.includes('apple tv')) {
    return `https://tv.apple.com/search?term=${encodedTitle}`;
  }
  if (lower.includes('disney')) {
    return `https://www.disneyplus.com/search?q=${encodedTitle}`;
  }
  if (lower.includes('youtube')) {
    return `https://www.youtube.com/results?search_query=${encodedTitle}`;
  }
  if (lower.includes('google play')) {
    return `https://play.google.com/store/search?q=${encodedTitle}&c=movies`;
  }
  if (lower.includes('kinopoisk') || lower.includes('кинопоиск')) {
    return `https://www.kinopoisk.ru/index.php?kp_query=${encodedTitle}`;
  }
  if (lower.includes('okko')) {
    return `https://okko.tv/search/${encodedTitle}`;
  }
  if (lower.includes('ivi') || lower.includes('иви')) {
    return `https://www.ivi.ru/search/?q=${encodedTitle}`;
  }
  if (lower.includes('wink')) {
    return `https://wink.ru/search?q=${encodedTitle}`;
  }

  return fallbackLink || `https://www.google.com/search?q=${encodeURIComponent(`${movieTitle} смотреть онлайн`)}`;
}

function extractProviders(regionData, movieTitle) {
  if (!regionData) return [];

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
      uniqueMap.set(p.provider_id, {
        ...p,
        href: buildProviderUrl(p.provider_name, movieTitle, regionData.link),
      });
    }
  });

  return Array.from(uniqueMap.values()).slice(0, 8);
}

export function MoviePage({
  t,
  lang = 'ru',
  currentTheme,
  user,
  movieReviewsMap = {},
  onUpdateMovie,
  onDeleteReview,
}) {
  const { id } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useFavorites();
  const apiLang = lang === 'en' ? 'en-US' : 'ru-RU';

  const pageContainerRef = useRef(null);

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

  const [trailerKey, setTrailerKey] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(10);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    setReviewText('');
    setRating(10);
    setEditingReviewId(null);
    setTrailerKey(null);
    setSimilarMovies([]);
    setCollectionMovies([]);
    setProviders([]);
    if (hash !== '#reviews') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, hash]);

  useEffect(() => {
    if (!id || !API_KEY) return;
    const controller = new AbortController();

    const fetchExtraData = async () => {
      try {
        const [videoRes, simRes, provRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=${apiLang}`,
            { signal: controller.signal }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}&language=${apiLang}`,
            { signal: controller.signal }
          ),
          fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`, {
            signal: controller.signal,
          }),
        ]);

        const videoData = await videoRes.json();
        let officialTrailer = (videoData.results || []).find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );

        if (!officialTrailer) {
          const videoResEn = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`,
            { signal: controller.signal }
          );
          const videoDataEn = await videoResEn.json();
          officialTrailer =
            (videoDataEn.results || []).find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
            videoDataEn.results?.[0];
        }
        setTrailerKey(officialTrailer ? officialTrailer.key : null);

        const simData = await simRes.json();
        setSimilarMovies((simData.results || []).slice(0, 4));

        const provData = await provRes.json();
        const regionResults = provData?.results || {};
        const preferredRegion = lang === 'en' ? 'US' : 'RU';
        const regionPayload =
          regionResults[preferredRegion] ||
          regionResults.RU ||
          regionResults.US ||
          regionResults.GB ||
          null;
        setProviders(extractProviders(regionPayload, movie?.title));
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Ошибка загрузки дополнительных данных фильма:', err);
        }
      }
    };

    fetchExtraData();
    return () => controller.abort();
  }, [id, apiLang, lang, movie?.title]);

  useEffect(() => {
    if (!movie?.belongs_to_collection?.id || !API_KEY) {
      setCollectionMovies([]);
      return;
    }
    const controller = new AbortController();

    fetch(
      `https://api.themoviedb.org/3/collection/${movie.belongs_to_collection.id}?api_key=${API_KEY}&language=${apiLang}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((collData) => {
        setCollectionMovies((collData.parts || []).filter((p) => p.id !== Number(id)).slice(0, 4));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Ошибка загрузки франшизы:', err);
        }
      });

    return () => controller.abort();
  }, [movie?.belongs_to_collection?.id, id, apiLang]);

  useEffect(() => {
    if (loading || !movie || hash !== '#reviews') return;

    let userInteracted = false;
    const stopTracking = () => {
      userInteracted = true;
    };

    const alignToReviews = (smooth = false) => {
      if (userInteracted) return;
      const reviewsEl = document.getElementById('reviews');
      if (!reviewsEl) return;
      const headerOffset = 88;
      const top = reviewsEl.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: smooth ? 'smooth' : 'auto',
      });
    };

    alignToReviews(true);

    window.addEventListener('wheel', stopTracking, { passive: true });
    window.addEventListener('touchmove', stopTracking, { passive: true });

    const observer = new ResizeObserver(() => {
      alignToReviews(false);
    });

    if (pageContainerRef.current) {
      observer.observe(pageContainerRef.current);
    }

    const releaseTimer = setTimeout(() => {
      observer.disconnect();
    }, 2000);

    return () => {
      clearTimeout(releaseTimer);
      observer.disconnect();
      window.removeEventListener('wheel', stopTracking);
      window.removeEventListener('touchmove', stopTracking);
    };
  }, [loading, movie, hash]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 opacity-70">
        {t?.movieLoading || 'Загрузка карточки фильма...'}
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">
          {error
            ? lang === 'en'
              ? `Loading error: ${error}`
              : `Ошибка загрузки: ${error}`
            : t?.movieNotFound || 'Фильм не найден.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm text-white cursor-pointer"
        >
          {t?.back || '← Назад'}
        </button>
      </div>
    );
  }

  const posterUrl = movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : FALLBACK_POSTER;
  const castList = Array.isArray(credits?.cast) ? credits.cast.slice(0, 8) : [];
  const savedReviews = movieReviewsMap[movie.id]?.reviews || [];
  const ratingValue =
    movieReviewsMap[movie.id]?.rating ??
    (typeof movie.vote_average === 'number' ? Number(movie.vote_average.toFixed(1)) : 0);
  const numericMovieId = Number(id);
  const isFav = (state.favorites || []).includes(numericMovieId);

  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const inputCls = currentTheme?.input || 'bg-gray-950 border-gray-800 text-white';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';
  const accentTextCls = currentTheme?.accentText || 'text-blue-400';

  const handleToggleFavorite = () => {
    dispatch({
      type: isFav ? 'REMOVE_FAVORITE' : 'ADD_FAVORITE',
      payload: numericMovieId,
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !onUpdateMovie) return;
    onUpdateMovie(
      { id: movie.id, title: movie.title, posterUrl, rating: ratingValue },
      { text: reviewText, rating: Number(rating), date: new Date().toLocaleDateString('en-US') }
    );
    setReviewText('');
    setRating(10);
    setEditingReviewId(null);
  };

  const handleStartEdit = (rev) => {
    setEditingReviewId(rev.id);
    setReviewText(rev.text);
    setRating(rev.rating);
  };

  return (
    <div ref={pageContainerRef} className="space-y-8">
      <button
        type="button"
        onClick={handleBack}
        className={`border px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${cardCls}`}
      >
        {t?.back || '← Назад'}
      </button>

      <div className={`border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 ${cardCls}`}>
        <div className="rounded-2xl overflow-hidden border border-white/10 self-start">
          <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              {movie.tagline && <p className="opacity-70 italic text-sm mt-1">«{movie.tagline}»</p>}
            </div>
            <RatingBadge rating={ratingValue} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm opacity-85">
            <span>
              {t?.yearLabel || 'Год'}: {movie.release_date ? movie.release_date.slice(0, 4) : '—'}
            </span>
            {movie.runtime > 0 && (
              <span>
                {t?.runtimeLabel || 'Длительность'}: {movie.runtime} {t?.minutesShort || 'мин.'}
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`px-4 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isFav ? 'bg-rose-600/20 border-rose-500 text-rose-400' : inputCls
              }`}
            >
              {isFav
                ? t?.movieFavActive || '❤️ В избранном'
                : t?.movieFavInactive || '🤍 В избранное'}
            </button>
          </div>

          {Array.isArray(movie.genres) && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre.id} className={`border px-3 py-1 rounded-full text-xs ${inputCls}`}>
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {providers.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accentTextCls}`}>
                {lang === 'en' ? '📺 Where to Watch' : '📺 Где смотреть'}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {providers.map((provider) => (
                  <a
                    key={provider.provider_id}
                    href={provider.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={provider.provider_name}
                    className={`border px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-2 hover:border-blue-500/60 transition-colors ${inputCls}`}
                  >
                    {provider.logo_path && (
                      <img
                        src={`${LOGO_BASE}${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                    )}
                    <span>{provider.provider_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${accentTextCls}`}>
              {t?.overviewTitle || 'Описание'}
            </h2>
            <p className="opacity-90 leading-relaxed text-sm">
              {movie.overview || t?.noOverview || 'Описание отсутствует.'}
            </p>
          </div>

          {castList.length > 0 && (
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accentTextCls}`}>
                {t?.castTitle || 'В главных ролях'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {castList.map((actor) => (
                  <span
                    key={`${actor.id}-${actor.credit_id || actor.name}`}
                    className={`border px-3 py-1.5 rounded-xl text-xs ${inputCls}`}
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

      {trailerKey && (
        <section className={`border rounded-3xl p-6 ${cardCls}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accentTextCls}`}>
            {t?.trailerTitle || '🎬 Официальный трейлер'}
          </h2>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={t?.trailerTitle || 'Официальный трейлер'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {collectionMovies.length > 0 && (
        <section className={`border rounded-3xl p-6 ${cardCls}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accentTextCls}`}>
            {t?.collectionTitle || '🍿 Другие части франшизы'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {collectionMovies.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className={`group border rounded-2xl p-3 transition-all hover:border-blue-500/60 ${inputCls}`}
              >
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : posterUrl
                  }
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl mb-2.5 group-hover:scale-105 transition-transform"
                />
                <p className={`text-xs font-semibold line-clamp-1 ${accentTextCls}`}>
                  {item.title}
                </p>
                <p className="text-[11px] opacity-60 mt-0.5">
                  {item.release_date ? item.release_date.slice(0, 4) : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {similarMovies.length > 0 && (
        <section className={`border rounded-3xl p-6 ${cardCls}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accentTextCls}`}>
            {t?.similarTitle || '🔥 Похожие фильмы'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarMovies.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className={`group border rounded-2xl p-3 transition-all hover:border-blue-500/60 ${inputCls}`}
              >
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : posterUrl
                  }
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl mb-2.5 group-hover:scale-105 transition-transform"
                />
                <p className={`text-xs font-semibold line-clamp-1 ${accentTextCls}`}>
                  {item.title}
                </p>
                <p className="text-[11px] opacity-60 mt-0.5">
                  ★ {typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : '—'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="reviews" className={`border rounded-3xl p-6 space-y-5 scroll-mt-24 ${cardCls}`}>
        <h2 className="text-lg font-bold">
          {t?.reviewsTitle || '💭 Отзывы и оценки'} ({savedReviews.length})
        </h2>

        {user ? (
          <form onSubmit={handleSubmitReview} className={`border p-4 rounded-2xl space-y-4 ${inputCls}`}>
            {editingReviewId && (
              <div
                className={`flex items-center justify-between text-xs font-semibold px-3 py-1.5 rounded-xl ${accentTextCls} bg-black/20`}
              >
                <span>{t?.editingReviewBanner || 'Редактирование вашего отзыва'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setReviewText('');
                    setRating(10);
                  }}
                  className="opacity-70 hover:opacity-100 cursor-pointer"
                >
                  {t?.cancel || 'Отмена'}
                </button>
              </div>
            )}

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t?.reviewPlaceholder || 'Напишите ваш отзыв о фильме...'}
              className={`w-full border rounded-xl p-3 text-sm outline-none resize-none h-24 ${inputCls}`}
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-80">
                  {t?.ratingScaleLabel || 'Оценка (1-10):'}
                </span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className={`border rounded-xl px-3 py-1.5 text-xs font-bold text-yellow-400 outline-none cursor-pointer ${inputCls}`}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      ★ {num} {t?.outOfTen || '/ 10'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`${accentBgCls} text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer`}
              >
                {editingReviewId
                  ? t?.saveChanges || 'Сохранить изменения'
                  : t?.sendReview || 'Отправить'}
              </button>
            </div>
          </form>
        ) : (
          <p className={`text-xs p-4 rounded-2xl border text-center opacity-80 ${inputCls}`}>
            {t?.authRequiredForReview ||
              'Авторизуйтесь, чтобы оставить отзыв или поставить оценку.'}
          </p>
        )}

        <div className="space-y-3">
          {savedReviews.length > 0 ? (
            savedReviews.map((rev) => {
              const isOwner = user && rev.user_email === user.email;
              return (
                <div
                  key={rev.id || rev.date}
                  className={`border p-4 rounded-2xl flex items-start justify-between gap-4 ${inputCls}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${accentTextCls}`}>{rev.author}</span>
                      {isOwner && (
                        <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-md font-medium">
                          {t?.youBadge || 'Вы'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">{rev.text}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold text-xs">
                        ★ {rev.rating} {t?.outOfTen || '/ 10'}
                      </span>
                      <span className="text-[10px] opacity-60">{rev.date}</span>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rev)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs cursor-pointer"
                          title={t?.editReviewTitle || 'Редактировать отзыв'}
                        >
                          ✏️
                        </button>
                        {onDeleteReview && (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs cursor-pointer"
                            title={t?.deleteReviewTitle || 'Удалить отзыв'}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs opacity-60 text-center py-4">
              {t?.noMovieReviews || 'У этого фильма пока нет отзывов.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}