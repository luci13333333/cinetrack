import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export function Layout({
  t,
  lang = 'ru',
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
  const { pathname } = useLocation();
  const { state } = useFavorites();
  const favoritesCount = (state?.favorites || []).length;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const headerCls = currentTheme?.header || 'bg-gray-900/90 border-gray-800 text-white';
  const bgCls = currentTheme?.bg || 'bg-gray-950 text-white';
  const inputCls = currentTheme?.input || 'bg-gray-950 border-gray-800 text-white';
  const accentBgCls = currentTheme?.accentBg || 'bg-blue-600 hover:bg-blue-500';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
      isActive ? `${accentBgCls} text-white` : 'opacity-75 hover:opacity-100 hover:bg-white/5'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
      isActive ? `${accentBgCls} text-white` : `${inputCls} border opacity-90 hover:opacity-100`
    }`;

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${bgCls}`}
    >
      {toastMessage && (
        <div
          className={`fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-20 z-50 ${accentBgCls} text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs sm:text-sm font-semibold text-center sm:text-left`}
        >
          {toastMessage}
        </div>
      )}

      <header className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${headerCls}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <NavLink to="/" className="text-lg sm:text-xl font-bold tracking-tight text-blue-500 shrink-0">
              CineTrack
            </NavLink>

            <nav className="hidden md:flex items-center gap-1.5 min-w-0">
              <NavLink to="/" end className={navLinkClass}>
                {t?.home || 'Главная'}
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                {t?.searchNav || 'Поиск'}
              </NavLink>
              <NavLink to="/favorites" className={navLinkClass}>
                <span>{t?.listsNav || 'Мои списки'}</span>
                {favoritesCount > 0 && (
                  <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-bold">
                    ♥ {favoritesCount}
                  </span>
                )}
              </NavLink>
              {user && (
                <NavLink to="/profile" className={navLinkClass}>
                  {t?.profile || 'Профиль'}
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  {lang === 'en' ? 'Admin' : 'Админка'}
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {themes && setThemeKey && (
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value)}
                aria-label={t?.themeLabel || 'Тема оформления'}
                className={`hidden sm:block max-w-[148px] border text-xs rounded-xl px-2.5 py-2 outline-none cursor-pointer ${inputCls}`}
              >
                {Object.entries(themes).map(([key, th]) => {
                  const themeLabel =
                    typeof th.name === 'object' ? th.name[lang] || th.name.ru : th.name;
                  return (
                    <option key={key} value={key}>
                      {themeLabel}
                    </option>
                  );
                })}
              </select>
            )}

            {setLang && (
              <button
                type="button"
                onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                className={`border text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl cursor-pointer ${inputCls}`}
              >
                {lang === 'ru' ? 'RU' : 'EN'}
              </button>
            )}

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    title={t?.profile || 'Профиль'}
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
                    <span className="text-xs font-medium max-w-[110px] truncate">{user.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-700 bg-black/30 cursor-pointer"
                  >
                    {t?.logout || 'Выйти'}
                  </button>
                </>
              ) : (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className={`${accentBgCls} text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap`}
                  >
                    {t?.login || 'Войти'}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileMenuOpen}
              className={`md:hidden w-10 h-10 rounded-xl border flex items-center justify-center text-base font-bold cursor-pointer ${inputCls}`}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t px-3 py-4 space-y-3 ${headerCls}`}>
            <div className="flex flex-col gap-2">
              <NavLink to="/" end className={mobileNavLinkClass}>
                <span>{t?.home || 'Главная'}</span>
                <span>→</span>
              </NavLink>
              <NavLink to="/search" className={mobileNavLinkClass}>
                <span>{t?.searchNav || 'Поиск'}</span>
                <span>→</span>
              </NavLink>
              <NavLink to="/favorites" className={mobileNavLinkClass}>
                <span>{t?.listsNav || 'Мои списки'}</span>
                <span className="text-xs font-bold">
                  {favoritesCount > 0 ? `♥ ${favoritesCount}` : '→'}
                </span>
              </NavLink>
              {user && (
                <NavLink to="/profile" className={mobileNavLinkClass}>
                  <span>{t?.profile || 'Профиль'}</span>
                  <span>→</span>
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={mobileNavLinkClass}>
                  <span>{lang === 'en' ? 'Admin Panel' : 'Админка'}</span>
                  <span>→</span>
                </NavLink>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              {themes && setThemeKey && (
                <div className="sm:hidden">
                  <label className="block text-[11px] opacity-70 mb-1">
                    {t?.themeLabel || 'Тема оформления:'}
                  </label>
                  <select
                    value={themeKey}
                    onChange={(e) => setThemeKey(e.target.value)}
                    className={`w-full border text-xs rounded-xl px-3 py-2.5 outline-none ${inputCls}`}
                  >
                    {Object.entries(themes).map(([key, th]) => {
                      const themeLabel =
                        typeof th.name === 'object' ? th.name[lang] || th.name.ru : th.name;
                      return (
                        <option key={key} value={key}>
                          {themeLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {user ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-gray-700 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 ${
                          user.color || 'bg-blue-600'
                        }`}
                      >
                        {userInitials || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[11px] opacity-65 truncate">{user.email}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-700 bg-black/30 shrink-0 cursor-pointer"
                  >
                    {t?.logout || 'Выйти'}
                  </button>
                </div>
              ) : (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className={`w-full ${accentBgCls} text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer`}
                  >
                    {t?.login || 'Войти'}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8 min-w-0">
        <Outlet />
      </main>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t?.scrollTop || 'Наверх'}
          className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 ${accentBgCls} text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer`}
        >
          {t?.scrollTop || '↑ Наверх'}
        </button>
      )}
    </div>
  );
}