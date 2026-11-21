import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export function Layout({
  t,
  lang,
  setLang,
  themeKey,
  setThemeKey,
  themes,
  currentTheme,
  user,
  userInitials,
  onOpenAuth,
  onLogout,
  toastMessage,
}) {
  const navigate = useNavigate();
  const { state } = useFavorites();
  const favoritesCount = state.favorites.length;
  const watchlistCount = state.watchlist.length;

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 ${
      isActive
        ? `${currentTheme?.accentBg || 'bg-blue-600'} text-white`
        : 'opacity-75 hover:opacity-100'
    }`;

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
        currentTheme?.bg || 'bg-gray-950 text-white'
      }`}
    >
      {toastMessage && (
        <div
          className={`fixed bottom-20 right-6 z-50 ${
            currentTheme?.accentBg || 'bg-blue-600'
          } text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-sm font-semibold`}
        >
          {toastMessage}
        </div>
      )}

      <header
        className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${
          currentTheme?.header || 'bg-gray-900/90 border-gray-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 min-h-16 py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="text-xl font-bold tracking-tight text-blue-500">
              CineTrack
            </NavLink>

            <nav className="flex items-center gap-2">
              <NavLink to="/" end className={navLinkClass}>
                {t?.home || 'Главная'}
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                Поиск
              </NavLink>
              <NavLink to="/favorites" className={navLinkClass}>
                <span>Мои списки</span>
                {favoritesCount > 0 && (
                  <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-bold">
                    ♥ {favoritesCount}
                  </span>
                )}
                {watchlistCount > 0 && (
                  <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-bold">
                    📌 {watchlistCount}
                  </span>
                )}
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {themes && setThemeKey && (
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value)}
                className={`border text-xs rounded-xl px-2.5 py-2 outline-none cursor-pointer ${
                  currentTheme?.input || 'bg-gray-950 border-gray-800 text-white'
                }`}
              >
                {Object.entries(themes).map(([key, th]) => (
                  <option key={key} value={key}>
                    {th.name}
                  </option>
                ))}
              </select>
            )}

            {setLang && (
              <button
                type="button"
                onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                className={`border text-xs font-bold px-3 py-2 rounded-xl cursor-pointer ${
                  currentTheme?.input || 'bg-gray-950 border-gray-800 text-white'
                }`}
              >
                {lang === 'ru' ? 'RU' : 'EN'}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  title="Открыть профиль"
                  className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                        user.color || 'bg-blue-600'
                      }`}
                    >
                      {userInitials || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-medium hidden md:inline">{user.name}</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-700 bg-black/30 cursor-pointer"
                >
                  {t?.logout || 'Выйти'}
                </button>
              </div>
            ) : (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className={`${
                    currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500'
                  } text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer`}
                >
                  {t?.login || 'Войти'}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх"
          className={`fixed bottom-6 right-6 z-40 ${
            currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500'
          } text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-colors cursor-pointer`}
        >
          ↑ Наверх
        </button>
      )}
    </div>
  );
}