import React, { useState } from 'react';

const PROFILE_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
];

export function ProfilePage({
  t,
  lang = 'ru',
  user,
  userInitials,
  currentTheme,
  profileName,
  setProfileName,
  profileAvatar,
  setProfileAvatar,
  profileColor,
  setProfileColor,
  onSaveProfile,
  allUserReviews = [],
  userReviewsCount = 0,
  avgUserRating = '0.0',
  favoriteGenreName = 'Не определен',
  onUpdateReview,
  onDeleteReview,
  onSelectMovieFromReview,
}) {
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(10);
  const [savingReview, setSavingReview] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12 opacity-70">
        {lang === 'en'
          ? 'Sign in to view your profile.'
          : 'Войдите в аккаунт, чтобы просмотреть профиль.'}
      </div>
    );
  }

  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const inputCls = currentTheme?.input || 'bg-gray-950 border-gray-800 text-white';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';
  const accentTextCls = currentTheme?.accentText || 'text-blue-400';

  const startEditing = (rev) => {
    setEditingReviewId(rev.id);
    setEditText(rev.text || '');
    setEditRating(Number(rev.rating) || 10);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditText('');
    setEditRating(10);
  };

  const handleSaveInlineReview = async (e, rev) => {
    e.preventDefault();
    if (!editText.trim() || !onUpdateReview || savingReview) return;

    setSavingReview(true);
    const ok = await onUpdateReview(
      {
        id: rev.movie_id,
        title: rev.movie_title,
        posterUrl: rev.movie_poster,
      },
      {
        text: editText.trim(),
        rating: Number(editRating),
        date: new Date().toLocaleDateString('en-US'),
      }
    );
    setSavingReview(false);

    if (ok !== false) {
      cancelEditing();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className={`border rounded-3xl p-6 space-y-6 shadow-xl ${cardCls}`}>
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg ${profileColor}`}
            >
              {userInitials}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-xs opacity-70">{user.email}</p>
            <div className="pt-1">
              <span
                className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full ${inputCls} ${accentTextCls}`}
              >
                {t?.favoriteGenre || 'Любимый жанр'}: {favoriteGenreName}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`border rounded-2xl p-4 text-center ${inputCls}`}>
            <p className={`text-2xl font-extrabold ${accentTextCls}`}>{userReviewsCount}</p>
            <p className="text-xs opacity-70 mt-1">{t?.reviewsInDb || 'Отзывов'}</p>
          </div>
          <div className={`border rounded-2xl p-4 text-center ${inputCls}`}>
            <p className="text-2xl font-extrabold text-yellow-400">
              ★ {avgUserRating} {t?.outOfTen || '/ 10'}
            </p>
            <p className="text-xs opacity-70 mt-1">{t?.avgRating || 'Средняя оценка'}</p>
          </div>
        </div>

        <form onSubmit={onSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium opacity-80 mb-1.5">
              {t?.nameLabel || 'Имя пользователя'}
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none ${inputCls}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80 mb-1.5">
              {t?.avatarLabel || 'Ссылка на аватар (URL)'}
            </label>
            <input
              type="url"
              value={profileAvatar}
              onChange={(e) => setProfileAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none ${inputCls}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80 mb-1.5">
              {t?.colorLabel || 'Цвет профиля'}
            </label>
            <div className="flex items-center gap-3">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setProfileColor(c)}
                  className={`w-8 h-8 rounded-full ${c} cursor-pointer transition-transform ${
                    profileColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${accentBgCls} text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-lg mt-2`}
          >
            {t?.saveProfile || 'Сохранить изменения'}
          </button>
        </form>
      </div>

      <div className={`border rounded-3xl p-6 space-y-4 shadow-xl ${cardCls}`}>
        <h2 className="text-lg font-bold">
          {t?.reviewsHistoryTitle || '📝 История ваших отзывов'} ({allUserReviews.length})
        </h2>

        {allUserReviews.length > 0 ? (
          <div className="space-y-3">
            {allUserReviews.map((rev) => {
              const isEditing = editingReviewId === rev.id;

              return (
                <div
                  key={rev.id || `${rev.movie_id}-${rev.date}`}
                  className={`border rounded-2xl p-4 space-y-3 ${inputCls}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      onClick={() => onSelectMovieFromReview && onSelectMovieFromReview(rev)}
                      className="flex items-center gap-3 cursor-pointer group min-w-0"
                    >
                      {rev.movie_poster && (
                        <img
                          src={rev.movie_poster}
                          alt={rev.movie_title}
                          className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold group-hover:underline truncate ${accentTextCls}`}
                        >
                          {rev.movie_title ||
                            (lang === 'en' ? `Movie #${rev.movie_id}` : `Фильм #${rev.movie_id}`)}
                        </p>
                        {!isEditing && (
                          <p className="text-xs opacity-90 line-clamp-2 mt-0.5">«{rev.text}»</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-yellow-400 font-bold text-xs block">
                          ★ {rev.rating} {t?.outOfTen || '/ 10'}
                        </span>
                        <span className="text-[10px] opacity-60">{rev.date}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => (isEditing ? cancelEditing() : startEditing(rev))}
                        className={`p-2 rounded-xl transition-colors text-xs cursor-pointer ${
                          isEditing
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        }`}
                        title={t?.editReviewTitle || 'Редактировать отзыв'}
                      >
                        ✏️
                      </button>

                      {onDeleteReview && (
                        <button
                          type="button"
                          onClick={() => onDeleteReview(rev.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs cursor-pointer"
                          title={t?.deleteReviewTitle || 'Удалить отзыв'}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <form
                      onSubmit={(e) => handleSaveInlineReview(e, rev)}
                      className="pt-3 border-t border-white/10 space-y-3"
                    >
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder={t?.reviewPlaceholder || 'Напишите ваш отзыв о фильме...'}
                        className={`w-full border rounded-xl p-3 text-sm outline-none resize-none h-24 ${cardCls}`}
                        required
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-80">
                            {t?.ratingScaleLabel || 'Оценка (1-10):'}
                          </span>
                          <select
                            value={editRating}
                            onChange={(e) => setEditRating(Number(e.target.value))}
                            className={`border rounded-xl px-3 py-1.5 text-xs font-bold text-yellow-400 outline-none cursor-pointer ${cardCls}`}
                          >
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                              <option key={num} value={num}>
                                ★ {num} {t?.outOfTen || '/ 10'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className={`border px-4 py-2 rounded-xl text-xs font-medium opacity-80 hover:opacity-100 cursor-pointer ${cardCls}`}
                          >
                            {t?.cancel || 'Отмена'}
                          </button>
                          <button
                            type="submit"
                            disabled={savingReview}
                            className={`${accentBgCls} text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-60`}
                          >
                            {t?.saveChanges || 'Сохранить изменения'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs opacity-60 text-center py-4">
            {t?.noUserReviews || 'У вас пока нет отзывов.'}
          </p>
        )}
      </div>
    </div>
  );
}