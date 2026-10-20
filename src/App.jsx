import React, { useState, useEffect } from 'react';
import { MovieCard } from './components/MovieCard';
import { AuthModal } from './components/AuthModal';
import { MovieModal } from './components/MovieModal';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const translations = {
  ru: {
    home: 'Главная',
    favorites: 'Избранное',
    profile: 'Профиль',
    login: 'Войти / Регистрация',
    logout: 'Выйти',
    catalog: 'Каталог TMDB API',
    subtitle: 'Лабораторная работа: асинхронные запросы, загрузка и пагинация',
    searchPlaceholder: 'Поиск в TMDB...',
    reset: 'Сбросить',
    retry: 'Повторить попытку',
    noResults: 'По запросу ничего не найдено',
    allGenres: 'Все жанры',
    allYears: 'Все года',
    minRatingLabel: 'Мин. рейтинг:',
    profileTitle: 'Профиль пользователя',
    saveProfile: 'Сохранить изменения',
    nameLabel: 'Имя пользователя',
    emailLabel: 'Email адрес',
    avatarLabel: 'Ссылка на аватар (URL)',
    colorLabel: 'Цвет профиля',
    themeLabel: 'Тема оформления:',
    favoriteGenre: 'Любимый жанр',
    savedToast: 'Профиль успешно сохранен в БД!',
  },
  en: {
    home: 'Home',
    favorites: 'Favorites',
    profile: 'Profile',
    login: 'Sign In / Register',
    logout: 'Log Out',
    catalog: 'TMDB API Catalog',
    subtitle: 'Lab work: async requests, loading & pagination',
    searchPlaceholder: 'Search TMDB...',
    reset: 'Reset',
    retry: 'Try Again',
    noResults: 'No movies found',
    allGenres: 'All Genres',
    allYears: 'All Years',
    minRatingLabel: 'Min Rating:',
    profileTitle: 'User Profile',
    saveProfile: 'Save Changes',
    nameLabel: 'Username',
    emailLabel: 'Email address',
    avatarLabel: 'Avatar Image URL',
    colorLabel: 'Profile Color',
    themeLabel: 'Theme:',
    favoriteGenre: 'Favorite Genre',
    savedToast: 'Profile successfully saved in DB!',
  }
};

const PROFILE_COLORS = [
  { name: 'Синий', value: 'bg-blue-600' },
  { name: 'Фиолетовый', value: 'bg-purple-600' },
  { name: 'Изумрудный', value: 'bg-emerald-600' },
  { name: 'Огненный', value: 'bg-rose-600' },
  { name: 'Янтарный', value: 'bg-amber-600' }
];

const THEMES = {
  space: {
    name: '🌌 Космическая ночь',
    bg: 'bg-slate-950 text-slate-100',
    header: 'bg-slate-900/80 border-slate-800 text-slate-100',
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    input: 'bg-slate-950 border-slate-800 text-slate-100',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500',
    accentText: 'text-indigo-400',
  },
  vampire: {
    name: '🧛‍♂️ Вампир (Dark)',
    bg: 'bg-neutral-950 text-neutral-100',
    header: 'bg-neutral-900/80 border-red-950 text-neutral-100',
    card: 'bg-neutral-900 border-red-950/50 text-neutral-100',
    input: 'bg-neutral-950 border-neutral-800 text-neutral-100',
    accentBg: 'bg-red-700 hover:bg-red-600',
    accentText: 'text-red-500',
  },
  forest: {
    name: '🌲 Лесной мх',
    bg: 'bg-zinc-950 text-emerald-50',
    header: 'bg-zinc-900/80 border-emerald-950 text-emerald-50',
    card: 'bg-zinc-900 border-emerald-900/30 text-emerald-50',
    input: 'bg-zinc-950 border-emerald-950 text-emerald-50',
    accentBg: 'bg-emerald-700 hover:bg-emerald-600',
    accentText: 'text-emerald-400',
  },
  light: {
    name: '☀️ Светлая классика',
    bg: 'bg-gray-100 text-gray-900',
    header: 'bg-white/80 border-gray-200 text-gray-900',
    card: 'bg-white border-gray-200 text-gray-900',
    input: 'bg-gray-50 border-gray-300 text-gray-900',
    accentBg: 'bg-blue-600 hover:bg-blue-500',
    accentText: 'text-blue-600',
  },
  latte: {
    name: '☕ Теплый латте',
    bg: 'bg-stone-100 text-stone-900',
    header: 'bg-stone-200/80 border-stone-300 text-stone-900',
    card: 'bg-stone-200 border-stone-300 text-stone-900',
    input: 'bg-stone-50 border-stone-300 text-stone-900',
    accentBg: 'bg-amber-700 hover:bg-amber-600',
    accentText: 'text-amber-700',
  },
  cyberpunk: {
    name: '⚡ Киберпанк',
    bg: 'bg-zinc-950 text-yellow-100',
    header: 'bg-black/90 border-yellow-500/30 text-yellow-100',
    card: 'bg-zinc-900 border-yellow-500/30 text-yellow-100',
    input: 'bg-black border-yellow-500/40 text-yellow-200',
    accentBg: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold',
    accentText: 'text-yellow-400',
  },
  ocean: {
    name: '🌊 Океанская бриза',
    bg: 'bg-cyan-950 text-cyan-50',
    header: 'bg-cyan-900/80 border-cyan-800 text-cyan-50',
    card: 'bg-cyan-900/50 border-cyan-800 text-cyan-50',
    input: 'bg-cyan-950 border-cyan-800 text-cyan-50',
    accentBg: 'bg-cyan-600 hover:bg-cyan-500',
    accentText: 'text-cyan-400',
  }
};

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const [lang, setLang] = useState('ru');
  const t = translations[lang];

  const [themeKey, setThemeKey] = useState('space');
  const currentTheme = THEMES[themeKey] || THEMES.space;

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState(0);

  const [toastMessage, setToastMessage] = useState(null);

  const [token, setToken] = useState(() => sessionStorage.getItem('cinetrack_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('cinetrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileColor, setProfileColor] = useState(user?.color || 'bg-blue-600');

  const [favorites, setFavorites] = useState([]);
  const [movieReviewsMap, setMovieReviewsMap] = useState({});

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = sessionStorage.getItem('cinetrack_token');
      if (!savedToken) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfileName(data.user.name || '');
          setProfileEmail(data.user.email || '');
          setProfileAvatar(data.user.avatar || '');
          setProfileColor(data.user.color || 'bg-blue-600');
          sessionStorage.setItem('cinetrack_user', JSON.stringify(data.user));
        } else {
          sessionStorage.removeItem('cinetrack_token');
          sessionStorage.removeItem('cinetrack_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Ошибка проверки сессии:', err);
      }
    };

    if (token && !user) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const apiLang = lang === 'ru' ? 'ru-RU' : 'en-US';
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=${apiLang}`);
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Ошибка жанров:', err);
      }
    };
    fetchGenres();
  }, [lang]);

  useEffect(() => {
    const loadServerData = async () => {
      try {
        const resReviews = await fetch(`${API_URL}/reviews`);
        const reviewsData = await resReviews.json();

        const map = {};
        reviewsData.forEach(r => {
          if (!map[r.movie_id]) map[r.movie_id] = { reviews: [] };
          map[r.movie_id].reviews.push({
            id: r.id, 
            movie_id: r.movie_id,
            movie_title: r.movie_title,
            movie_poster: r.movie_poster,
            author: r.author, 
            text: r.text, 
            rating: r.rating, 
            date: r.date, 
            user_email: r.user_email
          });
        });

        const formattedMap = {};
        Object.keys(map).forEach(mId => {
          const revs = map[mId].reviews;
          const avg = revs.reduce((acc, x) => acc + x.rating, 0) / revs.length;
          formattedMap[mId] = { reviews: revs, rating: Number(avg.toFixed(1)) };
        });

        setMovieReviewsMap(formattedMap);

        if (token) {
          const resFavs = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavs.ok) {
            const favsData = await resFavs.json();
            setFavorites(favsData);
          }
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('Ошибка бэкенда:', err);
      }
    };

    loadServerData();
  }, [token]);

  const handleLogin = (newToken, userData) => {
    sessionStorage.setItem('cinetrack_token', newToken);
    sessionStorage.setItem('cinetrack_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setProfileName(userData.name || '');
    setProfileEmail(userData.email || '');
    setProfileAvatar(userData.avatar || '');
    setProfileColor(userData.color || 'bg-blue-600');
    showToast(`Добро пожаловать, ${userData.name}!`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cinetrack_token');
    sessionStorage.removeItem('cinetrack_user');
    setToken(null);
    setUser(null);
    setFavorites([]);
    setActiveTab('home');
    showToast('Вы вышли из аккаунта');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, avatar: profileAvatar, color: profileColor })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        sessionStorage.setItem('cinetrack_user', JSON.stringify(updatedUser));
        showToast(t.savedToast);
      }
    } catch (err) {
      console.error('Ошибка сохранения профиля:', err);
    }
  };

  const toggleFavorite = async (movieId) => {
    if (!token) {
      setIsAuthOpen(true);
      showToast('Войдите, чтобы добавлять в избранное');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieId })
      });
      if (res.ok) {
        const updatedFavs = await res.json();
        setFavorites(updatedFavs);
      }
    } catch (err) {
      console.error('Ошибка избранного:', err);
    }
  };

  const handleUpdateMovie = async (updatedMovie, newReviewPayload) => {
    if (!token) {
      setIsAuthOpen(true);
      showToast('Войдите, чтобы оставлять отзывы');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: updatedMovie.id,
          movie_title: updatedMovie.title,
          movie_poster: updatedMovie.posterUrl,
          text: newReviewPayload.text,
          rating: newReviewPayload.rating,
          date: newReviewPayload.date
        })
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        const map = {};
        allReviewsList.forEach(r => {
          if (!map[r.movie_id]) map[r.movie_id] = { reviews: [] };
          map[r.movie_id].reviews.push({
            id: r.id, 
            movie_id: r.movie_id,
            movie_title: r.movie_title,
            movie_poster: r.movie_poster,
            author: r.author, 
            text: r.text, 
            rating: r.rating, 
            date: r.date, 
            user_email: r.user_email
          });
        });

        const formattedMap = {};
        Object.keys(map).forEach(mId => {
          const revs = map[mId].reviews;
          const avg = revs.reduce((acc, x) => acc + x.rating, 0) / revs.length;
          formattedMap[mId] = { reviews: revs, rating: Number(avg.toFixed(1)) };
        });

        setMovieReviewsMap(formattedMap);
        
        const currentSaved = formattedMap[updatedMovie.id];
        const finalUpdatedMovie = {
          ...updatedMovie,
          reviews: currentSaved ? currentSaved.reviews : [],
          rating: currentSaved ? currentSaved.rating : updatedMovie.rating
        };

        setMovies(prev => prev.map(m => m.id === finalUpdatedMovie.id ? finalUpdatedMovie : m));
        setSelectedMovie(finalUpdatedMovie);
        showToast('Отзыв успешно сохранен в БД!');
      }
    } catch (err) {
      console.error('Ошибка сохранения отзыва:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        const map = {};
        allReviewsList.forEach(r => {
          if (!map[r.movie_id]) map[r.movie_id] = { reviews: [] };
          map[r.movie_id].reviews.push({
            id: r.id, 
            movie_id: r.movie_id,
            movie_title: r.movie_title,
            movie_poster: r.movie_poster,
            author: r.author, 
            text: r.text, 
            rating: r.rating, 
            date: r.date, 
            user_email: r.user_email
          });
        });

        const formattedMap = {};
        Object.keys(map).forEach(mId => {
          const revs = map[mId].reviews;
          const avg = revs.reduce((acc, x) => acc + x.rating, 0) / revs.length;
          formattedMap[mId] = { reviews: revs, rating: Number(avg.toFixed(1)) };
        });

        setMovieReviewsMap(formattedMap);
        showToast('Отзыв удален из БД');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const fetchMoviesFromApi = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiLang = lang === 'ru' ? 'ru-RU' : 'en-US';
      let endpoint = '';

      if (searchQuery.trim()) {
        endpoint = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}&language=${apiLang}`;
      } else {
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&language=${apiLang}&sort_by=popularity.desc`;
        if (selectedGenre) endpoint += `&with_genres=${selectedGenre}`;
        if (selectedYear) endpoint += `&primary_release_year=${selectedYear}`;
        if (minRating > 0) endpoint += `&vote_average.gte=${minRating}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      
      const formattedMovies = (data.results || []).map(item => {
        const savedData = movieReviewsMap[item.id];
        return {
          id: item.id,
          title: item.title,
          posterUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
          rating: savedData ? savedData.rating : (item.vote_average ? Number(item.vote_average.toFixed(1)) : 0),
          year: item.release_date ? item.release_date.split('-')[0] : '2024',
          overview: item.overview,
          genre_ids: item.genre_ids || [],
          reviews: savedData ? savedData.reviews : []
        };
      });

      setTotalPages(data.total_pages > 500 ? 500 : (data.total_pages || 1));
      setMovies(formattedMovies);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('TMDB API Error:', err);
      setError('Не удалось загрузить данные с сервера.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesFromApi();
  }, [searchQuery, selectedGenre, selectedYear, minRating, lang, page, movieReviewsMap]);

  const displayedMovies = activeTab === 'favorites' 
    ? movies.filter(m => favorites.includes(m.id)) 
    : movies;

  const allUserReviews = Object.values(movieReviewsMap).flatMap(data => data.reviews || []).filter(r => r.user_email === user?.email);
  const userReviewsCount = allUserReviews.length;
  const avgUserRating = userReviewsCount > 0 
    ? (allUserReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / userReviewsCount).toFixed(1) 
    : '0.0';

  const favoriteGenreName = (() => {
    const genreCounts = {};
    const targetMovieIds = [...new Set([...favorites, ...allUserReviews.map(r => r.movie_id)])];
    
    targetMovieIds.forEach(mId => {
      const foundMovie = movies.find(m => m.id === mId);
      if (foundMovie && foundMovie.genre_ids) {
        foundMovie.genre_ids.forEach(gId => {
          genreCounts[gId] = (genreCounts[gId] || 0) + 1;
        });
      }
    });

    const topGenreId = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0];
    const foundGenreObj = genres.find(g => g.id === Number(topGenreId));
    return foundGenreObj ? foundGenreObj.name : 'Не определен';
  })();

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${currentTheme.bg}`}>
      
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 ${currentTheme.accentBg} text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 animate-bounce text-sm font-semibold`}>
          {toastMessage}
        </div>
      )}

      <header className={`border-b backdrop-blur sticky top-0 z-40 transition-colors ${currentTheme.header}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">CineTrack</span>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <button onClick={() => { setActiveTab('home'); setPage(1); }} className={activeTab === 'home' ? `${currentTheme.accentText} font-semibold` : 'opacity-70 hover:opacity-100'}>{t.home}</button>
              <button onClick={() => setActiveTab('favorites')} className={activeTab === 'favorites' ? `${currentTheme.accentText} font-semibold` : 'opacity-70 hover:opacity-100'}>{t.favorites} ({favorites.length})</button>
              {user && <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? `${currentTheme.accentText} font-semibold` : 'opacity-70 hover:opacity-100'}>{t.profile}</button>}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-75 hidden md:inline">{t.themeLabel}</span>
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value)}
                className={`border text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer font-medium ${currentTheme.input}`}
              >
                {Object.entries(THEMES).map(([key, th]) => (
                  <option key={key} value={key}>{th.name}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className={`border text-xs font-bold px-3 py-2.5 rounded-xl ${currentTheme.input}`}>
              {lang === 'ru' ? 'RU' : 'EN'}
            </button>
            
            <div>
              {user ? (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-700" />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${user.color || 'bg-blue-600'}`}>{userInitials}</div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-700 bg-black/30">
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className={`${currentTheme.accentBg} text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors`}>
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {activeTab === 'profile' && user ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`border p-8 rounded-3xl shadow-2xl ${currentTheme.card}`}>
              <div className="flex items-center gap-6 mb-8">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 shadow-xl" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl ${profileColor}`}>
                    {userInitials}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm opacity-70">{user.email}</p>
                  <span className={`inline-block mt-2 border text-xs px-3 py-1 rounded-lg ${currentTheme.accentText}`}>
                    {t.favoriteGenre}: <strong>{favoriteGenreName}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className={`p-4 rounded-2xl border text-center ${currentTheme.input}`}>
                  <span className={`text-3xl font-black ${currentTheme.accentText}`}>{userReviewsCount}</span>
                  <p className="text-xs opacity-70 mt-1">Отзывов в БД</p>
                </div>
                <div className={`p-4 rounded-2xl border text-center ${currentTheme.input}`}>
                  <span className="text-3xl font-black text-yellow-400">★ {avgUserRating} / 10</span>
                  <p className="text-xs opacity-70 mt-1">Средняя оценка</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">{t.nameLabel}</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={`w-full rounded-xl px-4 py-3 border outline-none ${currentTheme.input}`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">{t.avatarLabel}</label>
                  <input type="text" value={profileAvatar} onChange={(e) => setProfileAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" className={`w-full rounded-xl px-4 py-3 border outline-none ${currentTheme.input}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">{t.colorLabel}</label>
                  <div className="flex items-center gap-3">
                    {PROFILE_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setProfileColor(c.value)}
                        className={`w-10 h-10 rounded-xl ${c.value} transition-transform ${profileColor === c.value ? 'scale-110 ring-4 ring-white/30' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className={`w-full ${currentTheme.accentBg} text-white font-semibold py-3 rounded-xl transition-colors`}>{t.saveProfile}</button>
              </form>
            </div>

            <div className={`border p-8 rounded-3xl shadow-2xl ${currentTheme.card}`}>
              <h3 className="text-xl font-bold mb-6">📝 История ваших отзывов из SQLite БД</h3>
              <div className="space-y-4">
                {allUserReviews.length > 0 ? (
                  allUserReviews.map(rev => (
                    <div key={rev.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${currentTheme.input}`}>
                      <div className="flex items-center gap-3">
                        {rev.movie_poster && (
                          <img src={rev.movie_poster} alt="" className="w-12 h-16 object-cover rounded-xl shadow border border-white/10 flex-shrink-0" />
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
                          onClick={() => {
                            const foundMovie = movies.find(m => m.id === rev.movie_id) || {
                              id: rev.movie_id,
                              title: rev.movie_title,
                              posterUrl: rev.movie_poster,
                              rating: movieReviewsMap[rev.movie_id]?.rating || 0,
                              overview: '',
                              reviews: movieReviewsMap[rev.movie_id]?.reviews || []
                            };
                            setSelectedMovie(foundMovie);
                          }} 
                          className="bg-blue-500/10 text-blue-400 p-2 rounded-xl text-xs hover:bg-blue-500/20 transition-colors" 
                          title="Редактировать отзыв"
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteReview(rev.id)} className="bg-red-500/10 text-red-400 p-2 rounded-xl text-xs hover:bg-red-500/20 transition-colors" title="Удалить отзыв">✕</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="opacity-60 text-sm text-center py-6">В базе данных нет ваших отзывов.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className={`border p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between mb-8 ${currentTheme.card}`}>
              <div className="flex flex-wrap gap-3 items-center flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder={t.searchPlaceholder}
                  className={`border px-4 py-2 rounded-xl text-sm outline-none w-48 sm:w-60 ${currentTheme.input}`}
                />

                <select
                  value={selectedGenre}
                  onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); }}
                  className={`border px-3 py-2 rounded-xl text-sm outline-none cursor-pointer ${currentTheme.input}`}
                >
                  <option value="">{t.allGenres}</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
                  className={`border px-3 py-2 rounded-xl text-sm outline-none cursor-pointer ${currentTheme.input}`}
                >
                  <option value="">{t.allYears}</option>
                  {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${currentTheme.input}`}>
                  <span className="text-xs opacity-80">{t.minRatingLabel} <strong className="text-yellow-400">{minRating}</strong></span>
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={minRating}
                    onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1); }}
                    className="accent-blue-500 cursor-pointer w-20"
                  />
                </div>
              </div>

              {(searchQuery || selectedGenre || selectedYear || minRating > 0) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedGenre(''); setSelectedYear(''); setMinRating(0); setPage(1); }}
                  className="bg-black/20 hover:bg-black/40 text-xs px-3 py-2 rounded-xl transition-colors"
                >
                  {t.reset}
                </button>
              )}
            </section>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className={`h-80 rounded-2xl animate-pulse opacity-40 ${currentTheme.card}`}></div>)}
              </div>
            ) : displayedMovies.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {displayedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isFavorite={favorites.includes(movie.id)}
                      onToggleFavorite={toggleFavorite}
                      onCardClick={() => setSelectedMovie(movie)}
                      theme={currentTheme}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-40 ${currentTheme.card}`}
                    >
                      ← Назад
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                      let pageNum = index + 1;
                      if (totalPages > 5 && page > 3) {
                        pageNum = page - 2 + index;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - index);
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                            page === pageNum
                              ? `${currentTheme.accentBg} border-transparent text-white shadow-lg`
                              : currentTheme.card
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-40 ${currentTheme.card}`}
                    >
                      Вперед →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-20 border rounded-2xl ${currentTheme.card}`}>
                <p className="opacity-70 mb-2">{t.noResults}</p>
                <button onClick={() => { setSearchQuery(''); setSelectedGenre(''); setSelectedYear(''); setMinRating(0); }} className={`${currentTheme.accentText} text-sm hover:underline`}>
                  {t.reset}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        user={user}
        onUpdateMovie={(updatedMovie, newRev) => handleUpdateMovie(updatedMovie, newRev)}
        onDeleteReview={handleDeleteReview}
        isFavorite={selectedMovie ? favorites.includes(selectedMovie.id) : false}
        onToggleFavorite={toggleFavorite}
        theme={currentTheme}
        onSelectMovie={(movieObj) => {
          const saved = movieReviewsMap[movieObj.id];
          setSelectedMovie({
            ...movieObj,
            rating: saved ? saved.rating : movieObj.rating,
            reviews: saved ? saved.reviews : []
          });
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
    </div>
  );
}