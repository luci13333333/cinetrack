import React from 'react';
import { Navigate } from 'react-router-dom';

const PROFILE_COLORS = [
  { name: 'Синий', value: 'bg-blue-600' },
  { name: 'Фиолетовый', value: 'bg-purple-600' },
  { name: 'Изумрудный', value: 'bg-emerald-600' },
  { name: 'Огненный', value: 'bg-rose-600' },
  { name: 'Янтарный', value: 'bg-amber-600' },
];

export function ProfilePage({
  t,
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
  allUserReviews,
  userReviewsCount,
  avgUserRating,
  favoriteGenreName,
  onDeleteReview,
  onSelectMovieFromReview,
}) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className={`border p-8 rounded-3xl shadow-2xl ${currentTheme.card}`}>
        <div className="flex items-center gap-6 mb-8">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border-2 shadow-xl"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl ${profileColor}`}
            >
              {userInitials}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm opacity-70">{user.email}</p>
            <span
              className={`inline-block mt-2 border text-xs px-3 py-1 rounded-lg ${currentTheme.accentText}`}
            >
              {t.favoriteGenre}: <strong>{favoriteGenreName}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-2xl border text-center ${currentTheme.input}`}>
            <span className={`text-3xl font-black ${currentTheme.accentText}`}>
              {userReviewsCount}
            </span>
            <p className="text-xs opacity-70 mt-1">Отзывов в БД</p>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${currentTheme.input}`}>
            <span className="text-3xl font-black text-yellow-400">★ {avgUserRating} / 10</span>
            <p className="text-xs opacity-70 mt-1">Средняя оценка</p>
          </div>
        </div>

        <form onSubmit={onSaveProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">{t.nameLabel}</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 border outline-none ${currentTheme.input}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">{t.avatarLabel}</label>
            <input
              type="text"
              value={profileAvatar}
              onChange={(e) => setProfileAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`w-full rounded-xl px-4 py-3 border outline-none ${currentTheme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-80">{t.colorLabel}</label>
            <div className="flex items-center gap-3">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setProfileColor(c.value)}
                  className={`w-10 h-10 rounded-xl ${c.value} transition-transform cursor-pointer ${
                    profileColor === c.value
                      ? 'scale-110 ring-4 ring-white/30'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full ${currentTheme.accentBg} text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer`}
          >
            {t.saveProfile}
          </button>
        </form>
      </div>

      <div className={`border p-8 rounded-3xl shadow-2xl ${currentTheme.card}`}>
        <h3 className="text-xl font-bold mb-6">📝 История ваших отзывов из БД</h3>
        <div className="space-y-4">
          {allUserReviews.length > 0 ? (
            allUserReviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${currentTheme.input}`}
              >
                <div className="flex items-center gap-3">
                  {rev.movie_poster && (
                    <img
                      src={rev.movie_poster}
                      alt=""
                      className="w-12 h-16 object-cover rounded-xl shadow border border-white/10 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">{rev.movie_title || 'Фильм'}</h4>
                    <p className="text-xs opacity-90 mt-1">"{rev.text}"</p>
                    <span className="text-[10px] opacity-60 block mt-1">{rev.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-yellow-400 font-bold text-xs">★ {rev.rating} / 10</span>
                  <button
                    type="button"
                    onClick={() => onSelectMovieFromReview(rev)}
                    className="bg-blue-500/10 text-blue-400 p-2 rounded-xl text-xs hover:bg-blue-500/20 transition-colors cursor-pointer"
                    title="Редактировать отзыв"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteReview(rev.id)}
                    className="bg-red-500/10 text-red-400 p-2 rounded-xl text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="Удалить отзыв"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="opacity-60 text-sm text-center py-6">В базе данных нет ваших отзывов.</p>
          )}
        </div>
      </div>
    </div>
  );
}