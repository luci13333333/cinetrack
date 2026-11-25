import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthModal } from './components/AuthModal';
import { Layout } from './components/Layout';
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminPage } from './pages/AdminPage';
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
    searchNav: 'Поиск',
    listsNav: 'Мои списки',
    favorites: 'Избранное',
    profile: 'Профиль',
    login: 'Войти / Регистрация',
    logout: 'Выйти',
    catalog: 'Каталог TMDB API',
    searchPageTitle: 'Поиск фильмов',
    searchPlaceholder: 'Поиск в TMDB...',
    searchHint: 'Введите название фильма, чтобы начать поиск.',
    searching: 'Ищем фильмы...',
    share: 'Поделиться',
    copied: '✓ Ссылка скопирована',
    reset: 'Сбросить',
    retry: 'Повторить попытку',
    noResults: 'По запросу ничего не найдено',
    allGenres: 'Все жанры',
    allYears: 'Все года',
    minRatingLabel: 'Мин. рейтинг:',
    inFavorites: '♥ В избранном',
    addToFavorites: '♡ В избранное',
    reviewsButton: '💬 Отзывы',
    movieFavActive: '❤️ В избранном',
    movieFavInactive: '🤍 В избранное',
    statusLabel: 'Статус просмотра',
    statusNone: '+ Статус просмотра',
    statusWatchlist: '📌 Хочу посмотреть',
    statusWatching: '▶ Смотрю',
    statusCompleted: '✅ Просмотрено',
    statusOnHold: '⏸ Отложено',
    statusDropped: '✖ Бросил',
    listsTitle: 'Мои списки',
    listsSubtitle: 'Категории фильмов, сохранённые в вашем аккаунте',
    listsEmpty: 'Списки пока пусты. Добавьте фильмы на главной странице или в поиске.',
    favoritesEmpty: 'В избранном пока пусто.',
    statusCategoriesTitle: '📂 Категории просмотра',
    sectionEmpty: 'Пока пусто',
    unknownYear: 'Год неизвестен',
    back: '← Назад',
    movieLoading: 'Загрузка карточки фильма...',
    movieNotFound: 'Фильм не найден.',
    yearLabel: 'Год',
    runtimeLabel: 'Длительность',
    minutesShort: 'мин.',
    overviewTitle: 'Описание',
    noOverview: 'Описание отсутствует.',
    castTitle: 'В главных ролях',
    trailerTitle: '🎬 Официальный трейлер',
    collectionTitle: '🍿 Другие части франшизы',
    similarTitle: '🔥 Похожие фильмы',
    reviewsTitle: '💭 Отзывы и оценки',
    editingReviewBanner: 'Редактирование вашего отзыва',
    cancel: 'Отмена',
    reviewPlaceholder: 'Напишите ваш отзыв о фильме...',
    ratingScaleLabel: 'Оценка (1-10):',
    outOfTen: '/ 10',
    saveChanges: 'Сохранить изменения',
    sendReview: 'Отправить',
    authRequiredForReview: 'Авторизуйтесь, чтобы оставить отзыв или поставить оценку.',
    youBadge: 'Вы',
    noMovieReviews: 'У этого фильма пока нет отзывов.',
    editReviewTitle: 'Редактировать отзыв',
    deleteReviewTitle: 'Удалить отзыв',
    notFoundTitle: 'Страница не найдена',
    notFoundDescription: 'Запрашиваемый адрес не существует или был перемещён.',
    backHome: 'Вернуться на главную',
    saveProfile: 'Сохранить изменения',
    nameLabel: 'Имя пользователя',
    emailLabel: 'Email адрес',
    avatarLabel: 'Ссылка на аватар (URL)',
    colorLabel: 'Цвет профиля',
    themeLabel: 'Тема оформления:',
    favoriteGenre: 'Любимый жанр',
    favoriteGenreUnknown: 'Не определен',
    reviewsInDb: 'Отзывов',
    avgRating: 'Средняя оценка',
    reviewsHistoryTitle: '📝 История ваших отзывов',
    noUserReviews: 'У вас пока нет отзывов.',
    savedToast: 'Профиль успешно сохранен!',
    scrollTop: '↑ Наверх',
  },
  en: {
    home: 'Home',
    searchNav: 'Search',
    listsNav: 'My Lists',
    favorites: 'Favorites',
    profile: 'Profile',
    login: 'Sign In / Register',
    logout: 'Log Out',
    catalog: 'TMDB API Catalog',
    searchPageTitle: 'Search Movies',
    searchPlaceholder: 'Search TMDB...',
    searchHint: 'Enter a movie title to start searching.',
    searching: 'Searching movies...',
    share: 'Share',
    copied: '✓ Link copied',
    reset: 'Reset',
    retry: 'Try Again',
    noResults: 'No movies found',
    allGenres: 'All Genres',
    allYears: 'All Years',
    minRatingLabel: 'Min Rating:',
    inFavorites: '♥ In Favorites',
    addToFavorites: '♡ Add to Favorites',
    reviewsButton: '💬 Reviews',
    movieFavActive: '❤️ In Favorites',
    movieFavInactive: '🤍 Add to Favorites',
    statusLabel: 'Watch status',
    statusNone: '+ Watch status',
    statusWatchlist: '📌 Plan to Watch',
    statusWatching: '▶ Watching',
    statusCompleted: '✅ Completed',
    statusOnHold: '⏸ On Hold',
    statusDropped: '✖ Dropped',
    listsTitle: 'My Lists',
    listsSubtitle: 'Movie categories saved in your account',
    listsEmpty: 'Your lists are empty. Add movies from the home page or search.',
    favoritesEmpty: 'No movies in favorites yet.',
    statusCategoriesTitle: '📂 Watch Categories',
    sectionEmpty: 'Empty for now',
    unknownYear: 'Year unknown',
    back: '← Back',
    movieLoading: 'Loading movie details...',
    movieNotFound: 'Movie not found.',
    yearLabel: 'Year',
    runtimeLabel: 'Runtime',
    minutesShort: 'min.',
    overviewTitle: 'Overview',
    noOverview: 'No overview available.',
    castTitle: 'Top Billed Cast',
    trailerTitle: '🎬 Official Trailer',
    collectionTitle: '🍿 More in the Franchise',
    similarTitle: '🔥 Similar Movies',
    reviewsTitle: '💭 Reviews & Ratings',
    editingReviewBanner: 'Editing your review',
    cancel: 'Cancel',
    reviewPlaceholder: 'Write your review of the movie...',
    ratingScaleLabel: 'Rating (1-10):',
    outOfTen: '/ 10',
    saveChanges: 'Save Changes',
    sendReview: 'Submit',
    authRequiredForReview: 'Sign in to leave a review or rate this movie.',
    youBadge: 'You',
    noMovieReviews: 'No reviews for this movie yet.',
    editReviewTitle: 'Edit review',
    deleteReviewTitle: 'Delete review',
    notFoundTitle: 'Page Not Found',
    notFoundDescription: 'The requested page does not exist or has been moved.',
    backHome: 'Back to Home',
    saveProfile: 'Save Changes',
    nameLabel: 'Username',
    emailLabel: 'Email address',
    avatarLabel: 'Avatar Image URL',
    colorLabel: 'Profile Color',
    themeLabel: 'Theme:',
    favoriteGenre: 'Favorite Genre',
    favoriteGenreUnknown: 'Not determined',
    reviewsInDb: 'Reviews',
    avgRating: 'Average Rating',
    reviewsHistoryTitle: '📝 Your Reviews History',
    noUserReviews: 'You have no reviews yet.',
    savedToast: 'Profile successfully saved!',
    scrollTop: '↑ Top',
  },
};

const THEMES = {
  space: {
    name: { ru: '🌌 Космическая ночь', en: '🌌 Space Night' },
    bg: 'bg-slate-950 text-slate-100',
    header: 'bg-slate-900/80 border-slate-800 text-slate-100',
    card: 'bg-slate-900 border-slate-800 text-slate-100',
    input: 'bg-slate-950 border-slate-800 text-slate-100',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500',
    accentText: 'text-indigo-400',
  },
  vampire: {
    name: { ru: '🧛‍♂️ Вампир (Dark)', en: '🧛‍♂️ Vampire (Dark)' },
    bg: 'bg-neutral-950 text-neutral-100',
    header: 'bg-neutral-900/80 border-red-950 text-neutral-100',
    card: 'bg-neutral-900 border-red-950/50 text-neutral-100',
    input: 'bg-neutral-950 border-neutral-800 text-neutral-100',
    accentBg: 'bg-red-700 hover:bg-red-600',
    accentText: 'text-red-500',
  },
  forest: {
    name: { ru: '🌲 Лесной мох', en: '🌲 Forest Moss' },
    bg: 'bg-zinc-950 text-emerald-50',
    header: 'bg-zinc-900/80 border-emerald-950 text-emerald-50',
    card: 'bg-zinc-900 border-emerald-900/30 text-emerald-50',
    input: 'bg-zinc-950 border-emerald-950 text-emerald-50',
    accentBg: 'bg-emerald-700 hover:bg-emerald-600',
    accentText: 'text-emerald-400',
  },
  light: {
    name: { ru: '☀️ Светлая классика', en: '☀️ Classic Light' },
    bg: 'bg-gray-100 text-gray-900',
    header: 'bg-white/80 border-gray-200 text-gray-900',
    card: 'bg-white border-gray-200 text-gray-900',
    input: 'bg-gray-50 border-gray-300 text-gray-900',
    accentBg: 'bg-blue-600 hover:bg-blue-500',
    accentText: 'text-blue-600',
  },
  latte: {
    name: { ru: '☕ Теплый латте', en: '☕ Warm Latte' },
    bg: 'bg-stone-100 text-stone-900',
    header: 'bg-stone-200/80 border-stone-300 text-stone-900',
    card: 'bg-stone-200 border-stone-300 text-stone-900',
    input: 'bg-stone-50 border-stone-300 text-stone-900',
    accentBg: 'bg-amber-700 hover:bg-amber-600',
    accentText: 'text-amber-700',
  },
  cyberpunk: {
    name: { ru: '⚡ Киберпанк', en: '⚡ Cyberpunk' },
    bg: 'bg-zinc-950 text-yellow-100',
    header: 'bg-black/90 border-yellow-500/30 text-yellow-100',
    card: 'bg-zinc-900 border-yellow-500/30 text-yellow-100',
    input: 'bg-black border-yellow-500/40 text-yellow-200',
    accentBg: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold',
    accentText: 'text-yellow-400',
  },
  ocean: {
    name: { ru: '🌊 Океанская бриза', en: '🌊 Ocean Breeze' },
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
    const revId = r._id || r.id;
    if (!map[r.movie_id]) map[r.movie_id] = { reviews: [] };
    map[r.movie_id].reviews.push({
      id: revId,
      _id: revId,
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

  const [lang, setLang] = useState('ru');
  const t = translations[lang];

  const [themeKey, setThemeKey] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('cinetrack_theme');
      return savedTheme && THEMES[savedTheme] ? savedTheme : 'space';
    } catch {
      return 'space';
    }
  });
  const currentTheme = THEMES[themeKey] || THEMES.space;

  useEffect(() => {
    try {
      localStorage.setItem('cinetrack_theme', themeKey);
    } catch (err) {
      console.error('Ошибка сохранения темы в localStorage:', err);
    }
  }, [themeKey]);

  const [genres, setGenres] = useState([]);
  const [knownMovies, setKnownMovies] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const [token, setToken] = useState(() => sessionStorage.getItem('cinetrack_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('cinetrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileColor, setProfileColor] = useState(user?.color || 'bg-blue-600');

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

    if (token) {
      verifyToken();
    }
  }, [token]);

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
    const loadReviews = async () => {
      try {
        const resReviews = await fetch(`${API_URL}/reviews`);
        if (resReviews.ok) {
          const reviewsData = await resReviews.json();
          setMovieReviewsMap(buildReviewsMap(reviewsData));
        }
      } catch (err) {
        console.error('Ошибка загрузки отзывов:', err);
      }
    };

    loadReviews();
  }, []);

  const handleLogin = (newToken, userData) => {
    sessionStorage.setItem('cinetrack_token', newToken);
    sessionStorage.setItem('cinetrack_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setProfileName(userData.name || '');
    setProfileAvatar(userData.avatar || '');
    setProfileColor(userData.color || 'bg-blue-600');
    showToast(
      lang === 'en' ? `Welcome, ${userData.name}!` : `Добро пожаловать, ${userData.name}!`
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cinetrack_token');
    sessionStorage.removeItem('cinetrack_user');
    setToken(null);
    setUser(null);
    navigate('/');
    showToast(lang === 'en' ? 'You have logged out' : 'Вы вышли из аккаунта');
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
        body: JSON.stringify({
          name: profileName,
          avatar: profileAvatar,
          color: profileColor,
        }),
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

  const handleUpdateMovie = async (updatedMovie, newReviewPayload) => {
    if (!token) {
      setIsAuthOpen(true);
      showToast(
        lang === 'en' ? 'Sign in to leave reviews' : 'Войдите, чтобы оставлять отзывы'
      );
      return false;
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

      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('cinetrack_token');
        sessionStorage.removeItem('cinetrack_user');
        setToken(null);
        setUser(null);
        setIsAuthOpen(true);
        showToast(
          lang === 'en' ? 'Session expired, please sign in again' : 'Сессия истекла, войдите заново'
        );
        return false;
      }

      if (res.ok) {
        const allReviewsList = await res.json();
        setMovieReviewsMap(buildReviewsMap(allReviewsList));
        showToast(lang === 'en' ? 'Review saved!' : 'Отзыв сохранен!');
        return true;
      }
    } catch (err) {
      console.error('Ошибка сохранения отзыва:', err);
    }
    return false;
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
        showToast(lang === 'en' ? 'Review deleted' : 'Отзыв удален');
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
          allUserReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) /
          userReviewsCount
        ).toFixed(1)
      : '0.0';

  const favoriteGenreName = (() => {
    const genreCounts = {};
    const targetMovieIds = [
      ...new Set(allUserReviews.map((r) => r.movie_id)),
    ];

    targetMovieIds.forEach((mId) => {
      const foundMovie = knownMovies.find((m) => m.id === mId);
      if (foundMovie?.genre_ids) {
        foundMovie.genre_ids.forEach((gId) => {
          genreCounts[gId] = (genreCounts[gId] || 0) + 1;
        });
      }
    });

    const topGenreId = Object.keys(genreCounts).sort(
      (a, b) => genreCounts[b] - genreCounts[a]
    )[0];
    const foundGenreObj = genres.find((g) => g.id === Number(topGenreId));
    return foundGenreObj ? foundGenreObj.name : t.favoriteGenreUnknown;
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
    <FavoritesProvider
      token={token}
      onRequireAuth={() => setIsAuthOpen(true)}
      onNotify={showToast}
      lang={lang}
    >
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
                movieReviewsMap={movieReviewsMap}
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
                movieReviewsMap={movieReviewsMap}
              />
            }
          />
          <Route
            path="movie/:id"
            element={
              <MoviePage
                t={t}
                lang={lang}
                currentTheme={currentTheme}
                user={user}
                movieReviewsMap={movieReviewsMap}
                onUpdateMovie={handleUpdateMovie}
                onDeleteReview={handleDeleteReview}
              />
            }
          />
          <Route
            path="favorites"
            element={
              <FavoritesPage
                t={t}
                lang={lang}
                currentTheme={currentTheme}
                knownMovies={knownMovies}
                movieReviewsMap={movieReviewsMap}
              />
            }
          />
          <Route
            path="profile"
            element={
              <ProfilePage
                t={t}
                lang={lang}
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
                onUpdateReview={handleUpdateMovie}
                onDeleteReview={handleDeleteReview}
                onSelectMovieFromReview={(rev) => navigate(`/movie/${rev.movie_id}`)}
              />
            }
          />
          <Route
            path="admin"
            element={
              <AdminPage
                apiUrl={API_URL}
                token={token}
                user={user}
                lang={lang}
                currentTheme={currentTheme}
                onNotify={showToast}
                onReviewsUpdated={(allReviewsList) =>
                  setMovieReviewsMap(buildReviewsMap(allReviewsList))
                }
              />
            }
          />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage t={t} />} />
        </Route>
      </Routes>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        lang={lang}
      />
    </FavoritesProvider>
  );
}