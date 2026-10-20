import React, { useState, useEffect } from 'react';

const TMDB_API_KEY = '2630a76d06d771cee9916d7510de9cfc';

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
  theme
}) {
  if (!isOpen || !movie) return null;

  const currentTheme = theme || {
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    input: 'bg-slate-950 border-slate-800 text-slate-100',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500',
    accentText: 'text-indigo-400',
  };

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
        const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=ru-RU`);
        const videoData = await videoRes.json();
        
        let officialTrailer = (videoData.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
        
        if (!officialTrailer) {
          const videoResEn = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
          const videoDataEn = await videoResEn.json();
          officialTrailer = (videoDataEn.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube') || videoDataEn.results?.[0];
        }

        setTrailerKey(officialTrailer ? officialTrailer.key : null);

        const simRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${TMDB_API_KEY}&language=ru-RU`);
        const simData = await simRes.json();
        setSimilarMovies((simData.results || []).slice(0, 4));

        const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=ru-RU`);
        const detailData = await detailRes.json();

        if (detailData.belongs_to_collection) {
          const collRes = await fetch(`https://api.themoviedb.org/3/collection/${detailData.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=ru-RU`);
          const collData = await collRes.json();
          setCollectionMovies((collData.parts || []).filter(p => p.id !== movie.id).slice(0, 4));
        } else {
          setCollectionMovies([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки доп. данных фильма:', err);
      }
    };

    if (movie?.id) {
      fetchExtraData();
    }
  }, [movie.id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview = {
      text: reviewText,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-US')
    };

    onUpdateMovie(movie, newReview);
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
      
      {/* Кастомный аккуратный скроллбар */}
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

      <div className={`relative w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden ${currentTheme.card}`}>
        
        {/* Кнопка закрытия */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/65 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 shadow-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Шапка фильма */}
        <div className="relative h-60 sm:h-72 w-full flex-shrink-0">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg w-fit mb-2">
              {movie.year}
            </span>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {movie.title}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleFavorite(movie.id)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                    isFavorite ? 'bg-red-600 text-white' : 'bg-black/60 backdrop-blur text-gray-300 hover:bg-black/80'
                  }`}
                >
                  ♥
                </button>
                <span className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl text-yellow-400 font-bold text-sm">
                  ★ {movie.rating || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Контент с кастомным скроллбаром */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
          
          {movie.overview && (
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>Описание</h3>
              <p className="text-sm leading-relaxed opacity-90">{movie.overview}</p>
            </div>
          )}

          {trailerKey && (
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${currentTheme.accentText}`}>
                🎬 Официальный трейлер
              </h3>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-xl bg-black">
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
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${currentTheme.accentText}`}>
                🍿 Другие части франшизы
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {collectionMovies.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectMovie({
                      id: item.id,
                      title: item.title,
                      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : movie.posterUrl,
                      rating: Number((item.vote_average || 0).toFixed(1)),
                      year: item.release_date ? item.release_date.split('-')[0] : '2024',
                      overview: item.overview
                    })}
                    className={`group cursor-pointer border rounded-2xl p-2 transition-all text-center ${currentTheme.input}`}
                  >
                    <img 
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : movie.posterUrl} 
                      alt="" 
                      className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform" 
                    />
                    <p className={`text-xs font-semibold truncate ${currentTheme.accentText}`}>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similarMovies.length > 0 && (
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${currentTheme.accentText}`}>
                🔥 Похожие фильмы
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarMovies.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectMovie({
                      id: item.id,
                      title: item.title,
                      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : movie.posterUrl,
                      rating: Number((item.vote_average || 0).toFixed(1)),
                      year: item.release_date ? item.release_date.split('-')[0] : '2024',
                      overview: item.overview
                    })}
                    className={`group cursor-pointer border rounded-2xl p-2 transition-all text-center ${currentTheme.input}`}
                  >
                    <img 
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : movie.posterUrl} 
                      alt="" 
                      className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform" 
                    />
                    <p className={`text-xs font-semibold truncate ${currentTheme.accentText}`}>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6 opacity-90">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              💭 Отзывы и оценки ({movie.reviews?.length || 0})
            </h3>

            {user ? (
              <form onSubmit={handleSubmitReview} className={`border p-4 rounded-2xl space-y-4 mb-6 ${currentTheme.input}`}>
                {editingReviewId && (
                  <div className={`flex items-center justify-between text-xs font-semibold px-3 py-1.5 rounded-xl ${currentTheme.accentText} bg-black/20`}>
                    <span>Редактирование вашего отзыва</span>
                    <button 
                      type="button" 
                      onClick={() => { setEditingReviewId(null); setReviewText(''); setRating(10); }}
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-80">Оценка (1-10):</span>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className={`border rounded-xl px-3 py-1.5 text-xs font-bold text-yellow-400 outline-none cursor-pointer ${currentTheme.input}`}
                    >
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>★ {num} / 10</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className={`${currentTheme.accentBg} text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer`}
                  >
                    {editingReviewId ? 'Сохранить изменения' : 'Отправить'}
                  </button>
                </div>
              </form>
            ) : (
              <p className={`text-xs p-4 rounded-2xl border text-center mb-6 opacity-80 ${currentTheme.input}`}>
                Авторизуйтесь, чтобы оставить отзыв или поставить оценку.
              </p>
            )}

            <div className="space-y-3">
              {movie.reviews && movie.reviews.length > 0 ? (
                movie.reviews.map((rev) => {
                  const isOwner = user && rev.user_email === user.email;
                  return (
                    <div key={rev.id || rev.date} className={`border p-4 rounded-2xl flex items-start justify-between gap-4 ${currentTheme.input}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${currentTheme.accentText}`}>{rev.author}</span>
                          {isOwner && (
                            <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-md font-medium">Вы</span>
                          )}
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">{rev.text}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-xs">★ {rev.rating} / 10</span>
                          <span className="text-[10px] opacity-60">{rev.date}</span>
                        </div>

                        {isOwner && (
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={() => handleStartEdit(rev)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs cursor-pointer"
                              title="Редактировать отзыв"
                            >
                              ✏️
                            </button>
                            {onDeleteReview && (
                              <button
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
                <p className="text-xs opacity-60 text-center py-4">У этого фильма пока нет отзывов.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}