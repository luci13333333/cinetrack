import React, { useEffect, useState } from 'react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function MovieModal({
  movie,
  isOpen,
  onClose,
  user,
  onUpdateMovie,
  isFavorite,
  onToggleFavorite,
  onSelectMovie,
  onDeleteReview,
  theme,
}) {
  if (!isOpen || !movie) return null;

  const currentTheme = theme || {
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    input: 'bg-slate-950 border-slate-800 text-slate-100',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500',
    accentText: 'text-indigo-400',
  };

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '2630a76d06d771cee9916d7510de9cfc';
  const posterSrc =
    movie.posterUrl ||
    (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : FALLBACK_POSTER);
  const yearLabel =
    movie.year || (movie.release_date ? movie.release_date.slice(0, 4) : '2024');
  const ratingLabel =
    movie.rating !== undefined
      ? movie.rating
      : typeof movie.vote_average === 'number'
      ? Number(movie.vote_average.toFixed(1))
      : 0;

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(10);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    setReviewText('');
    setRating(10);
    setEditingReviewId(null);
    setTrailerKey(null);
  }, [movie.id]);

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        const videoRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=ru-RU`
        );
        const videoData = await videoRes.json();

        let officialTrailer = (videoData.results || []).find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );

        if (!officialTrailer) {
          const videoResEn = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
          );
          const videoDataEn = await videoResEn.json();
          officialTrailer =
            (videoDataEn.results || []).find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
            videoDataEn.results?.[0];
        }

        setTrailerKey(officialTrailer ? officialTrailer.key : null);

        const simRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${TMDB_API_KEY}&language=ru-RU`
        );
        const simData = await simRes.json();
        setSimilarMovies((simData.results || []).slice(0, 4));

        const detailRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=ru-RU`
        );
        const detailData = await detailRes.json();

        if (detailData.belongs_to_collection) {
          const collRes = await fetch(
            `https://api.themoviedb.org/3/collection/${detailData.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=ru-RU`
          );
          const collData = await collRes.json();
          setCollectionMovies((collData.parts || []).filter((p) => p.id !== movie.id).slice(0, 4));
        } else {
          setCollectionMovies([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки доп. данных фильма:', err);
      }
    };

    if (movie?.id && TMDB_API_KEY) {
      fetchExtraData();
    }
  }, [movie.id, TMDB_API_KEY]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview = {
      text: reviewText,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-US'),
    };

    onUpdateMovie({ ...movie, posterUrl: posterSrc, title: movie.title }, newReview);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.3);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 100, 0.6);
        }
      `}</style>

      <div
        className={`relative w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col overflow-hidden ${currentTheme.card}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-black/65 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 shadow-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="relative h-52 sm:h-72 w-full flex-shrink-0">
          <img src={posterSrc} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-4 sm:p-6 pr-12 sm:pr-16">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg w-fit mb-1.5 sm:mb-2">
              {yearLabel}
            </span>
            <div className="flex items-end sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md break-words min-w-0">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(movie.id)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                    isFavorite
                      ? 'bg-red-600 text-white'
                      : 'bg-black/60 backdrop-blur text-gray-300 hover:bg-black/80'
                  }`}
                >
                  ♥
                </button>
                <span className="bg-black/60 backdrop-blur border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl text-yellow-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                  ★ {ratingLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-grow custom-scrollbar min-w-0">
          {movie.overview && (
            <div>
              <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>
                Описание
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed opacity-90 break-words">
                {movie.overview}
              </p>
            </div>
          )}

          {trailerKey && (
            <div>
              <h3
                className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${currentTheme.accentText}`}
              >
                🎬 Официальный трейлер
              </h3>
              <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden border shadow-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Официальный трейлер"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {collectionMovies.length > 0 && (
            <div>
              <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 ${currentTheme.accentText}`}>
                🍿 Другие части франшизы
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {collectionMovies.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      onSelectMovie?.({
                        id: item.id,
                        title: item.title,
                        posterUrl: item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : posterSrc,
                        rating: Number((item.vote_average || 0).toFixed(1)),
                        year: item.release_date ? item.release_date.split('-')[0] : '2024',
                        overview: item.overview,
                      })
                    }
                    className={`group cursor-pointer border rounded-2xl p-2 transition-all text-center min-w-0 ${currentTheme.input}`}
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                          : posterSrc
                      }
                      alt=""
                      className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                    />
                    <p className={`text-xs font-semibold truncate ${currentTheme.accentText}`}>
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similarMovies.length > 0 && (
            <div>
              <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 ${currentTheme.accentText}`}>
                🔥 Похожие фильмы
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {similarMovies.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      onSelectMovie?.({
                        id: item.id,
                        title: item.title,
                        posterUrl: item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : posterSrc,
                        rating: Number((item.vote_average || 0).toFixed(1)),
                        year: item.release_date ? item.release_date.split('-')[0] : '2024',
                        overview: item.overview,
                      })
                    }
                    className={`group cursor-pointer border rounded-2xl p-2 transition-all text-center min-w-0 ${currentTheme.input}`}
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                          : posterSrc
                      }
                      alt=""
                      className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                    />
                    <p className={`text-xs font-semibold truncate ${currentTheme.accentText}`}>
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-5 sm:pt-6 opacity-90">
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              💭 Отзывы и оценки ({movie.reviews?.length || 0})
            </h3>

            {user ? (
              <form
                onSubmit={handleSubmitReview}
                className={`border p-3.5 sm:p-4 rounded-2xl space-y-3 sm:space-y-4 mb-6 ${currentTheme.input}`}
              >
                {editingReviewId && (
                  <div
                    className={`flex items-center justify-between text-xs font-semibold px-3 py-1.5 rounded-xl ${currentTheme.accentText} bg-black/20`}
                  >
                    <span>Редактирование вашего отзыва</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setReviewText('');
                        setRating(10);
                      }}
                      className="opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      Отмена
                    </button>
                  </div>
                )}

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Напишите ваш отзыв о фильме..."
                  className={`w-full border rounded-xl p-3 text-sm outline-none resize-none h-24 ${currentTheme.input}`}
                  required
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-80">Оценка (1-10):</span>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className={`border rounded-xl px-3 py-1.5 text-xs font-bold text-yellow-400 outline-none cursor-pointer ${currentTheme.input}`}
                    >
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>
                          ★ {num} / 10
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className={`w-full sm:w-auto ${currentTheme.accentBg} text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer`}
                  >
                    {editingReviewId ? 'Сохранить изменения' : 'Отправить'}
                  </button>
                </div>
              </form>
            ) : (
              <p
                className={`text-xs p-4 rounded-2xl border text-center mb-6 opacity-80 ${currentTheme.input}`}
              >
                Авторизуйтесь, чтобы оставить отзыв или поставить оценку.
              </p>
            )}

            <div className="space-y-3">
              {movie.reviews && movie.reviews.length > 0 ? (
                movie.reviews.map((rev) => {
                  const isOwner = user && rev.user_email === user.email;
                  return (
                    <div
                      key={rev.id || rev.date}
                      className={`border p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${currentTheme.input}`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold break-words ${currentTheme.accentText}`}>
                            {rev.author}
                          </span>
                          {isOwner && (
                            <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-md font-medium">
                              Вы
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed break-words">{rev.text}</p>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-xs">
                            ★ {rev.rating} / 10
                          </span>
                          <span className="text-[10px] opacity-60">{rev.date}</span>
                        </div>

                        {isOwner && (
                          <div className="flex items-center gap-1.5 sm:mt-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(rev)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs cursor-pointer"
                              title="Редактировать отзыв"
                            >
                              ✏️
                            </button>
                            {onDeleteReview && (
                              <button
                                type="button"
                                onClick={() => onDeleteReview(rev.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs cursor-pointer"
                                title="Удалить отзыв"
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
                  У этого фильма пока нет отзывов.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}