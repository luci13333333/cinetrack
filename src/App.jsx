import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthModal } from './components/AuthModal';
import { Layout } from './components/Layout';
import { MovieModal } from './components/MovieModal';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { MoviePage } from './pages/MoviePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';

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
    searchPlaceholder: 'Поиск в TMDB...',
    reset: 'Сбросить',
    retry: 'Повторить попытку',
    noResults: 'По запросу ничего не найдено',
    allGenres: 'Все жанры',
    allYears: 'Все года',
    minRatingLabel: 'Мин. рейтинг:',
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
    searchPlaceholder: 'Search TMDB...',
    reset: 'Reset',
    retry: 'Try Again',
    noResults: 'No movies found',
    allGenres: 'All Genres',
    allYears: 'All Years',
    minRatingLabel: 'Min Rating:',
    saveProfile: 'Save Changes',
    nameLabel: 'Username',
    emailLabel: 'Email address',
    avatarLabel: 'Avatar Image URL',
    colorLabel: 'Profile Color',
    themeLabel: 'Theme:',
    favoriteGenre: 'Favorite Genre',
    savedToast: 'Profile successfully saved in DB!',
  },
};

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
  },
};

function buildReviewsMap(reviewsList) {
  const map = {};
  (reviewsList || []).forEach((r) => {
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
      user_email: r.user_email,
    });
  });

  const formattedMap = {};
  Object.keys(map).forEach((mId) => {
    const revs = map[mId].reviews;
    const avg = revs.reduce((acc, x) => acc + Number(x.rating || 0), 0) / revs.length;
    formattedMap[mId] = { reviews: revs, rating: Number(avg.toFixed(1)) };
  });
  return formattedMap;
}

export default function App() {
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [lang, setLang] = useState('ru');
  const t = translations[lang];

  const [themeKey, setThemeKey] = useState('space');
  const currentTheme = THEMES[themeKey] || THEMES.space;

  const [genres, setGenres] = useState([]);
  const [knownMovies, setKnownMovies] = useState([]);
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

  const handleMoviesLoaded = (loadedList) => {
    setKnownMovies((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      loadedList.forEach((m) => map.set(m.id, m));
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = sessionStorage.getItem('cinetrack_token');
      if (!savedToken) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
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
  }, [token, user]);

  useEffect(() => {
    const fetchGenres = async () => {
      if (!TMDB_API_KEY) return;
      try {
        const apiLang = lang === 'ru' ? 'ru-RU' : 'en-US';
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=${apiLang}`
        );
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
        if (resReviews.ok) {
          const reviewsData = await resReviews.json();
          setMovieReviewsMap(buildReviewsMap(reviewsData));
        }

        if (token) {
          const resFavs = await fetch(`${API_URL}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
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
    navigate('/');
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileName, avatar: profileAvatar, color: profileColor }),
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movie_id: updatedMovie.id,
          movie_title: updatedMovie.title,
          movie_poster: updatedMovie.posterUrl,
          text: newReviewPayload.text,
          rating: newReviewPayload.rating,
          date: newReviewPayload.date,
        }),
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        const formattedMap = buildReviewsMap(allReviewsList);
        setMovieReviewsMap(formattedMap);

        const currentSaved = formattedMap[updatedMovie.id];
        setSelectedMovie({
          ...updatedMovie,
          reviews: currentSaved ? currentSaved.reviews : [],
          rating: currentSaved ? currentSaved.rating : updatedMovie.rating,
        });
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const allReviewsList = await res.json();
        setMovieReviewsMap(buildReviewsMap(allReviewsList));
        showToast('Отзыв удален из БД');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const allUserReviews = Object.values(movieReviewsMap)
    .flatMap((data) => data.reviews || [])
    .filter((r) => r.user_email === user?.email);

  const userReviewsCount = allUserReviews.length;
  const avgUserRating =
    userReviewsCount > 0
      ? (
          allUserReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / userReviewsCount
        ).toFixed(1)
      : '0.0';

  const favoriteGenreName = (() => {
    const genreCounts = {};
    const targetMovieIds = [...new Set([...favorites, ...allUserReviews.map((r) => r.movie_id)])];

    targetMovieIds.forEach((mId) => {
      const foundMovie = knownMovies.find((m) => m.id === mId);
      if (foundMovie?.genre_ids) {
        foundMovie.genre_ids.forEach((gId) => {
          genreCounts[gId] = (genreCounts[gId] || 0) + 1;
        });
      }
    });

    const topGenreId = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0];
    const foundGenreObj = genres.find((g) => g.id === Number(topGenreId));
    return foundGenreObj ? foundGenreObj.name : 'Не определен';
  })();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              t={t}
              lang={lang}
              setLang={setLang}
              themeKey={themeKey}
              setThemeKey={setThemeKey}
              themes={THEMES}
              currentTheme={currentTheme}
              user={user}
              userInitials={userInitials}
              favoritesCount={favorites.length}
              onOpenAuth={() => setIsAuthOpen(true)}
              onLogout={handleLogout}
              toastMessage={toastMessage}
            />
          }
        >
          <Route
            index
            element={
              <HomePage
                t={t}
                lang={lang}
                genres={genres}
                currentTheme={currentTheme}
                favorites={favorites}
                movieReviewsMap={movieReviewsMap}
                onToggleFavorite={toggleFavorite}
                onOpenMovieModal={setSelectedMovie}
                onMoviesLoaded={handleMoviesLoaded}
              />
            }
          />
          <Route
            path="search"
            element={
              <SearchPage
                t={t}
                lang={lang}
                currentTheme={currentTheme}
                favorites={favorites}
                movieReviewsMap={movieReviewsMap}
                onToggleFavorite={toggleFavorite}
                onOpenMovieModal={setSelectedMovie}
              />
            }
          />
          <Route
            path="movie/:id"
            element={
              <MoviePage
                lang={lang}
                currentTheme={currentTheme}
                favorites={favorites}
                movieReviewsMap={movieReviewsMap}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="favorites"
            element={
              <FavoritesPage
                currentTheme={currentTheme}
                favorites={favorites}
                knownMovies={knownMovies}
                movieReviewsMap={movieReviewsMap}
                onToggleFavorite={toggleFavorite}
                onOpenMovieModal={setSelectedMovie}
              />
            }
          />
          <Route
            path="profile"
            element={
              <ProfilePage
                t={t}
                user={user}
                userInitials={userInitials}
                currentTheme={currentTheme}
                profileName={profileName}
                setProfileName={setProfileName}
                profileAvatar={profileAvatar}
                setProfileAvatar={setProfileAvatar}
                profileColor={profileColor}
                setProfileColor={setProfileColor}
                onSaveProfile={handleSaveProfile}
                allUserReviews={allUserReviews}
                userReviewsCount={userReviewsCount}
                avgUserRating={avgUserRating}
                favoriteGenreName={favoriteGenreName}
                onDeleteReview={handleDeleteReview}
                onSelectMovieFromReview={(rev) => {
                  const foundMovie = knownMovies.find((m) => m.id === rev.movie_id) || {
                    id: rev.movie_id,
                    title: rev.movie_title,
                    posterUrl: rev.movie_poster,
                    rating: movieReviewsMap[rev.movie_id]?.rating || 0,
                    overview: '',
                    reviews: movieReviewsMap[rev.movie_id]?.reviews || [],
                  };
                  setSelectedMovie(foundMovie);
                }}
              />
            }
          />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        user={user}
        onUpdateMovie={handleUpdateMovie}
        onDeleteReview={handleDeleteReview}
        isFavorite={selectedMovie ? favorites.includes(selectedMovie.id) : false}
        onToggleFavorite={toggleFavorite}
        theme={currentTheme}
        onSelectMovie={(movieObj) => {
          const saved = movieReviewsMap[movieObj.id];
          setSelectedMovie({
            ...movieObj,
            rating: saved ? saved.rating : movieObj.rating,
            reviews: saved ? saved.reviews : [],
          });
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
    </>
  );
}