import React, { useCallback, useEffect, useState } from 'react';

const PROFILE_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
];

export function AdminPage({
  apiUrl,
  token,
  user,
  lang = 'ru',
  currentTheme,
  onNotify,
  onReviewsUpdated,
}) {
  const [section, setSection] = useState('users'); // 'users' | 'reviews'
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchReview, setSearchReview] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    avatar: '',
    color: 'bg-blue-600',
    role: 'user',
  });

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    text: '',
    rating: 10,
  });

  const cardCls = currentTheme?.card || 'bg-gray-900 border-gray-800 text-white';
  const inputCls = currentTheme?.input || 'bg-gray-950 border-gray-800 text-white';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';
  const accentTextCls = currentTheme?.accentText || 'text-blue-400';

  const loadAdminData = useCallback(async () => {
    if (!token || !apiUrl) return;
    setLoading(true);
    try {
      const [usersRes, reviewsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/admin/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const list = Array.isArray(reviewsData) ? reviewsData : [];
        setReviews(list);
        if (onReviewsUpdated) onReviewsUpdated(list);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных админки:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, onReviewsUpdated]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (!user || user.role !== 'admin') {
    return (
      <div className={`border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-2 ${cardCls}`}>
        <h1 className="text-lg sm:text-xl font-bold">
          {lang === 'en' ? 'Access Denied' : 'Доступ ограничен'}
        </h1>
        <p className="text-xs sm:text-sm opacity-70">
          {lang === 'en'
            ? 'Administrator privileges are required to view this page.'
            : 'Эта страница доступна только пользователям с правами администратора.'}
        </p>
      </div>
    );
  }

  const startEditUser = (u) => {
    const id = u._id || u.id;
    setEditingUserId(id);
    setUserForm({
      name: u.name || '',
      avatar: u.avatar || '',
      color: u.color || 'bg-blue-600',
      role: u.role || 'user',
    });
  };

  const handleSaveUser = async (e, targetId) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/admin/users/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((item) => ((item._id || item.id) === targetId ? updated : item))
        );
        setEditingUserId(null);
        onNotify?.(lang === 'en' ? 'User updated' : 'Данные пользователя обновлены');
      }
    } catch (err) {
      console.error('Ошибка сохранения пользователя:', err);
    }
  };

  const handleDeleteUser = async (targetId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((item) => (item._id || item.id) !== targetId));
        onNotify?.(lang === 'en' ? 'User deleted' : 'Пользователь удалён');
        loadAdminData();
      } else {
        const errData = await res.json().catch(() => ({}));
        onNotify?.(
          errData.message || (lang === 'en' ? 'Failed to delete user' : 'Не удалось удалить пользователя')
        );
      }
    } catch (err) {
      console.error('Ошибка удаления пользователя:', err);
    }
  };

  const startEditReview = (rev) => {
    const id = rev._id || rev.id;
    setEditingReviewId(id);
    setReviewForm({
      text: rev.text || '',
      rating: Number(rev.rating) || 10,
    });
  };

  const handleSaveReview = async (e, revId) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/admin/reviews/${revId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: reviewForm.text.trim(),
          rating: Number(reviewForm.rating),
        }),
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        setReviews(Array.isArray(allReviewsList) ? allReviewsList : []);
        if (onReviewsUpdated) onReviewsUpdated(allReviewsList);
        setEditingReviewId(null);
        onNotify?.(lang === 'en' ? 'Review updated' : 'Отзыв обновлён');
      }
    } catch (err) {
      console.error('Ошибка сохранения отзыва:', err);
    }
  };

  const handleDeleteReview = async (revId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/reviews/${revId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        setReviews(Array.isArray(allReviewsList) ? allReviewsList : []);
        if (onReviewsUpdated) onReviewsUpdated(allReviewsList);
        onNotify?.(lang === 'en' ? 'Review deleted' : 'Отзыв удалён');
      }
    } catch (err) {
      console.error('Ошибка удаления отзыва:', err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchReview.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.author || '').toLowerCase().includes(q) ||
      (r.user_email || '').toLowerCase().includes(q) ||
      (r.movie_title || '').toLowerCase().includes(q) ||
      (r.text || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 shadow-xl ${cardCls}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">
              {lang === 'en' ? '🛡️ Admin Panel' : '🛡️ Панель администратора'}
            </h1>
            <p className="text-xs opacity-70 mt-1">
              {lang === 'en'
                ? 'Manage users, profiles, roles, and reviews'
                : 'Управление пользователями, профилями, ролями и отзывами'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSection('users')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                section === 'users'
                  ? `${accentBgCls} border-transparent text-white`
                  : `${inputCls} opacity-80 hover:opacity-100`
              }`}
            >
              {lang === 'en' ? 'Users' : 'Пользователи'} ({users.length})
            </button>

            <button
              type="button"
              onClick={() => setSection('reviews')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                section === 'reviews'
                  ? `${accentBgCls} border-transparent text-white`
                  : `${inputCls} opacity-80 hover:opacity-100`
              }`}
            >
              {lang === 'en' ? 'Reviews' : 'Отзывы'} ({reviews.length})
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm opacity-70 py-6 text-center">
            {lang === 'en' ? 'Loading...' : 'Загрузка данных...'}
          </p>
        ) : section === 'users' ? (
          <div className="space-y-3">
            {users.map((u) => {
              const id = u._id || u.id;
              const isEditing = editingUserId === id;
              const isSelf = String(user._id || user.id) === String(id);
              const initials = (u.name || 'U')
                .split(' ')
                .map((part) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={id} className={`border rounded-2xl p-3.5 sm:p-4 space-y-3 ${inputCls}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-xl ${
                            u.color || 'bg-blue-600'
                          } text-white font-bold text-sm flex items-center justify-center shrink-0`}
                        >
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{u.name}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-white/10 opacity-75'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>
                        </div>
                        <p className="text-xs opacity-70 break-all">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingUserId(null) : startEditUser(u))}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-semibold cursor-pointer"
                      >
                        {isEditing
                          ? lang === 'en'
                            ? 'Cancel'
                            : 'Отмена'
                          : lang === 'en'
                          ? 'Edit'
                          : 'Редактировать'}
                      </button>

                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(id)}
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold cursor-pointer"
                        >
                          {lang === 'en' ? 'Delete' : 'Удалить'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <form
                      onSubmit={(e) => handleSaveUser(e, id)}
                      className="pt-3 border-t border-white/10 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs opacity-75 mb-1">
                            {lang === 'en' ? 'Name' : 'Имя'}
                          </label>
                          <input
                            type="text"
                            value={userForm.name}
                            onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${cardCls}`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs opacity-75 mb-1">
                            {lang === 'en' ? 'Role' : 'Роль'}
                          </label>
                          <select
                            value={userForm.role}
                            onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none cursor-pointer ${cardCls}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs opacity-75 mb-1">
                          {lang === 'en' ? 'Avatar URL' : 'Ссылка на фото (URL)'}
                        </label>
                        <input
                          type="text"
                          value={userForm.avatar}
                          onChange={(e) => setUserForm((f) => ({ ...f, avatar: e.target.value }))}
                          placeholder="https://..."
                          className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${cardCls}`}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs opacity-75">
                            {lang === 'en' ? 'Color:' : 'Цвет:'}
                          </span>
                          {PROFILE_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setUserForm((f) => ({ ...f, color: c }))}
                              className={`w-6 h-6 rounded-full ${c} cursor-pointer ${
                                userForm.color === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          type="submit"
                          className={`w-full sm:w-auto ${accentBgCls} text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer`}
                        >
                          {lang === 'en' ? 'Save' : 'Сохранить'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={searchReview}
              onChange={(e) => setSearchReview(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search by author, email, movie or review text...'
                  : 'Поиск по автору, email, фильму или тексту...'
              }
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none ${inputCls}`}
            />

            <div className="space-y-3">
              {filteredReviews.map((rev) => {
                const revId = rev._id || rev.id;
                const isEditing = editingReviewId === revId;

                return (
                  <div key={revId} className={`border rounded-2xl p-3.5 sm:p-4 space-y-3 ${inputCls}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold break-words ${accentTextCls}`}>
                            {rev.movie_title || `#${rev.movie_id}`}
                          </span>
                          <span className="text-xs opacity-75 break-all">
                            • {rev.author} ({rev.user_email})
                          </span>
                        </div>
                        {!isEditing && <p className="text-xs opacity-90 break-words">{rev.text}</p>}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <span className="text-yellow-400 font-bold text-xs">
                          ★ {rev.rating} / 10
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => (isEditing ? setEditingReviewId(null) : startEditReview(rev))}
                            className="px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-semibold cursor-pointer"
                          >
                            {isEditing
                              ? lang === 'en'
                                ? 'Cancel'
                                : 'Отмена'
                              : lang === 'en'
                              ? 'Edit'
                              : 'Редактировать'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(revId)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold cursor-pointer"
                          >
                            {lang === 'en' ? 'Delete' : 'Удалить'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <form
                        onSubmit={(e) => handleSaveReview(e, revId)}
                        className="pt-3 border-t border-white/10 space-y-3"
                      >
                        <textarea
                          value={reviewForm.text}
                          onChange={(e) =>
                            setReviewForm((f) => ({ ...f, text: e.target.value }))
                          }
                          className={`w-full border rounded-xl p-3 text-sm outline-none resize-none h-20 ${cardCls}`}
                          required
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <select
                            value={reviewForm.rating}
                            onChange={(e) =>
                              setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
                            }
                            className={`border rounded-xl px-3 py-1.5 text-xs font-bold text-yellow-400 outline-none cursor-pointer ${cardCls}`}
                          >
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                              <option key={num} value={num}>
                                ★ {num} / 10
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className={`w-full sm:w-auto ${accentBgCls} text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer`}
                          >
                            {lang === 'en' ? 'Save' : 'Сохранить'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}