import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="text-xl font-bold tracking-tight text-blue-500">
            CineTrack
          </NavLink>

          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Главная
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Поиск
            </NavLink>
            <NavLink to="/favorites" className={navLinkClass}>
              Избранное
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Наверх"
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-colors"
        >
          ↑ Наверх
        </button>
      )}
    </div>
  );
}